import { FileText, Shield, Award, BookOpen } from 'lucide-react';

export default function RegulationsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-12 py-8 animate-fade-in font-['Cairo'] pb-24" dir="rtl">
            {/* Header */}
            <header className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-3 bg-ghaith-navy/10 rounded-2xl mb-4">
                    <Shield className="w-10 h-10 text-ghaith-navy shadow-sm" />
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-slate-100">ميثاق جمعية غيث الولائية</h1>
                <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
                    القواعد والمبادئ القانونية والتنظيمية التي تحكم عملنا وتضمن شفافية وفعالية نشاطنا الإنساني.
                </p>
            </header>

            {/* Navigation Anchor */}
            <div className="flex justify-center gap-4 sticky top-4 z-10">
                <a href="#statutes" className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 font-bold text-ghaith-navy dark:text-slate-200">
                    القانون الأساسي
                </a>
                <a href="#internal" className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 font-bold text-ghaith-navy dark:text-slate-200">
                    النظام الداخلي
                </a>
            </div>

            {/* Statutes Section */}
            <section id="statutes" className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700/50">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">أولاً: القانون الأساسي</h2>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none text-gray-600 dark:text-slate-300 space-y-6 text-lg leading-relaxed">
                    <div className="p-6 bg-gray-50 dark:bg-slate-900/40 rounded-2xl border-l-4 border-ghaith-navy">
                        <h3 className="text-xl font-bold text-ghaith-navy dark:text-slate-200 mb-2">المادة 01: التسمية</h3>
                        <p>تأسست "جمعية غيث الولائية" لترقية النشاطات الإنسانية والاجتماعية بموجب القوانين الجزائرية المعمول بها.</p>
                    </div>

                    <div className="p-6 bg-gray-50 dark:bg-slate-900/40 rounded-2xl border-l-4 border-ghaith-navy">
                        <h3 className="text-xl font-bold text-ghaith-navy dark:text-slate-200 mb-2">المادة 02: الأهداف</h3>
                        <p>تهدف الجمعية إلى:</p>
                        <ul className="list-disc pr-6 space-y-2">
                            <li>تقديم المساعدات الإنسانية والاجتماعية للعائلات المعوزة.</li>
                            <li>رعاية الأيتام والأرامل والعمل على إدماجهم الاجتماعي.</li>
                            <li>تنظيم حملات تضامنية في المناسبات الدينية والوطنية.</li>
                            <li>نشر ثقافة التطوع والعمل الخيري في أوساط المجتمع.</li>
                        </ul>
                    </div>

                    <div className="p-6 bg-gray-50 dark:bg-slate-900/40 rounded-2xl border-l-4 border-ghaith-navy">
                        <h3 className="text-xl font-bold text-ghaith-navy dark:text-slate-200 mb-2">المادة 03: العضوية</h3>
                        <p>تفتح العضوية لكل المواطنين الذين تتوفر فيهم الشروط الأخلاقية والقانونية والملتزمين بمبادئ الجمعية.</p>
                    </div>
                </div>
            </section>

            {/* Internal Rules Section */}
            <section id="internal" className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700/50">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                        <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">ثانياً: النظام الداخلي</h2>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none text-gray-600 dark:text-slate-300 space-y-6 text-lg leading-relaxed">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 border border-gray-100 dark:border-slate-700 rounded-2xl">
                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-ghaith-navy text-white text-xs flex items-center justify-center">01</span>
                                الانضباط الالتزام
                            </h3>
                            <p className="text-sm">يجب على كل عضو احترام المواعيد المحددة للنشاطات والحفاظ على سمعة الجمعية في كل المحافل.</p>
                        </div>
                        <div className="p-6 border border-gray-100 dark:border-slate-700 rounded-2xl">
                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-ghaith-navy text-white text-xs flex items-center justify-center">02</span>
                                إدارة الموارد
                            </h3>
                            <p className="text-sm">تخضع جميع الموارد المالية والعينية لرقابة صارمة، ويمنع استخدام ممتلكات الجمعية لأغراض شخصية.</p>
                        </div>
                        <div className="p-6 border border-gray-100 dark:border-slate-700 rounded-2xl">
                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-ghaith-navy text-white text-xs flex items-center justify-center">03</span>
                                العمل الجماعي
                            </h3>
                            <p className="text-sm">تتخذ القرارات في الجمعية بناءً على مبدأ الشورى والتصويت بالأغلبية كما يحدده القانون.</p>
                        </div>
                        <div className="p-6 border border-gray-100 dark:border-slate-700 rounded-2xl">
                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-ghaith-navy text-white text-xs flex items-center justify-center">04</span>
                                الخصوصية
                            </h3>
                            <p className="text-sm">يمنع منعاً باتاً تسريب بيانات العائلات المستفيدة أو التشهير بهم بأي شكل من الأشكال.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Note */}
            <div className="text-center text-gray-500 dark:text-slate-400 text-sm">
                <p>تم المصادقة على هذا الميثاق من طرف المكتب الولائي لجمعية غيث.</p>
                <p className="mt-2 flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    تحميل نسخة PDF (قريباً)
                </p>
            </div>
        </div>
    );
}
