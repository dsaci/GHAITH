import { supabase } from '../lib/supabase';

export const loginNotificationService = {
  async recordLogin(userId: string) {
    try {
      const { error } = await supabase
        .from('login_history')
        .insert({
          user_id: userId,
          login_time: new Date().toISOString(),
          ip_address: '0.0.0.0', // Requires edge function for accuracy
          user_agent: navigator.userAgent
        });
        
      if (error) {
        console.warn('Could not record login history', error);
      }
    } catch (e) {
      console.warn('Login recording failed safely:', e);
    }
  }
};
