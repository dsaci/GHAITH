import { useState } from 'react';
import { 
    FileText, Printer, FileCode, Loader2
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from 'docx';
import { Button } from '../ui';

interface PaymentVoucherProps {
    beneficiaryName: string;
    amount: number;
    occasion: string;
    month: string;
    refNumber: string;
    onClose?: () => void;
}

export default function PaymentVoucher({ 
    beneficiaryName, 
    amount, 
    occasion, 
    month, 
    refNumber,
    onClose 
}: PaymentVoucherProps) {
    const [exporting, setExporting] = useState<'pdf' | 'word' | null>(null);

    const currentDate = new Date().toLocaleDateString('ar-DZ', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    const associationHeader = {
        right: "جمعية غيث للعمل الخيري و الإنساني\nالمكتب الولائي لولاية المسيلة",
        left: "جمعية ولائية – ولاية المسيلة – معتمدة تحت رقم 02 بتاريخ 04/04/2024.\nجمعية غيث للعمل الخيري والإنساني ذات طابع خيري تضامني\nتنشط على مستوى ولاية المسيلة و ما جاورها"
    };

    const exportToWord = async () => {
        try {
            setExporting('word');
            
            const doc = new Document({
                sections: [{
                    properties: {
                        page: {
                            margin: { top: 720, right: 720, bottom: 720, left: 720 },
                        },
                    },
                    children: [
                        // Header Table for RTL look
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: {
                                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                                left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                                insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
                            },
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            children: [new Paragraph({
                                                children: [new TextRun({ text: associationHeader.left, size: 18, font: "Cairo" })],
                                                alignment: AlignmentType.LEFT
                                            })],
                                        }),
                                        new TableCell({
                                            children: [new Paragraph({
                                                children: [new TextRun({ text: associationHeader.right, bold: true, size: 22, font: "Cairo" })],
                                                alignment: AlignmentType.RIGHT
                                            })],
                                        }),
                                    ],
                                }),
                            ],
                        }),

                        new Paragraph({ spacing: { before: 400, after: 400 } }),

                        new Paragraph({
                            children: [new TextRun({ text: `الموضوع: قسيمة شهر ${month}`, bold: true, size: 28, font: "Cairo" })],
                            alignment: AlignmentType.CENTER
                        }),

                        new Paragraph({
                            children: [new TextRun({ text: `المرجع: ${refNumber}`, size: 20, font: "Cairo" })],
                            alignment: AlignmentType.RIGHT,
                            spacing: { before: 200 }
                        }),

                        new Paragraph({
                            children: [new TextRun({ text: `المستفيد(ة): ${beneficiaryName}`, bold: true, size: 24, font: "Cairo" })],
                            alignment: AlignmentType.RIGHT,
                            spacing: { before: 200 }
                        }),

                        new Paragraph({
                            children: [new TextRun({ text: "يسعدنا أن نحيطكم علما بقيامنا هذا اليوم ولصالحكم بالدفع الموالي:", size: 22, font: "Cairo" })],
                            alignment: AlignmentType.RIGHT,
                            spacing: { before: 400, after: 400 }
                        }),

                        // Main Data Table
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph({ text: "الموضوع", alignment: AlignmentType.CENTER, children: [new TextRun({ bold: true, font: "Cairo" })] })] }),
                                        new TableCell({ children: [new Paragraph({ text: "المبلغ", alignment: AlignmentType.CENTER, children: [new TextRun({ bold: true, font: "Cairo" })] })] }),
                                    ]
                                }),
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph({ text: `قسيمة لشهر ${month} بمناسبة "${occasion}"`, alignment: AlignmentType.RIGHT, children: [new TextRun({ font: "Cairo" })] })] }),
                                        new TableCell({ children: [new Paragraph({ text: `${amount} دج`, alignment: AlignmentType.CENTER, children: [new TextRun({ font: "Cairo" })] })] }),
                                    ]
                                }),
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph({ text: "المجموع", alignment: AlignmentType.CENTER, children: [new TextRun({ bold: true, font: "Cairo" })] })] }),
                                        new TableCell({ children: [new Paragraph({ text: `${amount} دج`, alignment: AlignmentType.CENTER, children: [new TextRun({ bold: true, font: "Cairo" })] })] }),
                                    ]
                                }),
                            ]
                        }),

                        new Paragraph({
                            children: [new TextRun({ text: "طريقة التسديد : نقدًا.", size: 20, font: "Cairo" })],
                            alignment: AlignmentType.RIGHT,
                            spacing: { before: 400 }
                        }),

                        new Paragraph({
                            children: [new TextRun({ text: "تفضلوا بقبول تحياتنا الخالصة.", size: 20, font: "Cairo" })],
                            alignment: AlignmentType.RIGHT
                        }),

                        new Paragraph({
                            children: [new TextRun({ text: `المسيلة في: ${currentDate}`, size: 20, font: "Cairo" })],
                            alignment: AlignmentType.RIGHT,
                            spacing: { before: 200, after: 400 }
                        }),

                        // Signatures Table
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: {
                                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                                left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                                insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
                            },
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph({ text: "إمضاء المستفيد(ة):", alignment: AlignmentType.CENTER, children: [new TextRun({ font: "Cairo" })] })] }),
                                        new TableCell({ children: [new Paragraph({ text: "أمين المال: ساسي عبد النور", alignment: AlignmentType.CENTER, children: [new TextRun({ font: "Cairo" })] })] }),
                                        new TableCell({ children: [new Paragraph({ text: "رئيس الجمعية: ابراهيمي أحمد أشرف", alignment: AlignmentType.CENTER, children: [new TextRun({ font: "Cairo" })] })] }),
                                    ]
                                })
                            ]
                        }),

                        new Paragraph({
                            children: [new TextRun({ text: "يعد هذا السند وثيقة لازمة تُقدم للجهات الوصية وفيه جدول يحصي المبلغ المسلم.", bold: true, size: 16, font: "Cairo" })],
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 800 }
                        }),
                    ],
                }],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `وصل_استفادة_${beneficiaryName}_${month}.docx`);
        } catch (error) {
            console.error('Word export failed:', error);
        } finally {
            setExporting(null);
        }
    };

    const printVoucher = () => {
        window.print();
    };

    return (
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-w-4xl mx-auto my-8 print:shadow-none print:border-0" dir="rtl">
            {/* Action Bar (Not visible in print) */}
            <div className="bg-gray-50/80 backdrop-blur-md px-8 py-4 border-b border-gray-100 flex items-center justify-between print:hidden">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-200">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">معاينة وثيقة الاستفادة</h3>
                        <p className="text-xs text-gray-500">مستند رسمي - جمعية غيث</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={exportToWord}
                        className="gap-2"
                        disabled={!!exporting}
                    >
                        {exporting === 'word' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCode className="w-4 h-4" />}
                        تصدير Word
                    </Button>
                    <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={printVoucher}
                        className="gap-2 bg-primary-600 hover:bg-primary-700"
                    >
                        <Printer className="w-4 h-4" />
                        طباعة الملحق
                    </Button>
                    {onClose && (
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors mr-2">
                            <span className="text-xl">×</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Voucher Content */}
            <div className="p-12 font-['Cairo',_sans-serif] text-gray-900 printable-area bg-white relative">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-12 gap-8 text-[12px] leading-relaxed">
                    <div className="w-1/3 text-right">
                        <p className="font-bold text-[14px] text-primary-800 mb-1">جمعية غيث للعمل الخيري و الإنساني</p>
                        <p className="font-bold text-gray-700">المكتب الولائي لولاية المسيلة</p>
                    </div>
                    <div className="w-1/3 flex justify-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-full border-2 border-primary-100 flex items-center justify-center text-primary-200 font-bold italic">
                            LOGO
                        </div>
                    </div>
                    <div className="w-1/3 text-left text-gray-500 font-medium">
                        <p>جمعية ولائية – ولاية المسيلة – معتمدة تحت رقم 02 بتاريخ 04/04/2024.</p>
                        <p className="mt-1">جمعية غيث للعمل الخيري والإنساني ذات طابع خيري تضامنـي</p>
                    </div>
                </div>

                {/* Main Body */}
                <div className="text-center mb-10">
                    <h1 className="text-2xl font-black text-gray-900 border-b-4 border-primary-600 inline-block pb-1">
                        الموضوع: قسيمة شهر {month}
                    </h1>
                </div>

                <div className="space-y-6 mb-10">
                    <div className="flex justify-between items-end">
                        <p className="text-sm font-bold text-gray-600">المرجع: <span className="font-mono text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{refNumber}</span></p>
                        <p className="text-lg">المستفيد(ة): <span className="font-black text-primary-700 bg-primary-50 px-3 py-1 rounded-lg">{beneficiaryName}</span></p>
                    </div>
                    
                    <p className="text-lg leading-loose">
                        يسعدنا أن نحيطكم علما بقيامنا هذا اليوم ولصالحكم بالدفع الموالي:
                    </p>
                </div>

                {/* Financial Table */}
                <div className="overflow-hidden border-2 border-gray-900 rounded-xl mb-10">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-900 text-white">
                                <th className="border-l border-white/20 py-4 px-6 text-xl font-black">الموضوع</th>
                                <th className="py-4 px-6 text-xl font-black w-1/3 text-center">المبلغ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b-2 border-gray-900">
                                <td className="py-6 px-6 text-lg font-bold">
                                    قسيمة لشهر {month} بمناسبة "{occasion}"
                                </td>
                                <td className="py-6 px-6 text-2xl font-black text-center border-r-2 border-gray-900 bg-gray-50">
                                    {amount.toLocaleString('ar-DZ')} دج
                                </td>
                            </tr>
                            <tr className="bg-gray-100">
                                <td className="py-4 px-6 text-xl font-black text-right">المجموع</td>
                                <td className="py-4 px-6 text-2xl font-black text-center border-r-2 border-gray-900 text-primary-700">
                                    {amount.toLocaleString('ar-DZ')} دج
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Closing */}
                <div className="space-y-2 mb-12 text-lg">
                    <p className="font-bold">طريقة التسديد : <span className="text-primary-600 underline underline-offset-4 decoration-dotted">نقدًا.</span></p>
                    <p>تفضلوا بقبول تحياتنا الخالصة.</p>
                </div>

                <div className="flex justify-between items-start mb-16">
                    <p className="text-sm font-bold text-gray-500 italic">المسيلة في: {currentDate}</p>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 text-center mb-10">
                    <div className="space-y-2">
                        <p className="font-black text-gray-900 underline underline-offset-4">رئيس الجمعية:</p>
                        <p className="font-bold text-primary-800">ابراهيمي أحمد أشرف</p>
                    </div>
                    <div className="space-y-2">
                        <p className="font-black text-gray-900 underline underline-offset-4">أمين المال:</p>
                        <p className="font-bold text-primary-800">ساسي عبد النور</p>
                    </div>
                </div>

                <div className="flex justify-end mb-10">
                    <div className="w-64 space-y-2 text-center">
                        <p className="font-black text-gray-900 underline underline-offset-4">إمضاء المستفيد(ة):</p>
                        <div className="h-28 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center">
                            <span className="text-xs text-gray-300">مكان التوقيع والبصمة</span>
                        </div>
                    </div>
                </div>

                {/* Official Note */}
                <div className="mt-12 pt-6 border-t border-gray-100 text-center">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-relaxed max-w-2xl mx-auto">
                        يعد هذا السند وثيقة لازمة تُقدم للجهات الوصية وفيه جدول يحصي المبلغ المسلم.
                    </p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { margin: 0; size: portrait; }
                    body { -webkit-print-color-adjust: exact; background: white; }
                    .printable-area { padding: 40px !important; }
                    .print\\:hidden { display: none !important; }
                }
            ` }} />
        </div>
    );
}
