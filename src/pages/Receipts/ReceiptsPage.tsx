import { useState, useEffect } from 'react';
import { receiptService } from '../../services/receipts.service';
import { FileText, Search, Printer } from 'lucide-react';
import { Badge, LoadingSpinner } from '../../components/ui';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReceiptPDF } from '../../components/receipts/ReceiptPDF';
import { useAuth } from '../../context/AuthContext';

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
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
                        
                        <PDFDownloadLink
                          document={<ReceiptPDF receipt={receipt} branchName={user?.branchId === 'MSL' ? 'مسيلة' : 'الفرع'} />}
                          fileName={`receipt_${receipt.receipt_number}.pdf`}
                          className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors"
                          title="طباعة"
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
    </div>
  );
}
