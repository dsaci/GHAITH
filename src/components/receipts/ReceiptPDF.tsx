import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { BenefitReceipt } from '../../services/receipts.service';
import { formatArabicDate } from '../../utils/arabicDate';

// Register Arabic Font for React PDF
Font.register({
  family: 'Amiri',
  src: '/assets/fonts/Amiri-Regular.ttf',
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Amiri',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottomWidth: 2,
    borderBottomColor: '#10B981',
    paddingBottom: 10,
  },
  logoSpace: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 16,
    textAlign: 'center',
    flex: 1,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    textDecoration: 'underline',
  },
  row: {
    flexDirection: 'row-reverse',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    width: 150,
    color: '#374151',
    textAlign: 'right',
  },
  value: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  amountBox: {
    backgroundColor: '#F3F4F6',
    padding: 15,
    marginVertical: 20,
    borderRadius: 8,
  },
  signatures: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 60,
  },
  signatureBox: {
    alignItems: 'center',
    width: '30%',
  },
  signatureLine: {
    marginTop: 40,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#6B7280',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  }
});

interface Props {
  receipt: BenefitReceipt & {
    family?: {
      family_name: string;
      registration_number: string;
    };
    creator?: { full_name: string };
  };
  branchName: string;
}

export const ReceiptPDF: React.FC<Props> = ({ receipt, branchName }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1, alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 12, marginBottom: 4 }}>رقم الوثيقة:</Text>
            <Text style={{ fontSize: 14, color: '#EF4444' }}>{receipt.receipt_number}</Text>
            <Text style={{ fontSize: 11, marginTop: 4 }}>التاريخ: {formatArabicDate(new Date(receipt.created_at || new Date()))}</Text>
          </View>
          <View style={styles.logoSpace}>
            <Text style={{ fontSize: 10, color: '#9CA3AF' }}>غيث</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 12, marginBottom: 4 }}>الجمهورية الجزائرية الديمقراطية الشعبية</Text>
            <Text style={{ fontSize: 12, marginBottom: 4 }}>جمعية غيث الولائية</Text>
            <Text style={{ fontSize: 12 }}>فرع {branchName}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>وثيقة استفادة</Text>

        {/* Content */}
        <View style={styles.row}>
          <Text style={styles.value}>{receipt.family?.family_name || '______________'}</Text>
          <Text style={styles.label}>اسم المستفيد:</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.value}>{receipt.family?.registration_number || '______________'}</Text>
          <Text style={styles.label}>رقم الملف:</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.value}>{receipt.benefit_type}</Text>
          <Text style={styles.label}>نوع الاستفادة:</Text>
        </View>

        <View style={styles.amountBox}>
          <View style={styles.row}>
            <Text style={styles.value}>{(receipt.benefit_value || 0).toLocaleString('ar-DZ')} د.ج</Text>
            <Text style={styles.label}>المبلغ بالأرقام:</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.value}>{receipt.benefit_value_in_words}</Text>
            <Text style={styles.label}>المبلغ بالحروف:</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.value}>{receipt.benefit_description || 'لا يوجد تفاصيل إضافية'}</Text>
            <Text style={styles.label}>البيان:</Text>
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.signatures}>
          <View style={styles.signatureBox}>
            <Text style={{ fontSize: 12 }}>توقيع المستفيد</Text>
            <View style={styles.signatureLine} />
          </View>
          <View style={styles.signatureBox}>
            <Text style={{ fontSize: 12 }}>أمين المال</Text>
            <View style={styles.signatureLine} />
          </View>
          <View style={styles.signatureBox}>
            <Text style={{ fontSize: 12 }}>رئيس الفرع البلدي</Text>
            <View style={styles.signatureLine} />
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          تم استخراج هذه الوثيقة من المنصة الرقمية لجمعية غيث - جميع الحقوق محفوظة
        </Text>
      </Page>
    </Document>
  );
};
