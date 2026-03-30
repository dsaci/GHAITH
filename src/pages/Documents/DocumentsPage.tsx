import { useState, useEffect } from 'react';
import { FileText, Plus, Download, Eye, CheckCircle, Clock, Archive, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Badge, Button, Modal, Input, Select, LoadingSpinner, EmptyState } from '../../components/ui';
import type { Document } from '../../types';

const DOC_TYPE_LABELS: Record<string, string> = {
    literary_report: 'تقرير أدبي', financial_report: 'تقرير مالي', activity_report: 'تقرير نشاط',
    aid_request: 'طلب مساعدة', space_request: 'طلب فضاء', contract: 'عقد',
    meeting_minutes: 'محضر اجتماع', other: 'وثيقة أخرى',
};
const STATUS_LABELS: Record<string, string> = { draft: 'مسودة', pending_approval: 'في الانتظار', approved: 'معتمدة', archived: 'مؤرشفة' };
const STATUS_COLORS: Record<string, 'gray' | 'yellow' | 'green' | 'blue'> = { draft: 'gray', pending_approval: 'yellow', approved: 'green', archived: 'blue' };
const STATUS_ICONS: Record<string, typeof CheckCircle> = { draft: Clock, pending_approval: Clock, approved: CheckCircle, archived: Archive };

export default function DocumentsPage() {
    const { user } = useAuth();
    const [allDocs, setAllDocs] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        documentType: 'other',
        isConfidential: false,
    });

    useEffect(() => {
        fetchDocs();
    }, []);

    async function fetchDocs() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setAllDocs(data || []);
        } catch (err) {
            console.error('Error fetching docs:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            // Storage logic would go here, for now saving record
            const { error } = await supabase.from('documents').insert([{
                title: formData.title,
                document_type: formData.documentType,
                is_confidential: formData.isConfidential,
                status: 'pending_approval',
                uploaded_by: user?.id,
                uploader_name: user?.fullName || 'مسؤول',
                file_url: '#', // Placeholder until storage is implemented
                file_type: 'pdf',
                upload_date: new Date().toISOString().split('T')[0]
            }]);
            if (error) throw error;
            setIsUploadModalOpen(false);
            setFormData({ title: '', documentType: 'other', isConfidential: false });
            fetchDocs();
        } catch (err) {
            console.error('Error uploading doc:', err);
            alert('حدث خطأ أثناء حفظ الوثيقة');
        } finally {
            setIsSubmitting(false);
        }
    }

    const docs = allDocs.filter(d => !statusFilter || d.status === statusFilter);

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="page-header">
                <div>
                    <h2 className="page-title">الوثائق والتقارير</h2>
                    <p className="text-sm text-gray-500 mt-1">{allDocs.length} وثيقة</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" icon={<Download className="w-4 h-4" />}>تصدير القائمة</Button>
                    <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsUploadModalOpen(true)}>رفع وثيقة</Button>
                </div>
            </div>

            {/* Upload Modal */}
            <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="رفع وثيقة جديدة">
                <form onSubmit={handleSubmit} className="p-6 space-y-4" dir="rtl">
                    <Input label="عنوان الوثيقة" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                    <Select label="نوع الوثيقة" value={formData.documentType} onChange={e => setFormData({ ...formData, documentType: e.target.value })}>
                        {Object.entries(DOC_TYPE_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                        ))}
                    </Select>
                    <div className="flex items-center gap-2 py-2">
                        <input type="checkbox" id="isConf" checked={formData.isConfidential} onChange={e => setFormData({ ...formData, isConfidential: e.target.checked })} className="w-4 h-4 rounded text-red-600 focus:ring-red-500" />
                        <label htmlFor="isConf" className="text-sm font-bold text-gray-700">وثيقة سرية (للمخولين فقط)</label>
                    </div>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50">
                        <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-bold text-gray-500">انقر لاختيار الملف أو قم بالسحب والإفلات</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (حد أقصى 10 ميجابايت)</p>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsUploadModalOpen(false)}>إلغاء</Button>
                        <Button type="submit" disabled={isSubmitting} icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}>
                            {isSubmitting ? 'جاري الرفع...' : 'حفظ الوثيقة'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Status tabs */}
            <div className="flex bg-gray-100 p-1 rounded-xl w-fit gap-1">
                {[{ value: '', label: 'الكل' }, { value: 'approved', label: 'معتمدة' }, { value: 'pending_approval', label: 'في الانتظار' }, { value: 'draft', label: 'مسودات' }, { value: 'archived', label: 'مؤرشفة' }].map(f => (
                    <button key={f.value} onClick={() => setStatusFilter(f.value)}
                        className={`tab-button ${statusFilter === f.value ? 'active' : ''}`}>{f.label}</button>
                ))}
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : docs.length === 0 ? (
                <EmptyState title="لا توجد وثائق" description="لم يتم العثور على وثائق بهذا التصنيف." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {docs.map(d => {
                        const StatusIcon = STATUS_ICONS[d.status];
                        return (
                            <div key={d.id} className="card hover:shadow-md transition-shadow group">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                                        <FileText className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">{d.title}</h4>
                                        <p className="text-xs text-gray-400 font-bold mt-1">{DOC_TYPE_LABELS[d.documentType] || d.documentType}</p>
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            <Badge variant={STATUS_COLORS[d.status]}>
                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                {STATUS_LABELS[d.status]}
                                            </Badge>
                                            {d.isConfidential && <Badge variant="red" className="font-black">سري</Badge>}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                                    <div className="text-[10px] font-bold text-gray-400">
                                        <span>{d.uploaderName}</span>
                                        <span className="mx-1">•</span>
                                        <span>{new Date(d.uploadDate).toLocaleDateString('ar-DZ')}</span>
                                    </div>
                                    <button className="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1 font-black opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Eye className="w-3.5 h-3.5" /> معاينة
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
