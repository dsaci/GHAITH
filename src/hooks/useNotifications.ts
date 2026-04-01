import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

export interface AppNotification {
    id: string;
    type: 'help_request' | 'registration' | 'volunteer';
    title: string;
    body: string;
    timestamp: string;
    read: boolean;
    link: string;
}

const POLL_INTERVAL_MS = 30_000; // 30 seconds
const STORAGE_KEY = 'ghaith_read_notifications';

function getReadIds(): Set<string> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch {
        return new Set();
    }
}

function saveReadIds(ids: Set<string>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

const TYPE_LABEL: Record<string, string> = {
    financial_aid: 'مالية', food_aid: 'غذائية', medical_aid: 'طبية',
    educational_aid: 'تعليمية', space_request: 'فضاء', other: 'أخرى',
};
const URG_ICON: Record<string, string> = {
    urgent: '🔴', high: '🟠', medium: '🟡', low: '🟢',
};
const URG_LABEL: Record<string, string> = {
    urgent: 'عاجل جداً', high: 'عالٍ', medium: 'متوسط', low: 'منخفض',
};
const REG_LABEL: Record<string, string> = {
    volunteer: 'متطوع', beneficiary: 'مستفيد', donor: 'محسن',
};

export function useNotifications() {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(false);
    const readIds = useRef<Set<string>>(getReadIds());

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [reqRes, regRes] = await Promise.allSettled([
                // Pending help requests — use base table (has created_at + urgency)
                supabase
                    .from('portal_requests')
                    .select('id, request_type, urgency, created_at, requester_id')
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false })
                    .limit(15),

                // Pending portal registrations
                supabase
                    .from('external_users')
                    .select('id, full_name, portal_type, created_at')
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false })
                    .limit(15),
            ]);

            const current = readIds.current;
            const items: AppNotification[] = [];

            // Help requests
            if (reqRes.status === 'fulfilled' && reqRes.value.data) {
                for (const r of reqRes.value.data) {
                    items.push({
                        id: `req_${r.id}`,
                        type: 'help_request',
                        title: `طلب مساعدة ${TYPE_LABEL[r.request_type] ?? ''} جديد`,
                        body: `${URG_ICON[r.urgency] ?? '●'} إلحاح: ${URG_LABEL[r.urgency] ?? r.urgency} — بانتظار المراجعة`,
                        timestamp: r.created_at,
                        read: current.has(`req_${r.id}`),
                        link: '/requests',
                    });
                }
            }

            // Registrations
            if (regRes.status === 'fulfilled' && regRes.value.data) {
                for (const u of regRes.value.data) {
                    items.push({
                        id: `reg_${u.id}`,
                        type: u.portal_type === 'volunteer' ? 'volunteer' : 'registration',
                        title: `تسجيل ${REG_LABEL[u.portal_type] ?? 'جديد'} جديد`,
                        body: `${u.full_name ?? 'مجهول'} — بانتظار مراجعة الطلب والموافقة`,
                        timestamp: u.created_at,
                        read: current.has(`reg_${u.id}`),
                        link: '/admin/portal/pending',
                    });
                }
            }

            // Sort newest first
            items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setNotifications(items);
        } catch (err) {
            console.warn('[Notifications] fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch + polling every 30s
    useEffect(() => {
        fetchAll();
        const timer = setInterval(fetchAll, POLL_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [fetchAll]);

    const markAsRead = useCallback((id: string) => {
        readIds.current.add(id);
        saveReadIds(readIds.current);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, []);

    const markAllRead = useCallback(() => {
        setNotifications(prev => {
            const next = prev.map(n => ({ ...n, read: true }));
            next.forEach(n => readIds.current.add(n.id));
            saveReadIds(readIds.current);
            return next;
        });
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    return { notifications, unreadCount, loading, refetch: fetchAll, markAsRead, markAllRead };
}
