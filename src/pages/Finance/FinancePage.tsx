import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Download, Loader2 } from 'lucide-react';
import { getTransactions, getSummary, createTransaction, getGlobalSummary } from '../../services/finance.service';
import { Badge, Button, LoadingSpinner } from '../../components/ui';
import type { TransactionType } from '../../types';

interface FinanceRow {
  id: string
  [key: string]: string | number | boolean | null
}

const CATEGORY_LABELS: Record<string, string> = {
    member_fees: 'اشتراكات الأعضاء', donations: 'تبرعات', grants: 'منح',
    government_support: 'دعم حكومي', activity_revenue: 'عائد أنشطة', other_income: 'دخل آخر',
    beneficiary_aid: 'مساعدات مستفيدين', activity_expense: 'مصاريف أنشطة',
    admin_expense: 'مصاريف إدارية', equipment: 'معدات', transport: 'نقل', other_expense: 'مصروف آخر',
};

const PAY_LABELS: Record<string, string> = { cash: 'نقداً', bank_transfer: 'تحويل بنكي', check: 'شيك', other: 'آخر' };

export default function FinancePage() {
    const [transactions, setTransactions] = useState<Record<string, unknown>[]>([]);
    const [stats, setStats] = useState({ income_total: 0, expense_total: 0, balance: 0, globalBalance: 0 });
    const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        amount: '',
        transaction_type: 'income' as TransactionType,
        category: 'donations',
        description: '',
        payment_method: 'cash',
        transaction_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchData();
    }, [typeFilter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const currentYear = new Date().getFullYear();
            
            // 1. Fetch transactions FIRST (Guarantee visibility)
            // Fix bug where typeFilter caused year to become NaN
            const txResponse = await getTransactions({ 
                year: currentYear, 
                type: typeFilter || undefined 
            });
            if (txResponse.error) {
                console.error("Finance Page: Transaction fetch failed", txResponse.error);
            }
            setTransactions(txResponse.data || []);

            // 2. Fetch summaries (Don't let these block the UI if they fail)
            try {
                const s = await getSummary(currentYear);
                const g = await getGlobalSummary();
                setStats({
                    income_total: s.income_total,
                    expense_total: s.expense_total,
                    balance: s.balance,
                    globalBalance: g.balance
                });
            } catch (sumErr) {
                console.warn("Summaries failed to load", sumErr);
            }

        } catch (err) {
            console.error('Critical Error in finance page:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await createTransaction({
                ...formData,
                amount: Number(formData.amount)
            });
            setShowModal(false);
            fetchData();
        } catch (err: unknown) {
            console.error('Error creating transaction:', err);
            const msg = err instanceof Error ? err.message : 'Unknown error';
            alert(`حدث خطأ أثناء إضافة المعاملة: ${msg}`);
        } finally {
            setIsSaving(false);
        }
    };

    const fmt = (n: number) => n.toLocaleString('ar-DZ') + ' دج';

    return (
        <div className="space-y-6 animate-fade-in" dir="rtl">
            <div className="page-header">
                <div>
                    <h2 className="page-title">السجلات المالية</h2>
                    <p className="text-gray-500 text-sm">إدارة الميزانية والتدفقات النقدية للجمعية</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" icon={<Download className="w-4 h-4" />}>تصدير</Button>
                    <Button onClick={() => setShowModal(true)} icon={<Plus className="w-4 h-4" />}>معاملة جديدة</Button>
                </div>
            </div>

            {/* Treasury summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white border-0 shadow-lg shadow-primary-100">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-6 h-6 opacity-80" />
                        <span className="text-sm opacity-80">الرصيد الحالي (التراكمي)</span>
                    </div>
                    <p className="text-4xl font-black">{fmt(stats.globalBalance)}</p>
                    <p className="text-xs opacity-60 mt-1 italic group-hover:not-italic">الرصيد الكلي المتوفر في الخزينة</p>
                </div>
                <div className="card">
                    <div className="flex items-center gap-3 mb-2 text-green-600">
                        <TrendingUp className="w-6 h-6" />
                        <span className="text-sm font-bold">إجمالي المدخولات</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900">{fmt(stats.income_total)}</p>
                    <p className="text-xs text-gray-400 mt-1 italic">للسنة المالية الحالية</p>
                </div>
                <div className="card">
                    <div className="flex items-center gap-3 mb-2 text-red-500">
                        <TrendingDown className="w-6 h-6" />
                        <span className="text-sm font-bold">إجمالي المصروفات</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900">{fmt(stats.expense_total)}</p>
                    <p className="text-xs text-gray-400 mt-1 italic">للسنة المالية الحالية</p>
                </div>
            </div>

            {/* Transactions list */}
            <div className="card min-h-[400px]">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <h3 className="section-title mb-0">سجل المعاملات</h3>
                    <div className="flex gap-2 bg-gray-50 p-1 rounded-xl">
                        {(['', 'income', 'expense'] as const).map((type) => (
                            <button key={type} onClick={() => setTypeFilter(type)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-black transition-all ${typeFilter === type ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                {type === '' ? 'الكل' : type === 'income' ? 'مدخولات' : 'مخرجات'}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-24 border-2 border-dashed border-gray-100 rounded-2xl">
                        <DollarSign className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold">لا توجد معاملات مسجلة</p>
                    </div>
                ) : (
                    <div className="table-container pt-0">
                        <table className="w-full bg-white">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    {['التاريخ', 'النوع', 'الفئة', 'الوصف', 'طريقة الدفع', 'المبلغ'].map(h => (
                                        <th key={h} className="table-header py-4">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {(transactions as FinanceRow[]).map((t: FinanceRow) => (
                                    <tr key={t.id} className="table-row group">
                                        <td className="table-cell text-gray-500 text-xs font-bold">{String(t.transaction_date ?? '')}</td>
                                        <td className="table-cell">
                                            <Badge variant={t.transaction_type === 'income' ? 'green' : 'red'}>
                                                {t.transaction_type === 'income' ? 'دخل' : 'مصروف'}
                                            </Badge>
                                        </td>
                                        <td className="table-cell text-xs font-bold text-gray-700">{CATEGORY_LABELS[String(t.category)] || String(t.category ?? '')}</td>
                                        <td className="table-cell text-sm text-gray-600 max-w-xs truncate" title={String(t.description ?? '')}>{String(t.description ?? '')}</td>
                                        <td className="table-cell text-xs font-medium text-gray-500">{PAY_LABELS[String(t.payment_method)]}</td>
                                        <td className={`table-cell font-black ${t.transaction_type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                            {t.transaction_type === 'income' ? '+' : '-'}{Number(t.amount).toLocaleString('ar-DZ')} دج
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal for new transaction */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
                        <form onSubmit={handleSave}>
                            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <h3 className="text-xl font-black text-gray-900">إضافة معاملة جديدة</h3>
                                <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
                            </div>
                            
                            <div className="p-8 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 mb-2">النوع</label>
                                        <select 
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold outline-none ring-primary-500/20 focus:ring-4"
                                            value={formData.transaction_type}
                                            onChange={e => setFormData({ ...formData, transaction_type: e.target.value as TransactionType })}
                                        >
                                            <option value="income">مدخول</option>
                                            <option value="expense">مصروف</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 mb-2">المبلغ (دج)</label>
                                        <input 
                                            type="number" required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold outline-none ring-primary-500/20 focus:ring-4"
                                            value={formData.amount}
                                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-500 mb-2">الفئة</label>
                                    <select 
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold outline-none ring-primary-500/20 focus:ring-4"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                                            <option key={k} value={k}>{v}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-500 mb-2">الوصف</label>
                                    <input 
                                        type="text" required
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold outline-none ring-primary-500/20 focus:ring-4"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="مثال: تبرع من فاعل خير لفائدة الأرامل"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 mb-2">طريقة الدفع</label>
                                        <select 
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold outline-none ring-primary-500/20 focus:ring-4"
                                            value={formData.payment_method}
                                            onChange={e => setFormData({ ...formData, payment_method: e.target.value })}
                                        >
                                            <option value="cash">نقداً</option>
                                            <option value="bank_transfer">تحويل بنكي</option>
                                            <option value="check">شيك</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 mb-2">التاريخ</label>
                                        <input 
                                            type="date" required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold outline-none ring-primary-500/20 focus:ring-4"
                                            value={formData.transaction_date}
                                            onChange={e => setFormData({ ...formData, transaction_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-8 py-6 flex gap-3">
                                <Button type="submit" className="flex-1 bg-primary-600 hover:bg-primary-700" disabled={isSaving}>
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'حفظ المعاملة'}
                                </Button>
                                <Button type="button" variant="secondary" onClick={() => setShowModal(false)} disabled={isSaving}>إلغاء</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
