import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export const authService = {
  async loginInternal(email: string, password: string) {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (authError) throw authError
    
    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    if (profileError) throw profileError
    
    // Update last login
    await supabase
      .from('user_profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', authData.user.id)
    
    // Log activity
    await authService.logAuditAction('login', 'session');
    
    // Update store
    useAuthStore.getState().setInternalUser({
        id: profile.id,
        fullName: profile.full_name,
        username: email,
        email: email,
        phone: profile.phone,
        role: profile.role,
        branchId: profile.branch_id,
        isActive: profile.is_active,      
    });
    
    return { user: authData.user, profile }
  },
  
  async loginExternal(email: string, password: string) {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (authError) throw authError
    
    // Fetch external user profile
    const { data: externalProfile, error: profileError } = await supabase
      .from('external_users')
      .select('*')
      .eq('auth_id', authData.user.id)
      .single()
    
    if (profileError) throw profileError
    
    return { user: authData.user, externalProfile }
  },
  
  async registerExternal(portalType: string, formData: any) {
    // Sign up in auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    })
    
    if (authError) throw authError
    
    // Create external user
    const { data: externalUser, error: externalError } = await supabase
      .from('external_users')
      .insert({
        auth_id: authData.user!.id,
        portal_type: portalType,
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email,
        status: 'pending',
      })
      .select()
      .single()
    
    if (externalError) throw externalError
    
    // Create specific portal profile
    if (portalType === 'volunteer') {
      await supabase.from('volunteers').insert({
        external_user_id: externalUser.id,
        ...formData.volunteerData,
      })
    } else if (portalType === 'donor') {
      await supabase.from('donor_profiles').insert({
        external_user_id: externalUser.id,
        ...formData.donorData,
      })
    }
    
    return externalUser
  },
  
  async logout() {
    // Log activity before clearing
    await authService.logAuditAction('logout', 'session');
    
    await supabase.auth.signOut()
    useAuthStore.getState().clearAll();
    localStorage.removeItem('ghaith_beneficiary_session');
  },

  async restoreSession() {
    const { data } = await supabase.auth.getSession()
    if (!data.session) return null
    
    // Check if internal user
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.session.user.id)
      .single()
      
    if (profile) {
      useAuthStore.getState().setInternalUser({
        id: profile.id,
        fullName: profile.full_name,
        username: data.session.user.email || '',
        email: data.session.user.email || '',
        phone: profile.phone,
        role: profile.role,
        branchId: profile.branch_id,
        isActive: profile.is_active,
      })
      return true;
    }

    // Check if external user
    const { data: extProfile } = await supabase
      .from('external_users')
      .select('*')
      .eq('auth_id', data.session.user.id)
      .single()

    if (extProfile) {
      useAuthStore.getState().setExternalSession({
        authId: data.session.user.id,
        externalUserId: extProfile.id,
        portalType: extProfile.portal_type,
        status: extProfile.status,
        fullName: extProfile.full_name,
      })
      return true;
    }
    return false;
  },

  async loginBeneficiary(regNo: string, phone: string) {
    const cleanRegNo = regNo.trim();
    const cleanPhone = phone.trim();

    // Use RPC instead of direct table query to bypass RLS safely
    // This allows public (anon) roles to verify credentials without SELECT access to the full table
    const { data, error } = await supabase.rpc('verify_beneficiary', {
        p_reg_no: cleanRegNo,
        p_phone: cleanPhone
    });

    if (error) {
        console.error('Beneficiary login error:', error);
        throw new Error('حدث خطأ في الاتصال بقاعدة البيانات');
    }
    
    // RPC returns an array
    const family = data && data.length > 0 ? data[0] : null;

    if (!family) throw new Error('بيانات الدخول غير صحيحة. يرجى التأكد من رقم التسجيل ورقم الهاتف.');

    const session = {
        familyId: family.id,
        familyName: family.family_name,
        registrationNumber: family.registration_number,
    };

    useAuthStore.getState().setBeneficiarySession(session);
    
    // Log activity
    await authService.logAuditAction('login', 'beneficiary_portal', session.familyId);
    
    // Simple session persistence for beneficiary
    localStorage.setItem('ghaith_beneficiary_session', JSON.stringify(session));

    return session;
  },

  async restoreBeneficiarySession() {
    const saved = localStorage.getItem('ghaith_beneficiary_session');
    if (saved) {
        const session = JSON.parse(saved);
        useAuthStore.getState().setBeneficiarySession(session);
        return true;
    }
    return false;
  },

  async logAuditAction(action: 'login' | 'logout' | 'create' | 'update' | 'delete', resourceType: string, resourceId?: string, details?: any) {
    const { data: { user } } = await supabase.auth.getUser();
    const beneficiarySession = useAuthStore.getState().beneficiarySession;
    
    const log = {
        user_id: user?.id || beneficiarySession?.familyId || null,
        user_type: user ? 'internal' : (beneficiarySession ? 'beneficiary' : null),
        action: action,
        resource_type: resourceType,
        resource_id: resourceId,
        new_values: details ? JSON.stringify(details) : null,
    };

    try {
        await supabase.from('audit_logs').insert(log);
    } catch (e) {
        console.error('Audit log failed:', e);
    }
  }
}
