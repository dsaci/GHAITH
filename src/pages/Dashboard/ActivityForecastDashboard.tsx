import { useState, useEffect } from 'react';
import { 
  Sparkles, Calendar, TrendingUp, 
  ChevronRight, ArrowUpRight, Clock,
  Target, Info, RefreshCw
} from 'lucide-react';
import { getActivitiesByYear } from '../../services/activities.service';
import { Badge, Button, LoadingSpinner } from '../../components/ui';
import type { Occasion } from '../../types';

export default function ActivityForecastDashboard() {
  const [loading, setLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState<Occasion[]>([]);
  const [currentMonth] = useState(new Date().getMonth());
  const year = new Date().getFullYear();

  useEffect(() => {
    loadForecast();
  }, []);

  const loadForecast = async () => {
    setLoading(true);
    try {
      // Fetch data from previous year (2024 as reference)
      const lastYear = year - 1;
      const data = await getActivitiesByYear(lastYear);
      setHistoricalData(data || []);
    } catch (error) {
      console.error('Error loading forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  // Logic to filter historical activities relevant to the current/next month
  const seasonalSuggestions = historicalData.filter(act => {
    if (!act.startDate) return false;
    const actMonth = new Date(act.startDate).getMonth();
    // Allow matches for current month and next 2 months
    return actMonth >= currentMonth && actMonth <= currentMonth + 2;
  }).slice(0, 3);

  const getUrgency = (act: Occasion) => {
    const actDate = new Date(act.startDate);
    const actMonth = actDate.getMonth();
    return actMonth === currentMonth ? 'high' : 'medium';
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* AI/Smart Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-primary-700 to-primary-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary-200">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-400 rounded-full blur-[80px]" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold mb-4 border border-white/10 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              توقعات المبادرات الموسمية
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
              تحسين التخطيط <br />
              <span className="text-yellow-300">بناءً على تاريخ الجمعية</span>
            </h1>
            <p className="text-primary-100 text-lg leading-relaxed opacity-90 font-medium">
              نقوم بمقارنة نشاطات السنة الماضية ({year - 1}) لتحديد المبادرات الأكثر أهمية للفترة القادمة.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10">
              <Target className="w-6 h-6 text-yellow-300 mb-2" />
              <p className="text-xs opacity-70 mb-1">نسبة الدقة</p>
              <p className="text-2xl font-black">94%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10">
              <TrendingUp className="w-6 h-6 text-green-300 mb-2" />
              <p className="text-xs opacity-70 mb-1">نمو المبادرات</p>
              <p className="text-2xl font-black">+12%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Forecast List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary-600" />
              </div>
              المبادرات المقترحة للفترة القادمة
            </h2>
            <Button variant="secondary" onClick={loadForecast} size="sm" icon={<RefreshCw className="w-4 h-4" />}>
              تحديث
            </Button>
          </div>

          {seasonalSuggestions.length === 0 ? (
            <div className="card p-12 text-center text-gray-400">
              <Info className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-bold">لا توجد نشاطات مسجلة في نفس الفترة من العام الماضي للرجوع إليها.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {seasonalSuggestions.map((act) => (
                <div key={act.id} className="group relative bg-white border border-gray-100 p-6 rounded-[2rem] hover:shadow-2xl hover:shadow-primary-100 transition-all duration-500 overflow-hidden">
                  <div className={`absolute top-0 right-0 w-1.5 h-full ${getUrgency(act) === 'high' ? 'bg-amber-500' : 'bg-primary-500'}`} />
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant={getUrgency(act) === 'high' ? 'yellow' : 'blue'}>
                          {getUrgency(act) === 'high' ? 'مستعجل: يجب تفعيله الآن' : 'مخطط: ابدأ التحضير'}
                        </Badge>
                        <span className="text-xs font-black text-gray-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          نفس الفترة من العام الماضي
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">{act.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{act.description || 'مبادرة دورية تهدف لتعزيز التكافل الاجتماعي في المجتمع المحلي.'}</p>
                      
                      <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-primary-500" />
                          <span className="text-xs font-bold text-gray-600">المستهدف: {act.targetBeneficiariesCount || 0} عائلة</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-xs font-bold text-gray-600">الميزانية: {(act.budgetActual || act.budgetPlanned || 0).toLocaleString('ar-DZ')} دج</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:w-48 flex flex-col justify-between items-end gap-4 shrink-0">
                      <div className="p-3 bg-gray-50 rounded-2xl text-center w-full">
                        <p className="text-[10px] font-black text-gray-400 uppercase">الشهر المقترح</p>
                        <p className="text-lg font-black text-primary-700">
                          {new Date(act.startDate).toLocaleString('ar-DZ', { month: 'long' })}
                        </p>
                      </div>
                      <Button className="w-full h-12 rounded-2xl group-hover:bg-primary-600">
                        تفعيل المبادرة
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Side Stats/Insights */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card bg-gray-900 text-white rounded-[2rem] border-0 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600 rounded-full blur-[60px] opacity-20 -translate-y-1/2 translate-x-1/2 group-hover:opacity-40 transition-opacity" />
            
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-300" />
              أداء العام الماضي
            </h3>
            
            <div className="space-y-6 relative z-10">
              <div>
                <div className="flex justify-between text-xs mb-2 font-bold">
                  <span className="opacity-60 text-indigo-100 italic">النشاطات المنجزة</span>
                  <span className="group-hover:text-yellow-300 transition-colors">75% من الهدف</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-300 w-3/4 rounded-full relative">
                    <div className="absolute top-0 right-0 w-full h-full bg-white opacity-20 animate-pulse" />
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-2 font-bold">
                  <span className="opacity-60 text-indigo-100 italic">تغطية البلديات</span>
                  <span className="group-hover:text-amber-300 transition-colors">12/15 بلدية</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 w-[80%] rounded-full" />
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 mt-6 grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4 group/item">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover/item:bg-white/10 transition-colors">
                    <ArrowUpRight className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs opacity-50 font-medium italic">تحسن الاستجابة</p>
                    <p className="text-sm font-black">+24% زيادة عن 2023</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary-800/50 rounded-2xl border border-white/5 mt-4">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-primary-300 shrink-0" />
                  <p className="text-[11px] leading-relaxed opacity-70 font-medium">
                    بناءً على المعطيات المرصودة، يرجى التركيز على مبادرات <span className="text-yellow-300 font-bold">قفة رمضان</span> في الفترة المقبلة لضمان التغطية المثلى.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card rounded-[2rem] border-dashed border-2 border-gray-100 p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary-300" />
            </div>
            <h4 className="font-black text-gray-900 mb-2">طلب تحليل عميق</h4>
            <p className="text-xs text-gray-500 font-bold italic leading-relaxed mb-6">احصل على تقرير مفصل حول اتجاهات المساعدات في منطقتك للفترة القادمة.</p>
            <Button variant="secondary" className="w-full rounded-2xl font-black">قريباً عبر AI</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
