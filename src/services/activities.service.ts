import { supabase } from '../lib/supabase';
import type { Occasion, OccasionStatus, OccasionType, FamilyBenefit, BenefitType, Family } from '../types';
import * as mockData from '../data/mockData';
import { ASSOCIATION_INFO } from '../data/associationInfo';

export interface ActivityFilters {
    year?: number | 'all';
    type?: OccasionType | 'all';
    status?: OccasionStatus | 'all';
    branchId?: string | 'all';
    search?: string;
}

export interface AnnualSummary {
    totalActivities: number;
    completedCount: number;
    plannedCount: number;
    inProgressCount: number;
    totalBeneficiaries: number;
    totalBudgetSpent: number;
}

export interface CalendarMarker {
    id: string;
    date: string;
    title: string;
    occasionType: OccasionType;
    source: 'database' | 'template';
}

export interface ActivityFormPayload {
    title: string;
    occasionType: OccasionType;
    subType?: string;
    startDate: string;
    endDate?: string;
    location: string;
    municipalityName?: string;
    targetBeneficiariesCount?: number;
    budgetPlanned?: number;
    responsibleMemberId?: string;
    responsibleMemberName?: string;
    branchId?: string;
    partners?: string;
    description?: string;
    status: OccasionStatus;
    notes?: string;
    budgetActual?: number;
    actualBeneficiariesCount?: number;
    postReport?: string;
    photosUrls?: string[];
    documentUrls?: string[];
}

export interface BenefitDraft {
    familyId: string;
    benefitType: BenefitType;
    quantity?: number;
    amount?: number;
    notes?: string;
    benefitDate: string;
}

/* ─── in-memory mock store (when Supabase unavailable) ─── */
let mockOccasions: Occasion[] | null = null;
let mockBenefits: FamilyBenefit[] | null = null;

function initMockOccasions(): Occasion[] {
    if (!mockOccasions) {
        mockOccasions = mockData.MOCK_OCCASIONS.map((o) => ({
            ...o,
            isDeleted: false,
            photosUrls: o.photosUrls ?? [],
            documentUrls: o.documentUrls ?? [],
        }));
    }
    return mockOccasions;
}

function initMockBenefits(): FamilyBenefit[] {
    if (!mockBenefits) {
        mockBenefits = mockData.MOCK_BENEFITS.map((b) => ({ ...b }));
    }
    return mockBenefits;
}

function memberNameById(id?: string): string | undefined {
    if (!id) return undefined;
    return mockData.MOCK_MEMBERS.find((m) => m.id === id)?.fullName;
}

function mapRowToOccasion(row: Record<string, unknown>): Occasion {
    const rid = row.responsible_member_id ?? row.responsibleMemberId;
    const mid = rid ? String(rid) : undefined;
    return {
        id: String(row.id),
        title: String(row.title ?? ''),
        occasionType: (row.occasion_type ?? row.occasionType ?? 'other') as OccasionType,
        subType: (row.sub_type ?? row.subType) as string | undefined,
        description: (row.description as string) || undefined,
        startDate: String(row.start_date ?? row.startDate ?? '').slice(0, 10),
        endDate: row.end_date || row.endDate ? String(row.end_date ?? row.endDate).slice(0, 10) : undefined,
        location: (row.location as string) || undefined,
        municipalityName: (row.municipality_name ?? row.municipalityName) as string | undefined,
        targetBeneficiariesCount: (row.target_beneficiaries_count ?? row.targetBeneficiariesCount) as number | undefined,
        actualBeneficiariesCount: (row.actual_beneficiaries_count ?? row.actualBeneficiariesCount) as number | undefined,
        budgetPlanned: (row.budget_planned ?? row.budgetPlanned) as number | undefined,
        budgetActual: (row.budget_actual ?? row.budgetActual) as number | undefined,
        status: (row.status ?? 'planned') as OccasionStatus,
        responsibleMemberName: (row.responsible_member_name ?? row.responsibleMemberName) as string | undefined,
        responsibleMemberId: mid,
        branchId: (row.branch_id ?? row.branchId) as string | undefined,
        branchName: (row.branch_name ?? row.branchName) as string | undefined,
        report: (row.report as string) || undefined,
        notes: ((row.notes ?? row.report) as string) || undefined,
        partners: (row.partners as string) || undefined,
        postReport: (row.post_report ?? row.postReport) as string | undefined,
        photosUrls: (row.photos_urls as string[]) || (row.photosUrls as string[]) || [],
        documentUrls: (row.document_urls as string[]) || (row.documentUrls as string[]) || [],
        isRecurring: Boolean(row.is_recurring ?? row.isRecurring),
        recurrencePattern: (row.recurrence_pattern ?? row.recurrencePattern) as Occasion['recurrencePattern'],
        isDeleted: Boolean(row.is_deleted ?? row.isDeleted),
        createdBy: String(row.created_by ?? row.createdBy ?? ''),
        createdAt: String(row.created_at ?? row.createdAt ?? ''),
    };
}

function occasionToRow(o: Partial<Occasion> & { title: string; occasionType: OccasionType; startDate: string; status: OccasionStatus }) {
    return {
        title: o.title,
        occasion_type: o.occasionType,
        sub_type: o.subType ?? null,
        description: o.description ?? null,
        start_date: o.startDate,
        end_date: o.endDate ?? null,
        location: o.location ?? null,
        municipality_name: o.municipalityName ?? null,
        target_beneficiaries_count: o.targetBeneficiariesCount ?? null,
        actual_beneficiaries_count: o.actualBeneficiariesCount ?? null,
        budget_planned: o.budgetPlanned ?? null,
        budget_actual: o.budgetActual ?? null,
        status: o.status,
        responsible_member_id: o.responsibleMemberId ?? null,
        responsible_member_name: o.responsibleMemberName ?? null,
        branch_id: o.branchId ?? null,
        branch_name: o.branchName ?? null,
        report: o.notes ?? o.report ?? null,
        partners: o.partners ?? null,
        post_report: o.postReport ?? null,
        photos_urls: o.photosUrls ?? [],
        document_urls: o.documentUrls ?? [],
        is_recurring: o.isRecurring ?? false,
        recurrence_pattern: o.recurrencePattern ?? null,
        is_deleted: o.isDeleted ?? false,
    };
}

function applyFilters(list: Occasion[], f: ActivityFilters): Occasion[] {
    return list.filter((o) => {
        if (o.isDeleted) return false;
        if (f.year && f.year !== 'all') {
            const y = new Date(o.startDate).getFullYear();
            if (y !== f.year) return false;
        }
        if (f.type && f.type !== 'all' && o.occasionType !== f.type) return false;
        if (f.status && f.status !== 'all' && o.status !== f.status) return false;
        if (f.branchId && f.branchId !== 'all' && o.branchId !== f.branchId) return false;
        if (f.search?.trim()) {
            const q = f.search.trim().toLowerCase();
            const t = `${o.title} ${o.location ?? ''}`.toLowerCase();
            if (!t.includes(q)) return false;
        }
        return true;
    });
}

export async function getActivities(filters: ActivityFilters = {}): Promise<Occasion[]> {
    try {
        let q = supabase.from('occasions').select('*').order('start_date', { ascending: false });
        const { data, error } = await q;
        if (!error && data?.length !== undefined) {
            let rows = (data as Record<string, unknown>[]).map(mapRowToOccasion).filter((o) => !o.isDeleted);
            return applyFilters(rows, filters);
        }
    } catch {
        /* mock */
    }
    const rows = initMockOccasions();
    return applyFilters(rows, filters);
}

export async function getActivityById(id: string): Promise<Occasion | null> {
    try {
        const { data, error } = await supabase.from('occasions').select('*').eq('id', id).maybeSingle();
        if (!error && data) {
            const o = mapRowToOccasion(data as Record<string, unknown>);
            if (o.isDeleted) return null;
            if (!o.responsibleMemberName && o.responsibleMemberId) {
                o.responsibleMemberName = memberNameById(o.responsibleMemberId);
            }
            return o;
        }
    } catch {
        /* */
    }
    return initMockOccasions().find((o) => o.id === id && !o.isDeleted) ?? null;
}

export async function createActivity(payload: ActivityFormPayload, createdBy: string): Promise<Occasion> {
    const branchName = payload.branchId ? mockData.MOCK_BRANCHES.find((b) => b.id === payload.branchId)?.branchName : undefined;
    const respName = payload.responsibleMemberName || memberNameById(payload.responsibleMemberId);
    const newOcc: Occasion = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `o-${Date.now()}`,
        title: payload.title,
        occasionType: payload.occasionType,
        subType: payload.subType,
        description: payload.description,
        startDate: payload.startDate,
        endDate: payload.endDate,
        location: payload.location,
        municipalityName: payload.municipalityName,
        targetBeneficiariesCount: payload.targetBeneficiariesCount,
        budgetPlanned: payload.budgetPlanned,
        budgetActual: payload.budgetActual,
        actualBeneficiariesCount: payload.actualBeneficiariesCount,
        status: payload.status,
        responsibleMemberId: payload.responsibleMemberId,
        responsibleMemberName: respName,
        branchId: payload.branchId,
        branchName,
        partners: payload.partners,
        postReport: payload.postReport,
        photosUrls: payload.photosUrls ?? [],
        documentUrls: payload.documentUrls ?? [],
        report: payload.notes,
        notes: payload.notes,
        createdBy,
        createdAt: new Date().toISOString(),
        isDeleted: false,
    };

    try {
        const row = { ...occasionToRow(newOcc), created_by: createdBy };
        const { data, error } = await supabase.from('occasions').insert(row).select().single();
        if (!error && data) return mapRowToOccasion(data as Record<string, unknown>);
    } catch {
        /* */
    }
    initMockOccasions().unshift(newOcc);
    return newOcc;
}

export async function updateActivity(id: string, payload: Partial<ActivityFormPayload>): Promise<Occasion | null> {
    const existing = await getActivityById(id);
    if (!existing) return null;
    const merged: Occasion = {
        ...existing,
        title: payload.title ?? existing.title,
        occasionType: payload.occasionType ?? existing.occasionType,
        subType: payload.subType ?? existing.subType,
        description: payload.description ?? existing.description,
        startDate: payload.startDate ?? existing.startDate,
        endDate: payload.endDate ?? existing.endDate,
        location: payload.location ?? existing.location,
        municipalityName: payload.municipalityName ?? existing.municipalityName,
        targetBeneficiariesCount: payload.targetBeneficiariesCount ?? existing.targetBeneficiariesCount,
        budgetPlanned: payload.budgetPlanned ?? existing.budgetPlanned,
        budgetActual: payload.budgetActual ?? existing.budgetActual,
        actualBeneficiariesCount: payload.actualBeneficiariesCount ?? existing.actualBeneficiariesCount,
        status: payload.status ?? existing.status,
        responsibleMemberId: payload.responsibleMemberId ?? existing.responsibleMemberId,
        responsibleMemberName: payload.responsibleMemberName ?? memberNameById(payload.responsibleMemberId) ?? existing.responsibleMemberName,
        branchId: payload.branchId ?? existing.branchId,
        branchName: payload.branchId ? mockData.MOCK_BRANCHES.find((b) => b.id === payload.branchId)?.branchName : existing.branchName,
        partners: payload.partners ?? existing.partners,
        postReport: payload.postReport ?? existing.postReport,
        photosUrls: payload.photosUrls ?? existing.photosUrls,
        documentUrls: payload.documentUrls ?? existing.documentUrls,
        report: payload.notes !== undefined ? payload.notes : payload.description !== undefined ? payload.description : existing.report,
        notes: payload.notes ?? existing.notes,
    };

    try {
        const row = occasionToRow(merged);
        const { data, error } = await supabase.from('occasions').update(row).eq('id', id).select().single();
        if (!error && data) return mapRowToOccasion(data as Record<string, unknown>);
    } catch {
        /* */
    }
    const list = initMockOccasions();
    const i = list.findIndex((o) => o.id === id);
    if (i >= 0) list[i] = merged;
    return merged;
}

export async function deleteActivity(id: string): Promise<boolean> {
    try {
        const { error } = await supabase.from('occasions').update({ is_deleted: true }).eq('id', id);
        if (!error) return true;
    } catch {
        /* */
    }
    const o = initMockOccasions().find((x) => x.id === id);
    if (o) o.isDeleted = true;
    return !!o;
}

export async function getActivitiesByYear(year: number | 'all'): Promise<Occasion[]> {
    if (year === 'all') return getActivities({});
    return getActivities({ year });
}

export async function getActivityStats(filters: ActivityFilters): Promise<AnnualSummary> {
    const list = await getActivities(filters);
    const completedCount = list.filter((o) => o.status === 'completed').length;
    const plannedCount = list.filter((o) => o.status === 'planned').length;
    const inProgressCount = list.filter((o) => o.status === 'in_progress').length;
    const totalBeneficiaries = list.reduce((s, o) => s + (o.actualBeneficiariesCount ?? o.targetBeneficiariesCount ?? 0), 0);
    const totalBudgetSpent = list.reduce((s, o) => s + (o.budgetActual ?? 0), 0);
    return {
        totalActivities: list.length,
        completedCount,
        plannedCount,
        inProgressCount,
        totalBeneficiaries,
        totalBudgetSpent,
    };
}

export async function getAnnualSummary(year: number): Promise<AnnualSummary> {
    return getActivityStats({ year });
}

export async function getBenefitsForOccasion(occasionId: string): Promise<(FamilyBenefit & { family?: Family })[]> {
    try {
        const { data, error } = await supabase
            .from('family_benefits')
            .select('*, families(*)')
            .eq('occasion_id', occasionId);
        if (!error && data) {
            return (data as Record<string, unknown>[]).map((row) => {
                const fam = row.families as Record<string, unknown> | null;
                const b: FamilyBenefit = {
                    id: String(row.id),
                    familyId: String(row.family_id ?? row.familyId),
                    benefitType: (row.benefit_type ?? row.benefitType) as BenefitType,
                    amount: row.amount as number | undefined,
                    quantity: row.quantity as number | undefined,
                    description: row.description as string | undefined,
                    benefitDate: String(row.benefit_date ?? row.benefitDate ?? '').slice(0, 10),
                    occasionId: String(row.occasion_id ?? row.occasionId ?? ''),
                    approvedBy: String(row.approved_by ?? row.approvedBy ?? ''),
                    notes: row.notes as string | undefined,
                    createdAt: String(row.created_at ?? row.createdAt ?? ''),
                };
                let family: Family | undefined;
                if (fam) {
                    family = mockData.MOCK_FAMILIES.find((f) => f.id === b.familyId) ?? {
                        id: String(fam.id),
                        familyName: String(fam.family_name ?? fam.familyName ?? ''),
                        category: fam.category as Family['category'],
                        municipalityName: String(fam.municipality_name ?? fam.municipalityName ?? ''),
                    } as Family;
                }
                return { ...b, family: family ?? mockData.MOCK_FAMILIES.find((f) => f.id === b.familyId) };
            });
        }
    } catch {
        /* */
    }
    return initMockBenefits()
        .filter((b) => b.occasionId === occasionId)
        .map((b) => ({
            ...b,
            family: mockData.MOCK_FAMILIES.find((f) => f.id === b.familyId),
        }));
}

export async function addBeneficiariesToActivity(activityId: string, rows: BenefitDraft[], approvedBy: string): Promise<void> {
    const inserts = rows.map((r) => ({
        family_id: r.familyId,
        benefit_type: r.benefitType,
        quantity: r.quantity ?? null,
        amount: r.amount ?? null,
        notes: r.notes ?? null,
        benefit_date: r.benefitDate,
        occasion_id: activityId,
        approved_by: approvedBy,
    }));

    try {
        const { error } = await supabase.from('family_benefits').insert(inserts);
        if (!error) return;
    } catch {
        /* */
    }

    const b = initMockBenefits();
    for (const r of rows) {
        b.push({
            id: `fb-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            familyId: r.familyId,
            benefitType: r.benefitType,
            quantity: r.quantity,
            amount: r.amount,
            notes: r.notes,
            benefitDate: r.benefitDate,
            occasionId: activityId,
            approvedBy,
            createdAt: new Date().toISOString(),
        });
    }
}

export function getFixedCalendarMarkers(year: number): CalendarMarker[] {
    const d = (m: number, day: number, title: string, occasionType: OccasionType): CalendarMarker => ({
        id: `tpl-${year}-${m + 1}-${day}`,
        date: `${year}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        title,
        occasionType,
        source: 'template',
    });
    return [
        d(0, 1, 'استعداد للسنة الجديدة', 'other'),
        d(1, 18, 'إحياء يوم الشهيد', 'national'),
        d(2, 8, 'يوم المرأة العالمي', 'social'),
        d(3, 16, 'إحياء يوم العلم', 'national'),
        d(4, 1, 'عيد العمال', 'national'),
        d(5, 1, 'اليوم العالمي للطفل', 'humanitarian'),
        d(6, 5, 'فعاليات عيد الاستقلال', 'national'),
        d(10, 1, 'عيد الثورة', 'national'),
        d(1, 28, 'توزيع سلال رمضان (مرجع تقويمي)', 'religious'),
        d(2, 29, 'مساعدات عيد الفطر (مرجع تقويمي)', 'religious'),
        d(5, 6, 'توزيع أضاحي عيد الأضحى (مرجع تقويمي)', 'religious'),
        d(8, 5, 'دعم الدخول المدرسي', 'educational'),
    ];
}

export async function getCalendarMarkersForYear(year: number): Promise<CalendarMarker[]> {
    const acts = await getActivities({ year });
    const dbMarkers: CalendarMarker[] = acts.map((o) => ({
        id: o.id,
        date: o.startDate.slice(0, 10),
        title: o.title,
        occasionType: o.occasionType,
        source: 'database',
    }));
    const fixed = getFixedCalendarMarkers(year);
    const merged = [...fixed, ...dbMarkers];
    return merged.filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i);
}

function buildAnnualReportHtml(year: number, activities: Occasion[], summary: AnnualSummary): string {
    const logoPrimary = '/assets/images/logo.png';
    const logoFallback = '/assets/images/logo_abyadh.png';
    const rows = activities
        .map(
            (o) =>
                `<tr><td>${o.title}</td><td>${o.startDate}</td><td>${o.occasionType}</td><td>${o.status}</td><td>${o.actualBeneficiariesCount ?? o.targetBeneficiariesCount ?? '—'}</td><td>${(o.budgetActual ?? 0).toLocaleString('ar-DZ')}</td></tr>`
        )
        .join('');
    return `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"/>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet"/>
    <style>
      body{font-family:Cairo,sans-serif;padding:24px;color:#111}
      table{width:100%;border-collapse:collapse;margin-top:16px}
      th,td{border:1px solid #ccc;padding:8px;text-align:right}
      th{background:#1e3a5f;color:#fff}
    </style></head><body>
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
      <img src="${logoPrimary}" alt="logo" onerror="this.onerror=null;this.src='${logoFallback}'" style="width:64px;height:64px;object-fit:contain"/>
      <div>
        <h1 style="margin:0;font-size:22px">${ASSOCIATION_INFO.name}</h1>
        <p style="margin:4px 0 0;font-size:16px">تقرير أنشطة السنة ${year}</p>
      </div>
    </div>
    <h2>ملخص</h2>
    <ul>
      <li>إجمالي الأنشطة: ${summary.totalActivities}</li>
      <li>مكتملة: ${summary.completedCount}</li>
      <li>إجمالي المستفيدين (مجموع الأهداف المسجلة): ${summary.totalBeneficiaries}</li>
      <li>الميزانية المصروفة (مجموع budget_actual): ${summary.totalBudgetSpent.toLocaleString('ar-DZ')} دج</li>
    </ul>
    <h2>جدول الأنشطة</h2>
    <table><thead><tr><th>العنوان</th><th>التاريخ</th><th>النوع</th><th>الحالة</th><th>المستفيدون</th><th>الميزانية الفعلية</th></tr></thead><tbody>${rows}</tbody></table>
    </body></html>`;
}

/** HTML document as Blob (save or open); use printAnnualYearReport for PDF via الطباعة */
export async function generateAnnualReport(year: number): Promise<Blob> {
    const [acts, summary] = await Promise.all([getActivitiesByYear(year), getAnnualSummary(year)]);
    const html = buildAnnualReportHtml(year, acts, summary);
    return new Blob([html], { type: 'text/html;charset=utf-8' });
}

export function printAnnualYearReport(year: number, activities: Occasion[], summary: AnnualSummary): void {
    const html = buildAnnualReportHtml(year, activities, summary);
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
}

export async function uploadAnnualReportAndSave(year: number, createdBy: string): Promise<string | null> {
    const blob = await generateAnnualReport(year);
    const path = `annual-reports/${year}-${Date.now()}.html`;
    try {
        const { data, error } = await supabase.storage.from('reports').upload(path, blob, { contentType: 'text/html', upsert: true });
        if (error) throw error;
        const { data: pub } = supabase.storage.from('reports').getPublicUrl(data?.path ?? path);
        const url = pub?.publicUrl ?? null;
        if (url) {
            await supabase.from('saved_reports').insert({
                report_type: 'literary',
                report_year: year,
                title: `أرشيف أنشطة ${year}`,
                data: { kind: 'annual_activities_archive', year },
                pdf_url: url,
                status: 'submitted',
                created_by: createdBy,
            });
        }
        return url;
    } catch {
        return null;
    }
}
