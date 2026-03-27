import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

function rtlParagraph(text: string, opts?: { bold?: boolean; heading?: boolean }) {
    return new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 120 },
        children: [
            new TextRun({
                text,
                font: 'Cairo',
                bold: opts?.bold,
                size: opts?.heading ? 28 : 22,
                rightToLeft: true,
            }),
        ],
    });
}

export async function downloadLiteraryDocx(payload: {
    title: string;
    year: number;
    intro: string;
    objectives: string[];
    bodySection: string;
    secretaryName: string;
    presidentName: string;
}) {
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    rtlParagraph(payload.title, { bold: true, heading: true }),
                    rtlParagraph(`التقرير الأدبي لسنة ${payload.year}`, { bold: true }),
                    rtlParagraph('تمهيد:', { bold: true }),
                    rtlParagraph(payload.intro),
                    rtlParagraph('الأهداف:', { bold: true }),
                    ...payload.objectives.map((o) => rtlParagraph(`• ${o}`)),
                    rtlParagraph('التقرير الأدبي:', { bold: true }),
                    rtlParagraph(payload.bodySection),
                    rtlParagraph(`الكاتب العام: ${payload.secretaryName}`),
                    rtlParagraph(`رئيس الجمعية: ${payload.presidentName}`),
                ],
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `التقرير_الأدبي_${payload.year}.docx`);
}

export async function downloadFinancialDocx(payload: { title: string; sections: { heading: string; lines: string[] }[] }) {
    const children: Paragraph[] = [];
    children.push(rtlParagraph(payload.title, { bold: true, heading: true }));
    for (const sec of payload.sections) {
        children.push(rtlParagraph(sec.heading, { bold: true }));
        for (const line of sec.lines) {
            children.push(rtlParagraph(line));
        }
    }
    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${payload.title.replace(/\s+/g, '_')}.docx`);
}

export function printReportFromElement(elementId: string) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const w = window.open('', '_blank', 'width=900,height=1200');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head>
    <meta charset="utf-8"/>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet"/>
    <style>
      body { font-family: 'Cairo', sans-serif; padding: 24px; color: #111; }
      @media print { body { padding: 12px; } }
    </style></head><body>`);
    w.document.write(el.innerHTML);
    w.document.write('</body></html>');
    w.document.close();
    w.focus();
    w.print();
    w.close();
}
