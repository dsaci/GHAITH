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
    await supabase.auth.signOut()
    useAuthStore.getState().clearAll();
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
  }
}
