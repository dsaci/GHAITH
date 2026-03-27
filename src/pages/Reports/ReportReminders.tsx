import { useEffect, useState } from 'react';
import { Bell, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getReminders } from '../../services/reports.service';
import type { ReportReminderRow } from '../../services/reports.service';

export default function ReportReminders() {
    const { user } = useAuth();
    const [reminders, setReminders] = useState<ReportReminderRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReminders = async () => {
            try {
                const data = await getReminders(user?.role);
                setReminders(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchReminders();
    }, [user?.role]);

    if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-3xl" dir="rtl" />;

    return (
        <div className="bg-[#1e3a5f] rounded-[32px] p-8 text-white relative overflow-hidden font-['Cairo']" dir="rtl">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#3dd163] rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-[#3dd163]/20">
                        <Bell className="w-6 h-6 text-[#1e3a5f]" />
                    </div>
                    <div>
                        <h3 className="text-[20px] font-black">مواعيد التقارير القادمة</h3>
                        <p className="text-white/60 text-[14px]">يجب إيداع التقارير لدى مديرية التنظيم بالعاصمة قبل نهاية السداسي الأول.</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    {reminders.map((rem) => (
                        <div key={rem.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-4 min-w-[280px]">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Clock className="w-5 h-5 text-[#3dd163]" />
                            </div>
                            <div>
                                <p className="text-[13px] font-bold text-white/90">{rem.message}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Calendar className="w-3.5 h-3.5 text-[#3dd163]" />
                                    <span className="text-[11px] text-white/60">آخر أجل: {rem.reminder_date}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {reminders.length === 0 && (
                        <div className="text-white/40 text-[14px] flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            <span>لا توجد مواعيد قريبة حالياً</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
