import { useState, useEffect, useRef } from 'react';
import { bylawService, BylawRule } from '../../services/bylaw.service';
import { useAuth } from '../../context/AuthContext';
import { Check, ShieldAlert, Loader2 } from 'lucide-react';

interface BylawModalProps {
  onAgreed: () => void;
}

export default function BylawModal({ onAgreed }: BylawModalProps) {
  const { user } = useAuth();
  const [rules, setRules] = useState<BylawRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bylawService.getBylawRules()
      .then(data => {
        setRules(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load bylaws:', err);
        setLoading(false);
      });
  }, []);

  const handleScroll = () => {
    if (!contentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      setScrolledToBottom(true);
    }
  };

  const handleAgree = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await bylawService.recordAgreement(user.id);
      onAgreed();
    } catch (error) {
      console.error('Failed to record agreement:', error);
      alert('حدث خطأ أثناء تسجيل الموافقة. يرجى المحاولة لاحقاً.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null; // Or a full screen loader

  // Group by chapters
  const chapters = Array.from(new Set(rules.map(r => r.chapter_title)));

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex mb:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300" dir="rtl">
        
        {/* Header */}
        <div className="bg-ghaith-navy text-white p-6 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">القانون الأساسي والنظام الداخلي لجمعية غيث</h2>
              <p className="text-blue-100 mt-1 text-sm">يجب قراءة والموافقة على اللوائح التنظيمية للمتابعة</p>
            </div>
          </div>
        </div>

        {/* Content - scrollable */}
        <div 
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50 scroll-smooth"
        >
          {rules.length === 0 ? (
            <p className="text-center text-gray-500 py-12">لا يوجد مواد متاحة حاليا.</p>
          ) : (
            <div className="space-y-8">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm leading-relaxed">
                مرحباً بك <strong>{user?.fullName}</strong> في المنصة الرقمية لجمعية غيث الولائية. 
                بصفتك عضو في الجمعية، نرجو منك الاطلاع والموافقة على بنود القانون الداخلي.
              </div>

              {chapters.map((chapterName, idx) => (
                <div key={idx} className="space-y-4">
                  <h3 className="text-xl font-bold text-ghaith-navy border-b border-gray-200 pb-2">
                    {chapterName}
                  </h3>
                  <div className="space-y-4 pl-4">
                    {rules.filter(r => r.chapter_title === chapterName).map(rule => (
                      <div key={rule.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex gap-4">
                          <div className="shrink-0 w-8 h-8 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center font-bold text-sm">
                            {rule.article_number}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 mb-1">{rule.article_title}</h4>
                            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                              {rule.article_content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="text-center py-4 text-sm text-gray-400 border-t border-gray-200">
                نهاية الوثيقة
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-100 p-6 shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 font-medium">
              {rules.length === 0 
                ? 'لا توجد مواد قانونية مسجلة حالياً، يمكنك المتابعة' 
                : !scrolledToBottom 
                  ? 'يرجى التمرير لقراءة جميع المواد لتفعيل زر الموافقة' 
                  : 'لقد قرأت جميع البنود وأقر بالالتزام بها'}
            </p>
            <button
              onClick={handleAgree}
              disabled={(rules.length > 0 && !scrolledToBottom) || saving}
              className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-md w-full sm:w-auto
                ${(rules.length === 0 || scrolledToBottom) 
                  ? 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg hover:-translate-y-0.5' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-70'}
              `}
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Check className="w-5 h-5" />
              )}
              <span>{rules.length === 0 ? 'متابعة' : 'أوافق والتزم بالقانون الداخلي'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
