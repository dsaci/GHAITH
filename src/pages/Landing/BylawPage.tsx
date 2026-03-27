import { useState, useEffect } from 'react';
import { bylawService, BylawRule } from '../../services/bylaw.service';
import { ShieldCheck, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PublicBylaw() {
  const [rules, setRules] = useState<BylawRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bylawService.getBylawRules().then(data => {
      setRules(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const chapters = Array.from(new Set(rules.map(r => r.chapter_title)));

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in" dir="rtl">
      {/* Header */}
      <header className="bg-ghaith-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 py-6 relative z-10 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors">
                <ArrowRight className="w-5 h-5" />
                العودة للرئيسية
            </Link>
            <div className="flex items-center gap-3">
                <span className="font-bold text-xl">جمعية غيث الولائية</span>
                <img src="/assets/images/logo_abyadh.png" alt="Logo" className="w-10 h-10 object-contain" />
            </div>
        </div>
        <div className="pt-8 pb-16 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">القانون الداخلي لجمعية غيث</h1>
          <p className="max-w-2xl mx-auto text-blue-100 text-lg px-4 leading-relaxed">
            المرجع الأساسي المنظم لعمل الجمعية ومختلف هيئاتها، يوضح الحقوق والواجبات وإجراءات العمل المؤسسي.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 -mt-8 relative z-20">
        {loading ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
             <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
             <p className="text-gray-500">جاري تحميل مواد القانون...</p>
          </div>
        ) : rules.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-500">
             عذراً، لا توجد مواد قانونية متاحة حالياً.
          </div>
        ) : (
          <div className="space-y-8">
             {chapters.map((chapterName, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-primary-50 px-6 py-5 border-b border-primary-100 flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-primary-600" />
                    <h2 className="text-xl font-bold text-ghaith-navy">{chapterName}</h2>
                  </div>
                  <div className="p-6 md:p-8 space-y-8">
                    {rules.filter(r => r.chapter_title === chapterName).map(rule => (
                      <div key={rule.id} className="flex gap-4 md:gap-6">
                        <div className="shrink-0 w-12 h-12 bg-gray-50 text-gray-500 border border-gray-100 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
                          {rule.article_number}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{rule.article_title}</h3>
                          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{rule.article_content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             ))}
          </div>
        )}
      </main>
    </div>
  );
}
