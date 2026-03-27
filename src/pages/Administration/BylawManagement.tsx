import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ShieldCheck, CheckCircle2, Users, FileText } from 'lucide-react';
import { Badge, LoadingSpinner } from '../../components/ui';

export default function BylawManagement() {
  const [stats, setStats] = useState({ totalUsers: 0, agreedUsers: 0 });
  const [acknowledgments, setAcknowledgments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .in('role', ['president', 'vice_president', 'treasurer', 'board_member', 'branch_president', 'member']);

      const { data: acks, count: agreedUsers } = await supabase
        .from('bylaw_acknowledgments')
        .select('*, user_profiles(full_name, role, branch_id)', { count: 'exact' })
        .order('agreed_at', { ascending: false });

      setStats({
        totalUsers: totalUsers || 0,
        agreedUsers: agreedUsers || 0
      });
      setAcknowledgments(acks || []);
    } catch (error) {
      console.error('Error fetching bylaw stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const percentage = stats.totalUsers > 0 ? Math.round((stats.agreedUsers / stats.totalUsers) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary-600" />
          إدارة القانون الداخلي
        </h1>
        <p className="text-gray-500 mt-1">متابعة إقرارات الأعضاء والتزامهم بالقانون الداخلي للجمعية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">إجمالي الأعضاء المعنيين</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">الأعضاء الموافقون</p>
            <p className="text-2xl font-bold text-gray-900">{stats.agreedUsers}</p>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500 font-medium whitespace-nowrap">نسبة الالتزام</p>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-bold text-gray-900">{percentage}%</p>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden min-w-[100px]">
                <div 
                  className={`h-full ${percentage === 100 ? 'bg-green-500' : 'bg-primary-500'}`} 
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-bold text-gray-900">سجل الموافقات الحديثة</h2>
          <span className="text-xs text-gray-500 px-3 py-1 bg-white border rounded-full">
            يتم توثيق الموافقة بالتاريخ ورقم IP كدليل التزام
          </span>
        </div>
        
        {loading ? (
          <div className="p-12 flex justify-center"><LoadingSpinner size="lg" /></div>
        ) : acknowledgments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">لا توجد موافقات مسجلة بعد.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-white text-gray-500 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">العضو</th>
                  <th className="px-6 py-4 font-semibold">المنصب / الصفة</th>
                  <th className="px-6 py-4 font-semibold">تاريخ وتوقيت الموافقة</th>
                  <th className="px-6 py-4 font-semibold">عنوان IP (للتوثيق)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {acknowledgments.map((ack) => (
                  <tr key={ack.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {ack.user_profiles?.full_name || 'عضو غير معروف'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="blue">{ack.user_profiles?.role || 'غير محدد'}</Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-600" dir="ltr">
                      {new Date(ack.agreed_at).toLocaleString('ar-DZ')}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-400 text-xs">
                      {ack.ip_address || '---'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
