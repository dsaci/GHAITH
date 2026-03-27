import { supabase } from '../lib/supabase';
import type { Occasion, Transaction, Member, UserRole } from '../types';
import * as mockData from '../data/mockData';

/** Legal association name (القانون 12-06) */
export const ASSOCIATION_LEGAL_NAME = 'جمعية غيث الولائية للعمل الخيري والإنساني';
export const ASSOCIATION_WILAYA = 'ولاية المسيلة';

export type ChannelKey = 'bank' | 'postal' | 'cash';

export interface ChannelBalances {
    opening: number;
    income: number;
    expense: number;
    closing: number;
}

export interface FinancialSummary {
    bank: ChannelBalances;
    postal: ChannelBalances;
    cash: ChannelBalances;
}

export interface DbTransactionRow {
    id?: string;
    transaction_type?: string;
    transactionType?: string;
    amount?: number;
    transaction_date?: string;
    transactionDate?: string;
    payment_method?: string;
    paymentMethod?: string;
    description?: string;
    category?: string;
}

export interface DbOccasionRow {
    id: string;
    title?: string;
    start_date?: string;
    startDate?: string;
    location?: string;
    status?: string;
}

export interface DbMeetingRow {
    id: string;
    meeting_date?: string;
    meetingDate?: string;
    meeting_type?: string;
    meetingType?: string;
    location?: string;
    attendees?: string[];
    status?: string;
}

function channelFromPaymentMethod(m: string | undefined): ChannelKey {
    if (m === 'bank_transfer') return 'bank';
    if (m === 'check') return 'postal';
    return 'cash';
}

function normalizeTx(row: DbTransactionRow): {
    type: 'income' | 'expense';
    amount: number;
    date: string;
    channel: ChannelKey;
    description: string;
    category: string;
    paymentLabel: string;
} | null {
    const type = (row.transaction_type || row.transactionType || '') as string;
    if (type !== 'income' && type !== 'expense') return null;
    const amount = Number(row.amount ?? 0);
    const date = String(row.transaction_date || row.transactionDate || '');
    const pm = String(row.payment_method || row.paymentMethod || 'cash');
    return {
        type,
        amount,
        date,
        channel: channelFromPaymentMethod(pm),
        description: row.description || '',
        category: row.category || '',
        paymentLabel: pm === 'bank_transfer' ? 'البنك' : pm === 'check' ? 'الحساب ج.ب' : 'الصندوق',
    };
}

function emptySummary(): FinancialSummary {
    const z = (): ChannelBalances => ({ opening: 0, income: 0, expense: 0, closing: 0 });
    return { bank: z(), postal: z(), cash: z() };
}

function applyYearMovement(summary: FinancialSummary, rows: DbTransactionRow[], year: number) {
    const yStart = `${year}-01-01`;
    const yEnd = `${year}-12-31`;
    for (const row of rows) {
        const n = normalizeTx(row);
        if (!n) continue;
        if (n.date < yStart || n.date > yEnd) continue;
        const ch = summary[n.channel];
        if (n.type === 'income') ch.income += n.amount;
        else ch.expense += n.amount;
    }
    (['bank', 'postal', 'cash'] as const).forEach((k) => {
        const c = summary[k];
        c.closing = c.opening + c.income - c.expense;
    });
}

function openingFromPriorRows(rows: DbTransactionRow[], year: number): FinancialSummary {
    const summary = emptySummary();
    const cutoff = `${year}-01-01`;
    for (const row of rows) {
        const n = normalizeTx(row);
        if (!n || n.date >= cutoff) continue;
        const ch = summary[n.channel];
        if (n.type === 'income') ch.opening += n.amount;
        else ch.opening -= n.amount;
    }
    (['bank', 'postal', 'cash'] as const).forEach((k) => {
        const c = summary[k];
        c.closing = c.opening + c.income - c.expense;
    });
    return summary;
}

/**
 * Aggregates transactions from Supabase for the given year (and opening from all prior dates).
 */
export async function getFinancialSummary(year: number): Promise<FinancialSummary> {
    const cutoff = `${year}-01-01`;
    const end = `${year}-12-31`;

    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .lt('transaction_date', `${year + 1}-01-01`)
            .order('transaction_date', { ascending: true });

        if (error) throw error;
        if (data && data.length) {
            const opening = openingFromPriorRows(data as DbTransactionRow[], year);
            applyYearMovement(opening, data as DbTransactionRow[], year);
            return opening;
        }
    } catch {
        /* fall through to mock */
    }

    const mockRows: DbTransactionRow[] = mockData.MOCK_TRANSACTIONS.map((t: Transaction) => ({
        transaction_type: t.transactionType,
        amount: t.amount,
        transaction_date: t.transactionDate,
        payment_method: t.paymentMethod,
        description: t.description,
        category: t.category,
    }));

    const prior = mockRows.filter((r) => {
        const d = r.transaction_date || '';
        return d < cutoff;
    });
    const summary = openingFromPriorRows(prior, year);
    const inYear = mockRows.filter((r) => {
        const d = r.transaction_date || '';
        return d >= cutoff && d <= end;
    });
    applyYearMovement(summary, inYear, year);
    return summary;
}

export interface YearTransactionRow {
    id: string;
    date: string;
    description: string;
    category: string;
    amount: number;
    channelLabel: string;
    type: 'income' | 'expense';
}

export async function getTransactionsForYear(year: number): Promise<YearTransactionRow[]> {
    const start = `${year}-01-01`;
    const end = `${year}-12-31`;

    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .gte('transaction_date', start)
            .lte('transaction_date', end)
            .order('transaction_date', { ascending: true });

        if (!error && data?.length) {
            return (data as DbTransactionRow[])
                .map((row, i) => {
                    const n = normalizeTx(row);
                    if (!n) return null;
                    return {
                        id: String(row.id ?? i),
                        date: n.date,
                        description: n.description,
                        category: n.category,
                        amount: n.amount,
                        channelLabel: n.paymentLabel,
                        type: n.type,
                    };
                })
                .filter(Boolean) as YearTransactionRow[];
        }
    } catch {
        /* mock */
    }

    return mockData.MOCK_TRANSACTIONS.filter((t) => t.transactionDate >= start && t.transactionDate <= end).map((t) => ({
        id: t.id,
        date: t.transactionDate,
        description: t.description,
        category: t.category,
        amount: t.amount,
        channelLabel: t.paymentMethod === 'bank_transfer' ? 'البنك' : t.paymentMethod === 'check' ? 'الحساب ج.ب' : 'الصندوق',
        type: t.transactionType,
    }));
}

/**
 * Occasions for literary report (year filter on start_date / year column).
 */
export async function getActivitiesByYear(year: number): Promise<Occasion[]> {
    const start = `${year}-01-01`;
    const end = `${year}-12-31`;

    try {
        const { data, error } = await supabase
            .from('occasions')
            .select('*')
            .gte('start_date', start)
            .lte('start_date', end)
            .order('start_date', { ascending: true });

        if (!error && data?.length) {
            return (data as Record<string, unknown>[]).map((o) => ({
                id: String(o.id),
                title: String(o.title ?? ''),
                occasionType: (o.occasion_type || o.occasionType || 'other') as Occasion['occasionType'],
                description: (o.description as string) || undefined,
                startDate: String(o.start_date || o.startDate || ''),
                endDate: (o.end_date || o.endDate) as string | undefined,
                location: (o.location as string) || undefined,
                actualBeneficiariesCount: (o.actual_beneficiaries_count ?? o.actualBeneficiariesCount) as number | undefined,
                status: (o.status || 'completed') as Occasion['status'],
                createdBy: String(o.created_by || o.createdBy || ''),
                createdAt: String(o.created_at || o.createdAt || ''),
            }));
        }

        const { data: yData, error: yErr } = await supabase.from('occasions').select('*').eq('year', year);
        if (!yErr && yData?.length) {
            return (yData as Record<string, unknown>[]).map((o) => ({
                id: String(o.id),
                title: String(o.title ?? ''),
                occasionType: (o.occasion_type || o.occasionType || 'other') as Occasion['occasionType'],
                description: (o.description as string) || undefined,
                startDate: String(o.start_date || o.startDate || ''),
                endDate: (o.end_date || o.endDate) as string | undefined,
                location: (o.location as string) || undefined,
                actualBeneficiariesCount: (o.actual_beneficiaries_count ?? o.actualBeneficiariesCount) as number | undefined,
                status: (o.status || 'completed') as Occasion['status'],
                createdBy: String(o.created_by || o.createdBy || ''),
                createdAt: String(o.created_at || o.createdAt || ''),
            }));
        }
    } catch {
        /* mock */
    }

    return mockData.MOCK_OCCASIONS.filter((o) => o.startDate >= start && o.startDate <= end);
}

export interface GeneralMeetingInfo {
    meetingDate: string;
    location?: string;
    attendees: string[];
    status?: string;
}

export async function getLastGeneralMeeting(): Promise<GeneralMeetingInfo | null> {
    try {
        const { data, error } = await supabase
            .from('meetings')
            .select('*')
            .eq('meeting_type', 'general')
            .order('meeting_date', { ascending: false })
            .limit(1);

        if (!error && data?.[0]) {
            const m = data[0] as DbMeetingRow & Record<string, unknown>;
            return {
                meetingDate: String(m.meeting_date || m.meetingDate || ''),
                location: (m.location as string) || undefined,
                attendees: (m.attendees as string[]) || [],
                status: (m.status as string) || undefined,
            };
        }
    } catch {
        /* mock */
    }

    const list = mockData.MOCK_MEETINGS.filter((m) => m.meetingType === 'general');
    const last = list.sort((a, b) => b.meetingDate.localeCompare(a.meetingDate))[0];
    if (!last) return null;
    return {
        meetingDate: last.meetingDate,
        location: last.location,
        attendees: last.attendees || [],
        status: last.status,
    };
}

/** Active members considered part of or relevant to المكتب count heuristic */
export async function getBoardAttendeesCount(): Promise<number> {
    try {
        const { data, error } = await supabase.from('members').select('id, status, role_in_association, membership_type').eq('status', 'active');

        if (!error && data?.length) {
            const boardish = (data as { role_in_association?: string; membership_type?: string }[]).filter((m) => {
                const r = (m.role_in_association || '').toLowerCase();
                return (
                    r.includes('مكتب') ||
                    r.includes('رئيس') ||
                    r.includes('نائب') ||
                    r.includes('أمين') ||
                    m.membership_type === 'founder'
                );
            });
            return boardish.length || data.length;
        }
    } catch {
        /* mock */
    }

    return mockData.MOCK_MEMBERS.filter(
        (m: Member) =>
            m.status === 'active' &&
            (m.roleInAssociation || '').length > 0 &&
            (/مكتب|رئيس|نائب|أمين|المال/i.test(m.roleInAssociation || '') || m.membershipType === 'founder')
    ).length;
}

export async function getActiveMembersCount(): Promise<number> {
    try {
        const { count, error } = await supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'active');
        if (!error && count != null) return count;
    } catch {
        /* mock */
    }
    return mockData.MOCK_MEMBERS.filter((m) => m.status === 'active').length;
}

export async function getLastReportYear(reportType: 'literary' | 'financial'): Promise<number | null> {
    try {
        const { data, error } = await supabase
            .from('saved_reports')
            .select('report_year')
            .eq('report_type', reportType)
            .order('report_year', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!error && data && typeof (data as { report_year: number }).report_year === 'number') {
            return (data as { report_year: number }).report_year;
        }
    } catch {
        /* documents fallback */
    }

    try {
        const { data, error } = await supabase
            .from('documents')
            .select('report_year, document_type')
            .eq('document_type', reportType === 'literary' ? 'literary_report' : 'financial_report')
            .order('report_year', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!error && data && typeof (data as { report_year?: number }).report_year === 'number') {
            return (data as { report_year: number }).report_year;
        }
    } catch {
        /* mock */
    }

    const fromMock = mockData.MOCK_DOCUMENTS.filter((d) =>
        reportType === 'literary' ? d.documentType === 'literary_report' : d.documentType === 'financial_report'
    );
    if (!fromMock.length) return null;
    const years = fromMock
        .map((d) => parseInt(d.title.match(/\d{4}/)?.[0] || '0', 10))
        .filter((n) => n > 0);
    return years.length ? Math.max(...years) : null;
}

export type SaveReportInput = {
    report_type: 'literary' | 'financial';
    report_year: number;
    title: string;
    data: Record<string, unknown>;
    pdf_url?: string;
    docx_url?: string;
    status?: 'draft' | 'final' | 'submitted';
    created_by: string;
};

export async function saveReport(input: SaveReportInput) {
    const row = {
        ...input,
        status: input.status || 'final',
        updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('saved_reports').insert(row).select().single();
    if (error) throw error;
    return data;
}

export interface DocumentInsert {
    title: string;
    document_type: string;
    file_url: string;
    file_type: string;
    report_year: number;
    status: 'draft' | 'pending_approval' | 'approved' | 'archived';
    uploaded_by: string;
    uploader_name: string;
    is_confidential?: boolean;
    description?: string;
}

export async function saveDocumentToPlatform(doc: DocumentInsert) {
    const payload: Record<string, unknown> = {
        title: doc.title,
        document_type: doc.document_type,
        file_url: doc.file_url,
        file_type: doc.file_type,
        report_year: doc.report_year,
        status: doc.status,
        uploaded_by: doc.uploaded_by,
        uploader_name: doc.uploader_name,
        is_confidential: doc.is_confidential ?? false,
        upload_date: new Date().toISOString().slice(0, 10),
        description: doc.description,
    };

    const { data, error } = await supabase.from('documents').insert(payload).select().single();
    if (error) throw error;
    return data;
}

export interface ReportReminderRow {
    id: string;
    report_type: 'literary' | 'financial';
    reminder_date: string;
    period?: string;
    target_roles?: string[];
    message?: string;
    is_sent: boolean;
    is_acknowledged: boolean;
    year: number;
}

const TARGET_ROLES: UserRole[] = ['president', 'vice_president', 'treasurer'];

export async function getReminders(userRole: UserRole | undefined): Promise<ReportReminderRow[]> {
    const y = new Date().getFullYear();

    try {
        const { data, error } = await supabase
            .from('report_reminders')
            .select('*')
            .eq('year', y)
            .order('reminder_date', { ascending: true });

        if (!error && data) {
            return data as ReportReminderRow[];
        }
    } catch {
        /* mock below */
    }

    const local: ReportReminderRow[] = [
        {
            id: 'local-1',
            report_type: 'literary',
            reminder_date: `${y}-02-28`,
            period: 'annual',
            message: `موعد تسليم التقرير الأدبي لسنة ${y} اقترب`,
            is_sent: false,
            is_acknowledged: false,
            year: y,
            target_roles: TARGET_ROLES,
        },
        {
            id: 'local-2',
            report_type: 'financial',
            reminder_date: `${y}-03-31`,
            period: 'annual',
            message: `موعد تسليم التقرير المالي لسنة ${y} اقترب`,
            is_sent: false,
            is_acknowledged: false,
            year: y,
            target_roles: TARGET_ROLES,
        },
    ];
    return local.filter((r) => !userRole || !r.target_roles?.length || r.target_roles.includes(userRole));
}

export async function acknowledgeReminder(id: string) {
    if (id.startsWith('local-')) return;
    const { error } = await supabase.from('report_reminders').update({ is_acknowledged: true }).eq('id', id);
    if (error) throw error;
}

/** Inserts the five annual reminders if none exist for the given year. */
export async function ensureAnnualReportReminders(year: number) {
    const templates: Omit<ReportReminderRow, 'id'>[] = [
        {
            report_type: 'literary',
            reminder_date: `${year}-02-28`,
            period: 'annual',
            target_roles: TARGET_ROLES,
            message: `موعد تسليم التقرير الأدبي لسنة ${year} اقترب`,
            is_sent: false,
            is_acknowledged: false,
            year,
        },
        {
            report_type: 'literary',
            reminder_date: `${year}-03-15`,
            period: 'annual',
            target_roles: TARGET_ROLES,
            message: `آخر أجل للتقرير الأدبي ${year}`,
            is_sent: false,
            is_acknowledged: false,
            year,
        },
        {
            report_type: 'financial',
            reminder_date: `${year}-03-31`,
            period: 'annual',
            target_roles: TARGET_ROLES,
            message: `موعد تسليم التقرير المالي لسنة ${year} اقترب`,
            is_sent: false,
            is_acknowledged: false,
            year,
        },
        {
            report_type: 'financial',
            reminder_date: `${year}-04-15`,
            period: 'annual',
            target_roles: TARGET_ROLES,
            message: `آخر أجل للتقرير المالي ${year}`,
            is_sent: false,
            is_acknowledged: false,
            year,
        },
        {
            report_type: 'literary',
            reminder_date: `${year}-12-01`,
            period: 'annual',
            target_roles: TARGET_ROLES,
            message: `تذكير: ابدأ تجهيز تقارير سنة ${year}`,
            is_sent: false,
            is_acknowledged: false,
            year,
        },
    ];

    try {
        const { data: existing } = await supabase.from('report_reminders').select('id').eq('year', year).limit(1);
        if (existing?.length) return;

        const { error } = await supabase.from('report_reminders').insert(templates);
        if (error) throw error;
    } catch {
        /* table missing — ignore */
    }
}

export async function insertReportNotifications(year: number, message: string) {
    try {
        await supabase.from('notifications').insert({
            title: 'تذكير تقرير',
            body: message,
            year,
            target_roles: TARGET_ROLES,
            read: false,
        });
    } catch {
        /* optional table */
    }
}

export async function getUnreadReportNotificationCount(): Promise<number> {
    try {
        const { count, error } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('read', false);
        if (!error && count != null) return count;
    } catch {
        /* */
    }
    return 0;
}
