import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { receiptService } from '../../services/receipts.service';
import { supabase } from '../../lib/supabase';
import { ArrowRight, Save, Loader2 } from 'lucide-react';
import { Input, Button } from '../../components/ui';

export default function BenefitForm() {
  const { id: familyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [family, setFamily] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    benefit_type: 'مالية' as 'مالية' | 'غذائية' | 'عينية',
    amount: '',
    description: ''
  });

  useEffect(() => {
    const fetchFamily = async () => {
      if (!familyId) return;
      const { data } = await supabase
        .from('families')
        .select('*')
        .eq('id', familyId)
        .single();
      setFamily(data);
    };
    fetchFamily();
  }, [familyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!family || !familyId) return;
    
    setLoading(true);
    try {
      await receiptService.createReceipt({
        family_id: familyId,
        branch_id: family.branch_id || family.branchId || 'MSL', // Handle both snake and camel case
        benefit_type: formData.benefit_type,
        amount: Number(formData.amount) || 0,
        description: formData.description
      });
      navigate(-1);
    } catch (error) {
      console.error('Error creating receipt:', error);
      alert('حدث خطأ أثناء حفظ وثيقة الاستفادة');
    } finally {
      setLoading(false);
    }
  };

  if (!family) return <div className="p-8 text-center text-gray-500">جاري التحميل...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in" dir="rtl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowRight className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إضافة وثيقة استفادة</h1>
          <p className="text-sm text-gray-500 mt-1">المستفيد: {family.family_name || family.familyName}</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نوع الاستفادة</label>
            <select
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              value={formData.benefit_type}
              onChange={(e) => setFormData({ ...formData, benefit_type: e.target.value as any })}
              required
            >
              <option value="مالية">مساعدة مالية</option>
              <option value="غذائية">مساعدة غذائية (سلة / قفة)</option>
              <option value="عينية">مساعدة عينية (أجهزة / أدوية / ملابس)</option>
            </select>
          </div>

          <Input
            label="المبلغ المالي (بدينار جزائري)"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="مثال: 5000"
            required
            min="0"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">البيان / التفاصيل</label>
            <textarea
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="تفاصيل إضافية حول الاستفادة..."
              rows={3}
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ وإصدار الوثيقة
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
