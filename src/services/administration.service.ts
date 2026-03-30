import { supabase } from '../lib/supabase';
import type { Mail, Meeting, InventoryItem } from '../types';

export const administrationService = {
    // --- Mail Registry ---
    async getMails() {
        const { data, error } = await supabase
            .from('mails')
            .select('*')
            .order('mail_date', { ascending: false });
        if (error) throw error;
        return data as Mail[];
    },

    async createMail(mail: Omit<Mail, 'id' | 'createdAt'>) {
        const { data, error } = await supabase
            .from('mails')
            .insert([mail])
            .select()
            .single();
        if (error) throw error;
        return data as Mail;
    },

    // --- Meetings ---
    async getMeetings() {
        const { data, error } = await supabase
            .from('meetings')
            .select('*')
            .order('meeting_date', { ascending: false });
        if (error) throw error;
        return data as Meeting[];
    },

    async createMeeting(meeting: Omit<Meeting, 'id' | 'createdAt'>) {
        const { data, error } = await supabase
            .from('meetings')
            .insert([meeting])
            .select()
            .single();
        if (error) throw error;
        return data as Meeting;
    },

    // --- Inventory ---
    async getInventory() {
        const { data, error } = await supabase
            .from('inventory_items')
            .select('*')
            .order('item_name');
        if (error) throw error;
        return data as InventoryItem[];
    },

    async createInventoryItem(item: Omit<InventoryItem, 'id' | 'createdAt'>) {
        const { data, error } = await supabase
            .from('inventory_items')
            .insert([item])
            .select()
            .single();
        if (error) throw error;
        return data as InventoryItem;
    }
};
