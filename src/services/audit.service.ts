import { supabase } from '../lib/supabase';

export interface AuditLog {
    id: string;
    created_at: string;
    user_id: string;
    user_type: string;
    full_name: string;
    action: string;
    resource_type: string;
    resource_id: string;
    new_values: any;
}

export const auditService = {
    async getLogs(params?: { limit?: number; offset?: number }) {
        try {
            const { data, error } = await supabase.rpc('get_audit_logs_v2', {
                p_limit: params?.limit || 100,
                p_offset: params?.offset || 0
            });
            
            if (error) throw error;
            return { data: data || [], error: null };
        } catch (err: any) {
            console.error("Audit Logs RPC Fetch Error:", err);
            return { data: [], error: err };
        }
    }
};
