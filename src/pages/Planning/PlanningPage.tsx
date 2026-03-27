import { BarChart2, Target, CheckSquare, Plus } from 'lucide-react';
import { Button } from '../../components/ui';

const PLANS = [
    { id: 1, title: 'الخطة السنوية 2026', period: 'يناير — ديسمبر 2026', status: 'active', progress: 28, goals: ['مضاعفة عدد العائلات المستفيدة', 'تفعيل 5 فروع بلدية', 'إطلاق برنامج الدعم المدرسي', 'تنظيم 12 نشاط على الأقل'], budget: 2500000 },
    { id: 2, title: 'خطة مارس 2026', period: 'مارس 2026', status: 'active', progress: 65, goals: ['توزيع 200 قفة رمضان', 'تسجيل 20 عائلة جديدة', 'إقامة يوم تحسيسي'], budget: 550000 },
    { id: 3, title: 'الخطة السنوية 2025', period: 'يناير — ديسمبر 2025', status: 'completed', progress: 100, goals: ['تحقيق الأهداف الأساسية', 'توسع 3 فروع'], budget: 2100000 },
];

export default function PlanningPage() {
    const fmt = (n: number) => n.toLocaleString('ar-DZ') + ' دج';

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="page-header">
                <div>
                    <h2 className="page-title">الخطط والمتابعة</h2>
                    <p className="text-sm text-gray-500 mt-1">إدارة الخطط السنوية والشهرية ومتابعة التنفيذ</p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />}>خطة جديدة</Button>
            </div>
            <div className="space-y-4">
                {PLANS.map(plan => (
                    <div key={plan.id} className="card hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${plan.status === 'completed' ? 'bg-gray-100' : 'bg-primary-100'}`}>
                                    <BarChart2 className={`w-6 h-6 ${plan.status === 'completed' ? 'text-gray-500' : 'text-primary-600'}`} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg">{plan.title}</h4>
                                    <p className="text-sm text-gray-500">{plan.period}</p>
                                    <p className="text-sm font-semibold text-primary-700 mt-1">الميزانية: {fmt(plan.budget)}</p>
                                </div>
                            </div>
                            <div className="text-left">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${plan.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {plan.status === 'completed' ? 'مكتملة' : 'جارية'}
                                </span>
                            </div>
                        </div>
                        {/* Progress bar */}
                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-500 flex items-center gap-1"><Target className="w-4 h-4" />نسبة الإنجاز</span>
                                <span className="font-bold text-gray-900">{plan.progress}%</span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full">
                                <div className={`h-full rounded-full transition-all ${plan.progress === 100 ? 'bg-green-500' : 'bg-primary-500'}`} style={{ width: `${plan.progress}%` }} />
                            </div>
                        </div>
                        {/* Goals */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1"><CheckSquare className="w-3.5 h-3.5" />الأهداف</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                                {plan.goals.map((g, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${plan.progress === 100 ? 'bg-green-500' : 'bg-primary-400'}`} />
                                        {g}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
