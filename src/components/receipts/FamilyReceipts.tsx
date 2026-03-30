import { useEffect, useState } from 'react';
import { receiptService, BenefitReceipt } from '../../services/receipts.service';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReceiptPDF } from './ReceiptPDF';
import { Plus, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FamilyReceipts = ({ familyId, branchName, familyName, fileNumber }: any) => {
  const [receipts, setReceipts] = useState<BenefitReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    receiptService.getReceiptsByFamily(familyId).then(data => {
      setReceipts(data as BenefitReceipt[] || []);
      setLoading(false);
    });
  }, [familyId]);

  if (loading) return <div className="p-8 text-center text-gray-500">جاري التحميل...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
        <h3 className="font-bold">وثائق الاستفادة ({receipts.length})</h3>
        <Link 
          to={`/beneficiaries/${familyId}/receipt/new`} 
          className="btn-primary flex items-center gap-2 text-sm text-white px-3 py-1.5 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          إضافة وثيقة
        </Link>
      </div>

      <div className="grid gap-3">
        {receipts.length === 0 ? (
          <p className="text-gray-500 text-center py-6">لا توجد وثائق استفادة. يمكنك إضافة وثيقة جديدة.</p>
        ) : (
          receipts.map(receipt => (
            <div key={receipt.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-white border border-gray-100 shadow-sm rounded-xl gap-4">
              <div>
                <div className="text-sm font-bold text-gray-900">{receipt.receipt_number}</div>
                <div className="text-sm text-gray-500">{receipt.benefit_type} • {receipt.benefit_value} د.ج</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(receipt.created_at).toLocaleDateString('ar-DZ')}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-md ${
                  receipt.status === 'draft' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 
                  receipt.status === 'signed' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 
                  'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {receipt.status === 'draft' ? 'مسودة' : receipt.status === 'signed' ? 'موقعة' : 'مسلمة'}
                </span>
                
                <PDFDownloadLink
                  document={<ReceiptPDF receipt={{
                    ...receipt, 
                    family: { family_name: familyName, registration_number: fileNumber }
                  }} branchName={branchName} />}
                  fileName={`receipt_${receipt.receipt_number}.pdf`}
                  className="bg-white border hover:bg-gray-50 text-gray-700 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  {({ loading }: any) => (
                    <>
                      <Printer className="w-4 h-4" />
                      {loading ? '...' : 'طباعة'}
                    </>
                  )}
                </PDFDownloadLink>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
