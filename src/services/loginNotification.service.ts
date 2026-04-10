import { supabase } from '../lib/supabase';

export const loginNotificationService = {
  async recordLogin(userId: string) {
    if (!userId) return;
    
    try {
      // Use the RPC for precise, combined activity and login tracking
      const { error } = await supabase.rpc('track_user_login', {
        p_user_agent: navigator.userAgent,
        p_ip_address: 'client-logged'
      });
        
      if (error) {
        console.warn('Could not record login via RPC, falling back to direct insert', error);
        // Fallback for safety
        await supabase
          .from('login_history')
          .insert({
            user_id: userId,
            login_time: new Date().toISOString(),
            ip_address: '0.0.0.0',
            user_agent: navigator.userAgent
          });
      }
    } catch (e) {
      console.warn('Login recording failed safely:', e);
    }
  }
};

