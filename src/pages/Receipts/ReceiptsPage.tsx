import { useState, useEffect } from 'react';
import { receiptService } from '../../services/receipts.service';
import { FileText, Search, Printer, FileDown, X } from 'lucide-react';
import { Badge, LoadingSpinner, Button } from '../../components/ui';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReceiptPDF } from '../../components/receipts/ReceiptPDF';
import PaymentVoucher from '../../components/documents/PaymentVoucher';
import { useAuth } from '../../context/AuthContext';

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const data = await receiptService.getReceipts();
      setReceipts(data || []);
    } catch (error) {
      console.error('Error fetching receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: any) => {
    try {
      await receiptService.updateReceiptStatus(id, newStatus);
      setReceipts(receipts.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('حدث خطأ أثناء تحديث حالة الوثيقة');
    }
  };

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = 
      receipt.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (receipt.family?.target_person_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (receipt.family?.file_number || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = filterStatus === 'all' || receipt.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary-600" />
            سجل وثائق الاستفادة
          </h1>
          <p className="text-gray-500 mt-1">إدارة وتتبع وصولات ومساعدات المستفيدين</p>
        </div>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="بحث برقم الوثيقة، اسم المستفيد، أو رقم الملف..."
            className="w-full pr-10 pl-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="bg-white border text-sm border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">جميع الحالات</option>
          <option value="draft">مسودة</option>
          <option value="signed">موقعة</option>
          <option value="delivered">مسلمة</option>
          <option value="cancelled">ملغاة</option>
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><LoadingSpinner size="lg" /></div>
        ) : filteredReceipts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p>لا توجد وثائق مطابقة للبحث</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">الوثيقة</th>
                  <th className="px-6 py-4">المستفيد</th>
                  <th className="px-6 py-4">الاستفادة والمبلغ</th>
                  <th className="px-6 py-4">التاريخ</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReceipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-medium text-gray-900">{receipt.receipt_number}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{receipt.family?.target_person_name || 'غير معروف'}</div>
                      <div className="text-gray-500 text-xs">ملف: {receipt.family?.file_number}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-primary-700">{receipt.benefit_type}</div>
                      <div className="text-gray-600 font-bold">{receipt.amount.toLocaleString('ar-DZ')} د.ج</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(receipt.created_at).toLocaleDateString('ar-DZ')}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={
                        receipt.status === 'delivered' ? 'green' :
                        receipt.status === 'signed' ? 'blue' :
                        receipt.status === 'cancelled' ? 'red' : 'yellow'
                      }>
                        {receipt.status === 'draft' ? 'مسودة' :
                         receipt.status === 'signed' ? 'موقعة' :
                         receipt.status === 'delivered' ? 'مُسلمة' : 'مُلغاة'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {receipt.status === 'draft' && (
                          <button 
                            onClick={() => updateStatus(receipt.id, 'signed')}
                            className="text-xs px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded transition-colors"
                          >
                            تحديد كموقع
                          </button>
                        )}
                        {receipt.status === 'signed' && (
                          <button 
                            onClick={() => updateStatus(receipt.id, 'delivered')}
                            className="text-xs px-2 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded transition-colors"
                          >
                            تأكيد التسليم
                          </button>
                        )}
                        
                        <button 
                          onClick={() => setSelectedReceipt(receipt)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-primary-100"
                          title="معاينة Word"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>

                        <PDFDownloadLink
                          document={<ReceiptPDF receipt={receipt} branchName={user?.branchId === 'MSL' ? 'مسيلة' : 'الفرع'} />}
                          fileName={`receipt_${receipt.receipt_number}.pdf`}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                          title="طباعة PDF"
                        >
                          {() => <Printer className="w-4 h-4" />}
                        </PDFDownloadLink>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Word Preview Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 pr-0">
          <div className="bg-gray-100 rounded-r-none rounded-l-3xl w-full max-w-5xl h-[95vh] shadow-2xl relative flex flex-col overflow-hidden animate-in slide-in-from-left duration-500">
            <div className="bg-white p-4 border-b flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg text-primary-900">معاينة وتصدير مستند Word</h3>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-8">
              <div className="max-w-4xl mx-auto">
                <PaymentVoucher 
                  beneficiaryName={selectedReceipt.family?.target_person_name || 'غير معروف'}
                  amount={selectedReceipt.amount}
                  occasion={selectedReceipt.benefit_type}
                  refNumber={selectedReceipt.receipt_number}
                  month={new Date(selectedReceipt.created_at).toLocaleString('ar-DZ', { month: 'long' })}
                  onClose={() => setSelectedReceipt(null)}
                />
              </div>
            </div>
            <div className="bg-white p-4 border-t flex justify-end shrink-0">
              <Button onClick={() => setSelectedReceipt(null)} variant="secondary">إغلاق المعاينة</Button>
            </div>
          </div>
          <div className="hidden lg:block lg:flex-1 h-full cursor-pointer" onClick={() => setSelectedReceipt(null)} />
        </div>
      )}
    </div>
  );
}
