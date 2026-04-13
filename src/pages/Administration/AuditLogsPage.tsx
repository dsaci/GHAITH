import { useState, useEffect } from 'react';
import { 
    Activity, Clock, User, Shield, 
    Search, RefreshCw,
    LogIn, LogOut, PlusCircle, Pencil, Trash2,
    Database, Loader2
} from 'lucide-react';
import { auditService, AuditLog } from '../../services/audit.service';
import { Badge, StatCard } from '../../components/ui';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        action: '',
        userType: '',
    });

    useEffect(() => {
        fetchLogs();
    }, [filter]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const { data, error } = await auditService.getLogs({
                limit: 50,
                offset: 0
            });
            
            if (error) throw error;
            
            let filteredData = (data ?? []) as unknown as any[];
            if (filter.action) filteredData = filteredData.filter((l: any) => l.action === filter.action);
            if (filter.userType) filteredData = filteredData.filter((l: any) => l.user_type === filter.userType);

            setLogs(filteredData);
        } catch (err) {
            console.error('Error fetching audit logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'login': return <Badge variant="green" className="gap-1 flex items-center justify-center"><LogIn className="w-3 h-3"/> دخول</Badge>;
            case 'logout': return <Badge variant="gray" className="gap-1 flex items-center justify-center"><LogOut className="w-3 h-3"/> خروج</Badge>;
            case 'create': return <Badge variant="blue" className="gap-1 flex items-center justify-center"><PlusCircle className="w-3 h-3"/> إضافة</Badge>;
            case 'update': return <Badge variant="yellow" className="gap-1 flex items-center justify-center"><Pencil className="w-3 h-3"/> تعديل</Badge>;
            case 'delete': return <Badge variant="red" className="gap-1 flex items-center justify-center"><Trash2 className="w-3 h-3"/> حذف</Badge>;
            default: return <Badge variant="gray">{action}</Badge>;
        }
    };

    const getUserTypeIcon = (type: string) => {
        switch (type) {
            case 'internal': return <Shield className="w-4 h-4 text-primary-600" />;
            case 'beneficiary': return <User className="w-4 h-4 text-green-600" />;
            default: return <User className="w-4 h-4 text-gray-400" />;
        }
    };

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                        <Activity className="w-8 h-8 text-primary-600" />
                        سجل تتبع النشاطات
                    </h1>
                    <p className="text-gray-500 font-medium">مراقبة دقيقة لكل العمليات والولوج للمنصة</p>
                </div>
                <button 
                    onClick={fetchLogs}
                    className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                    title="تحديث السجل"
                >
                    <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="إجمالي العمليات اليوم" 
                    value={logs.filter((l: AuditLog) => l.created_at.startsWith(new Date().toISOString().split('T')[0])).length.toString()} 
                    icon={<Activity className="w-6 h-6" />} 
                    color="blue"
                    trend={{ value: 12, positive: true }} 
                />
                <StatCard 
                    title="تسجيلات الدخول" 
                    value={logs.filter((l: AuditLog) => l.action === 'login').length.toString()} 
                    icon={<LogIn className="w-6 h-6" />} 
                    color="green" 
                />
                <StatCard 
                    title="عمليات التعديل" 
                    value={logs.filter((l: AuditLog) => l.action === 'update').length.toString()} 
                    icon={<Pencil className="w-6 h-6" />} 
                    color="yellow" 
                />
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-4 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="بحث في السجلات..." 
                            className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pr-10 pl-4 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                        />
                    </div>
                    
                    <div className="flex gap-2">
                        <select 
                            value={filter.action}
                            onChange={(e) => setFilter({...filter, action: e.target.value})}
                            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-primary-100 font-bold text-gray-700"
                        >
                            <option value="">جميع العمليات</option>
                            <option value="login">دخول</option>
                            <option value="logout">خروج</option>
                            <option value="create">إضافة</option>
                            <option value="update">تعديل</option>
                            <option value="delete">حذف</option>
                        </select>

                        <select 
                            value={filter.userType}
                            onChange={(e) => setFilter({...filter, userType: e.target.value})}
                            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-primary-100 font-bold text-gray-700"
                        >
                            <option value="">جميع أنواع المستخدمين</option>
                            <option value="internal">إداري</option>
                            <option value="beneficiary">مستفيد</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-sm font-bold border-b border-gray-100">
                                <th className="px-6 py-4">الوقت والتاريخ</th>
                                <th className="px-6 py-4">المستخدم</th>
                                <th className="px-6 py-4">العملية</th>
                                <th className="px-6 py-4">المورد</th>
                                <th className="px-6 py-4 font-mono">تفاصيل إضافية</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-right">
                            {loading && logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
                                        <p className="text-gray-500 font-bold">جاري تحميل سجلات النشاط...</p>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-bold">
                                        لا توجد نشاطات مسجلة حالياً
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log: AuditLog) => (
                                    <tr key={log.id} className="hover:bg-primary-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                    {new Date(log.created_at).toLocaleTimeString('ar-DZ')}
                                                </span>
                                                <span className="text-xs text-gray-400 text-right">
                                                    {new Date(log.created_at).toLocaleDateString('ar-DZ')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                    {getUserTypeIcon(log.user_type)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-800 text-sm">{log.user_id ? log.user_id.split('-')[0] : 'نظام'}</span>
                                                    <span className="text-xs text-primary-600 font-bold italic">
                                                        {log.user_type === 'internal' ? 'إداري' : 'مستفيد'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getActionBadge(log.action)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-600 font-medium">
                                                <Database className="w-4 h-4 text-gray-400" />
                                                {log.resource_type}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.new_values ? (
                                                <div className="flex items-center gap-2 text-[10px] bg-gray-100 p-1.5 rounded-lg text-gray-500 font-mono break-all max-w-[200px]">
                                                    {typeof log.new_values === 'string' ? log.new_values.substring(0, 50) : JSON.stringify(log.new_values).substring(0, 50)}
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 text-xs">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
