import { useState } from 'react';
import { FileText, Plus, Download, Eye, CheckCircle, Clock, Archive } from 'lucide-react';
import { MOCK_DOCUMENTS } from '../../data/mockData';
import { Badge, Button } from '../../components/ui';

const DOC_TYPE_LABELS: Record<string, string> = {
    literary_report: 'تقرير أدبي', financial_report: 'تقرير مالي', activity_report: 'تقرير نشاط',
    aid_request: 'طلب مساعدة', space_request: 'طلب فضاء', contract: 'عقد',
    meeting_minutes: 'محضر اجتماع', other: 'وثيقة أخرى',
};
const STATUS_LABELS: Record<string, string> = { draft: 'مسودة', pending_approval: 'في الانتظار', approved: 'معتمدة', archived: 'مؤرشفة' };
const STATUS_COLORS: Record<string, 'gray' | 'yellow' | 'green' | 'blue'> = { draft: 'gray', pending_approval: 'yellow', approved: 'green', archived: 'blue' };
const STATUS_ICONS: Record<string, typeof CheckCircle> = { draft: Clock, pending_approval: Clock, approved: CheckCircle, archived: Archive };

export default function DocumentsPage() {
    const [statusFilter, setStatusFilter] = useState('');
    const docs = MOCK_DOCUMENTS.filter(d => !statusFilter || d.status === statusFilter);

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="page-header">
                <div>
                    <h2 className="page-title">الوثائق والتقارير</h2>
                    <p className="text-sm text-gray-500 mt-1">{MOCK_DOCUMENTS.length} وثيقة</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" icon={<Download className="w-4 h-4" />}>تصدير القائمة</Button>
                    <Button icon={<Plus className="w-4 h-4" />}>رفع وثيقة</Button>
                </div>
            </div>

            {/* Status tabs */}
            <div className="flex bg-gray-100 p-1 rounded-xl w-fit gap-1">
                {[{ value: '', label: 'الكل' }, { value: 'approved', label: 'معتمدة' }, { value: 'pending_approval', label: 'في الانتظار' }, { value: 'draft', label: 'مسودات' }, { value: 'archived', label: 'مؤرشفة' }].map(f => (
                    <button key={f.value} onClick={() => setStatusFilter(f.value)}
                        className={`tab-button ${statusFilter === f.value ? 'active' : ''}`}>{f.label}</button>
                ))}
            </div>

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
                                    <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{d.title}</h4>
                                    <p className="text-xs text-gray-400 mt-1">{DOC_TYPE_LABELS[d.documentType] || d.documentType}</p>
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        <Badge variant={STATUS_COLORS[d.status]}>
                                            <StatusIcon className="w-3 h-3 mr-1" />
                                            {STATUS_LABELS[d.status]}
                                        </Badge>
                                        {d.isConfidential && <Badge variant="red">سري</Badge>}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                                <div className="text-xs text-gray-400">
                                    <span>{d.uploaderName}</span>
                                    <span className="mx-1">•</span>
                                    <span>{d.uploadDate}</span>
                                </div>
                                <button className="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Eye className="w-3.5 h-3.5" /> معاينة
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
