import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register Arabic Font using direct TTF (WOFF is NOT supported by @react-pdf/renderer)
Font.register({
    family: 'Amiri',
    fonts: [
        {
            src: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/amiri/Amiri-Regular.ttf',
            fontWeight: 400,
        },
        {
            src: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/amiri/Amiri-Bold.ttf',
            fontWeight: 700,
        },
    ],
});

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 50,
        fontFamily: 'Amiri',
        direction: 'rtl',
    },
    header: {
        textAlign: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingBottom: 10,
    },
    headerLine: {
        fontSize: 14,
        marginBottom: 5,
        textAlign: 'center',
    },
    title: {
        fontSize: 22,
        textAlign: 'center',
        marginVertical: 20,
        fontWeight: 'bold',
        textDecoration: 'underline',
    },
    content: {
        fontSize: 14,
        lineHeight: 2,
        textAlign: 'right',
    },
    declaration: {
        fontSize: 14,
        marginBottom: 20,
        textAlign: 'right',
    },
    row: {
        flexDirection: 'row-reverse',
        marginBottom: 10,
    },
    label: {
        width: 120,
        fontWeight: 'bold',
    },
    value: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 2,
    },
    footer: {
        marginTop: 50,
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
    },
    signatureBlock: {
        textAlign: 'center',
        width: '40%',
    },
    note: {
        fontSize: 12,
        marginTop: 30,
        color: '#666',
        textAlign: 'right',
    }
});

interface Props {
    data: {
        full_name: string;
        birth_date: string;
        birth_place?: string;
        profession: string;
        specialization?: string;
        education_level?: string;
        phone: string;
        address: string;
        email?: string;
        social_media?: string;
        interests?: string[];
    };
    municipality: string;
}

export const VolunteerFormPDF: React.FC<Props> = ({ data, municipality }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.headerLine}>الجمهورية الجزائرية الديمقراطية الشعبية</Text>
                    <Text style={styles.headerLine}>جمعية غيث للعمل الخيري و الإنساني</Text>
                    <Text style={styles.headerLine}>المكتب الولائي لولاية المسيلة - فرع {municipality}</Text>
                </View>

                {/* Document Title */}
                <Text style={styles.title}>استمارة متطوع</Text>

                {/* Declaration */}
                <Text style={styles.declaration}>
                    يسعدني أن أعبر عن رغبتي في المساهمة في الأعمال التطوعية و الخيرية التي تنظمها جمعية غيث للعمل الخيري و الإنساني.
                </Text>

                {/* Form Data */}
                <View style={styles.content}>
                    <View style={styles.row}>
                        <Text style={styles.label}>الإسم واللقب:</Text>
                        <Text style={styles.value}>{data.full_name}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>تاريخ ومكان الميلاد:</Text>
                        <Text style={styles.value}>{data.birth_date} بـ {data.birth_place || '........'}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>المهنة:</Text>
                        <Text style={styles.value}>{data.profession}</Text>
                        <Text style={[styles.label, { width: 70, marginRight: 20 }]}>التخصص:</Text>
                        <Text style={styles.value}>{data.specialization || '........'}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>المستوى التعليمي:</Text>
                        <Text style={styles.value}>{data.education_level || '........'}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>رغباتي (مجالات التطوع):</Text>
                        <Text style={styles.value}>{(data.interests || []).join('، ') || '........'}</Text>
                    </View>

                    <View style={{ marginTop: 20 }}>
                        <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>للاتصال بي:</Text>
                        <View style={styles.row}>
                            <Text style={styles.label}>رقم الهاتف:</Text>
                            <Text style={styles.value}>{data.phone}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>العنوان الشخصي:</Text>
                            <Text style={styles.value}>{data.address}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>البريد الإلكتروني:</Text>
                            <Text style={styles.value}>{data.email || '........'}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>فيسبوك/انستغرام:</Text>
                            <Text style={styles.value}>{data.social_media || '........'}</Text>
                        </View>
                    </View>
                </View>

                <Text style={{ marginTop: 30, textAlign: 'right' }}>تقبلوا خالص تشكراتي.</Text>

                <Text style={styles.note}>
                    ملاحظة: يلزم بدفع الاشتراك السنوي والمقدر بـ 1000 دج سنوياً.
                </Text>

                {/* Signature Section */}
                <View style={styles.footer}>
                    <View style={styles.signatureBlock}>
                        <Text>رئيس المكتب الولائي</Text>
                        <Text style={{ marginTop: 40 }}>(الختم والإمضاء)</Text>
                    </View>
                    <View style={styles.signatureBlock}>
                        <Text>إمضاء المتطوع</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
