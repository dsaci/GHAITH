import type { OccasionType, OccasionStatus, BeneficiaryCategory } from '../../types';

export const TYPE_LABELS: Record<OccasionType, string> = {
    religious: 'ديني',
    national: 'وطني',
    humanitarian: 'إنساني',
    educational: 'تربوي',
    social: 'اجتماعي',
    other: 'آخر',
};

export const STATUS_LABELS: Record<OccasionStatus, string> = {
    planned: 'مقرر',
    in_progress: 'جاري',
    completed: 'مكتمل',
    cancelled: 'ملغى',
};

export const TYPE_STYLE: Record<OccasionType, { bg: string; border: string; dot: string }> = {
    religious: { bg: '#fef3c7', border: '#f59e0b', dot: '#f59e0b' },
    national: { bg: '#dbeafe', border: '#3b82f6', dot: '#3b82f6' },
    humanitarian: { bg: '#fce7f3', border: '#ec4899', dot: '#ec4899' },
    educational: { bg: '#d1fae5', border: '#10b981', dot: '#10b981' },
    social: { bg: '#ede9fe', border: '#8b5cf6', dot: '#8b5cf6' },
    other: { bg: '#f3f4f6', border: '#6b7280', dot: '#6b7280' },
};

export const CATEGORY_LABELS_AR: Record<BeneficiaryCategory, string> = {
    widow: 'أرملة',
    divorced: 'مطلقة',
    disabled: 'ذو إعاقة',
    chronic_illness: 'مرض مزمن',
    orphan: 'يتيم',
    poor_family: 'أسرة معوزة',
    other: 'أخرى',
};

export const AR_MONTHS = ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export function formatActivityDate(iso: string) {
    const d = new Date(iso + (iso.length <= 10 ? 'T12:00:00' : ''));
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('ar-DZ', { day: 'numeric', month: 'long', year: 'numeric' });
}
