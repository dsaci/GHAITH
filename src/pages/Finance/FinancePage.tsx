import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Download } from 'lucide-react';
import { MOCK_TRANSACTIONS, MOCK_DASHBOARD_STATS } from '../../data/mockData';
import { Badge, Button } from '../../components/ui';
import type { TransactionType } from '../../types';

const CATEGORY_LABELS: Record<string, string> = {
    member_fees: 'اشتراكات الأعضاء', donations: 'تبرعات', grants: 'منح',
    government_support: 'دعم حكومي', activity_revenue: 'عائد أنشطة', other_income: 'دخل آخر',
    beneficiary_aid: 'مساعدات مستفيدين', activity_expense: 'مصاريف أنشطة',
    admin_expense: 'مصاريف إدارية', equipment: 'معدات', transport: 'نقل', other_expense: 'مصروف آخر',
};
const PAY_LABELS: Record<string, string> = { cash: 'نقداً', bank_transfer: 'تحويل بنكي', check: 'شيك', other: 'آخر' };

export default function FinancePage() {
    const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
    const stats = MOCK_DASHBOARD_STATS;
    const transactions = MOCK_TRANSACTIONS.filter(t => !typeFilter || t.transactionType === typeFilter);
    const totalIn = MOCK_TRANSACTIONS.filter(t => t.transactionType === 'income').reduce((s, t) => s + t.amount, 0);
    const totalOut = MOCK_TRANSACTIONS.filter(t => t.transactionType === 'expense').reduce((s, t) => s + t.amount, 0);
    const fmt = (n: number) => n.toLocaleString('ar-DZ') + ' دج';

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <h2 className="page-title">السجلات المالية</h2>
                <div className="flex gap-2">
                    <Button variant="secondary" icon={<Download className="w-4 h-4" />}>تصدير</Button>
                    <Button icon={<Plus className="w-4 h-4" />}>معاملة جديدة</Button>
                </div>
            </div>

            {/* Treasury summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white border-0">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-6 h-6 opacity-80" />
                        <span className="text-sm opacity-80">الرصيد الحالي</span>
                    </div>
                    <p className="text-4xl font-black">{fmt(stats.currentBalance)}</p>
                    <p className="text-xs opacity-60 mt-1">محدث تلقائياً</p>
                </div>
                <div className="card">
                    <div className="flex items-center gap-3 mb-2 text-green-600">
                        <TrendingUp className="w-6 h-6" />
                        <span className="text-sm font-medium">إجمالي الدخل</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{fmt(totalIn)}</p>
                    <p className="text-xs text-gray-400 mt-1">هذا الشهر</p>
                </div>
                <div className="card">
                    <div className="flex items-center gap-3 mb-2 text-red-500">
                        <TrendingDown className="w-6 h-6" />
                        <span className="text-sm font-medium">إجمالي المصروف</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{fmt(totalOut)}</p>
                    <p className="text-xs text-gray-400 mt-1">هذا الشهر</p>
                </div>
            </div>

            {/* Transactions list */}
            <div className="card">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <h3 className="section-title mb-0">سجل المعاملات</h3>
                    <div className="flex gap-2">
                        {(['', 'income', 'expense'] as const).map((type) => (
                            <button key={type} onClick={() => setTypeFilter(type)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${typeFilter === type ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                                {type === '' ? 'الكل' : type === 'income' ? 'مدخولات' : 'مخرجات'}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="table-container">
                    <table className="w-full bg-white">
                        <thead>
                            <tr>
                                {['التاريخ', 'النوع', 'الفئة', 'الوصف', 'طريقة الدفع', 'المبلغ'].map(h => (
                                    <th key={h} className="table-header">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(t => (
                                <tr key={t.id} className="table-row">
                                    <td className="table-cell text-gray-500 text-xs">{t.transactionDate}</td>
                                    <td className="table-cell">
                                        <Badge variant={t.transactionType === 'income' ? 'green' : 'red'}>
                                            {t.transactionType === 'income' ? 'دخل' : 'مصروف'}
                                        </Badge>
                                    </td>
                                    <td className="table-cell text-xs">{CATEGORY_LABELS[t.category] || t.category}</td>
                                    <td className="table-cell max-w-xs truncate" title={t.description}>{t.description}</td>
                                    <td className="table-cell text-xs">{PAY_LABELS[t.paymentMethod]}</td>
                                    <td className={`table-cell font-bold ${t.transactionType === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                                        {t.transactionType === 'income' ? '+' : '-'}{t.amount.toLocaleString('ar-DZ')} دج
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
