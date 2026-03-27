import { normalizeUserRole } from '../types';
import type {
    User, Family, Transaction, Member, Donor,
    Occasion, Mail, Meeting, InventoryItem, InventoryMovement,
    AidRequest, Document, Branch, DashboardStats, AuditLog, FamilyBenefit
} from '../types';

export const MOCK_USERS: User[] = [
    { id: 'u1', fullName: 'أحمد أشرف براهيمي', username: 'president', email: 'president@ghayth.dz', phone: '0550000001', role: 'president', isActive: true, lastLogin: '2026-03-21T10:00:00Z' },
    { id: 'u2', fullName: 'هشام عارف زحزام', username: 'vice', email: 'vice@ghayth.dz', phone: '0550000002', role: 'vice_president', isActive: true },
    { id: 'u3', fullName: 'عبد النور ساسي', username: 'treasurer', email: 'treasurer@ghayth.dz', phone: '0550000003', role: 'treasurer', isActive: true },
    { id: 'u4', fullName: 'عبد الرحمن رقيق', username: 'board', email: 'board@ghayth.dz', phone: '0550000004', role: 'board_member', isActive: true },
    { id: 'u5', fullName: 'سعيدة بلخير', username: 'branch1', email: 'branch1@ghayth.dz', phone: '0550000005', role: 'branch_president', branchId: 'b1', isActive: true },
    { id: 'u6', fullName: 'يوسف بوزيد', username: 'member', email: 'member@ghayth.dz', phone: '0550000006', role: 'member', isActive: true },
];

export const MOCK_BRANCHES: Branch[] = [
    { id: 'b1', branchName: 'المكتب الولائي', municipality: 'المسيلة', address: 'حي 500 مسكن', phone: '0555001122', supervisorName: 'محمد أمين الدراجي', isActive: true, establishmentDate: '2015-01-01', familiesCount: 450, createdAt: '2015-01-01T00:00:00Z' },
    { id: 'b2', branchName: 'فرع بوسعادة', municipality: 'بوسعادة', address: 'وسط المدينة', phone: '0555001133', supervisorName: 'ياسين بلقاسم', isActive: true, establishmentDate: '2018-05-15', familiesCount: 120, createdAt: '2018-05-15T00:00:00Z' },
    { id: 'b3', branchName: 'فرع مقرة', municipality: 'مقرة', supervisorName: 'عبد الحميد دحمان', isActive: true, establishmentDate: '2019-11-20', familiesCount: 85, createdAt: '2019-11-20T00:00:00Z' },
    { id: 'b4', branchName: 'فرع حمام الضلعة', municipality: 'حمام الضلعة', supervisorName: 'رياض مكي', isActive: true, establishmentDate: '2021-03-10', familiesCount: 40, createdAt: '2021-03-10T00:00:00Z' },
    { id: 'b5', branchName: 'فرع بن سرور', municipality: 'بن سرور', supervisorName: 'جمال تواتي', isActive: false, establishmentDate: '2022-08-05', familiesCount: 0, createdAt: '2022-08-05T00:00:00Z' },
];

export const MOCK_FAMILIES: Family[] = [
    { id: 'f1', registrationNumber: 'MSL-2024-0001', familyName: 'زوجة المرحوم عمر بوزيد', nationalId: '29601501228', phone: '0551234567', address: 'حي السلام، المسيلة', municipalityId: 'm1', municipalityName: 'المسيلة', category: 'widow', membersCount: 4, incomeLevel: 'none', monthlyIncome: 0, housingStatus: 'rented', hasSocialCoverage: false, registrationDate: '2024-01-15', registeredBy: 'u1', branchId: 'b1', branchName: 'فرع المسيلة الوسط', status: 'active', is_deleted: false, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z' },
    { id: 'f2', registrationNumber: 'MSL-2024-0002', familyName: 'عائلة بن صالح إبراهيم', nationalId: '19701501011', phone: '0662345678', address: 'شارع الاستقلال، بوسعادة', municipalityId: 'm2', municipalityName: 'بوسعادة', category: 'disabled', membersCount: 6, incomeLevel: 'very_low', monthlyIncome: 8000, housingStatus: 'owned', hasSocialCoverage: true, registrationDate: '2024-02-10', registeredBy: 'u2', branchId: 'b2', branchName: 'فرع بوسعادة', status: 'active', is_deleted: false, createdAt: '2024-02-10T09:00:00Z', updatedAt: '2024-02-10T09:00:00Z' },
    { id: 'f3', registrationNumber: 'MSL-2024-0003', familyName: 'أيتام مريم قاسم', nationalId: '', phone: '0773456789', address: 'دوار أولاد سي عيسى', municipalityId: 'm3', municipalityName: 'سيدي عيسى', category: 'orphan', membersCount: 3, incomeLevel: 'none', monthlyIncome: 0, housingStatus: 'family', hasSocialCoverage: false, registrationDate: '2024-03-05', registeredBy: 'u3', branchId: 'b3', branchName: 'فرع سيدي عيسى', status: 'active', is_deleted: false, createdAt: '2024-03-05T08:00:00Z', updatedAt: '2024-03-05T08:00:00Z' },
    { id: 'f4', registrationNumber: 'MSL-2024-0004', familyName: 'عائلة بوعلام رشيد', nationalId: '19801501033', phone: '0554567890', address: 'حي النور، الحمامة', municipalityId: 'm4', municipalityName: 'الحمامة', category: 'chronic_illness', membersCount: 5, incomeLevel: 'low', monthlyIncome: 15000, housingStatus: 'rented', hasSocialCoverage: true, registrationDate: '2024-04-20', registeredBy: 'u4', branchId: 'b4', branchName: 'فرع الحمامة', status: 'active', is_deleted: false, createdAt: '2024-04-20T11:00:00Z', updatedAt: '2024-04-20T11:00:00Z' },
    { id: 'f5', registrationNumber: 'MSL-2024-0005', familyName: 'عائلة زيد الخير بلحاج', nationalId: '19901501045', phone: '0665678901', address: 'شارع 1 نوفمبر، المسيلة', municipalityId: 'm1', municipalityName: 'المسيلة', category: 'poor_family', membersCount: 8, incomeLevel: 'very_low', monthlyIncome: 5000, housingStatus: 'rented', hasSocialCoverage: false, registrationDate: '2024-05-12', registeredBy: 'u1', branchId: 'b1', branchName: 'فرع المسيلة الوسط', status: 'active', is_deleted: false, createdAt: '2024-05-12T09:30:00Z', updatedAt: '2024-05-12T09:30:00Z' },
    { id: 'f6', registrationNumber: 'MSL-2023-0089', familyName: 'زوجة المرحوم قدور بلخير', nationalId: '19651501056', phone: '0556789012', address: 'حي الشهداء، بوسعادة', municipalityId: 'm2', municipalityName: 'بوسعادة', category: 'widow', membersCount: 2, incomeLevel: 'very_low', monthlyIncome: 9000, housingStatus: 'owned', hasSocialCoverage: true, registrationDate: '2023-11-01', registeredBy: 'u2', branchId: 'b2', branchName: 'فرع بوسعادة', status: 'active', is_deleted: false, createdAt: '2023-11-01T10:00:00Z', updatedAt: '2023-11-01T10:00:00Z' },
    { id: 'f7', registrationNumber: 'MSL-2025-0010', familyName: 'عائلة سليمان حمداوي', nationalId: '19851501067', phone: '0667890123', address: 'دوار الخضر، سيدي عيسى', municipalityId: 'm3', municipalityName: 'سيدي عيسى', category: 'poor_family', membersCount: 7, incomeLevel: 'none', monthlyIncome: 0, housingStatus: 'family', hasSocialCoverage: false, registrationDate: '2025-01-18', registeredBy: 'u5', branchId: 'b3', branchName: 'فرع سيدي عيسى', status: 'active', is_deleted: false, createdAt: '2025-01-18T08:00:00Z', updatedAt: '2025-01-18T08:00:00Z' },
    { id: 'f8', registrationNumber: 'MSL-2025-0011', familyName: 'أيتام فريد عمراوي', nationalId: '', phone: '0558901234', address: 'حي 8 ماي، المسيلة', municipalityId: 'm1', municipalityName: 'المسيلة', category: 'orphan', membersCount: 4, incomeLevel: 'very_low', monthlyIncome: 6000, housingStatus: 'rented', hasSocialCoverage: false, registrationDate: '2025-02-03', registeredBy: 'u1', branchId: 'b1', branchName: 'فرع المسيلة الوسط', status: 'inactive', is_deleted: false, createdAt: '2025-02-03T11:00:00Z', updatedAt: '2025-02-03T11:00:00Z' },
];

export const MOCK_BENEFITS: FamilyBenefit[] = [
    { id: 'fb1', familyId: 'f1', benefitType: 'ramadan_basket', quantity: 1, description: 'قفة رمضان كاملة', benefitDate: '2025-03-01', occasionId: 'o1', approvedBy: 'u1', createdAt: '2025-03-01T09:00:00Z' },
    { id: 'fb2', familyId: 'f1', benefitType: 'financial_aid', amount: 15000, description: 'مساعدة مالية عاجلة', benefitDate: '2025-01-15', approvedBy: 'u1', createdAt: '2025-01-15T10:00:00Z' },
    { id: 'fb3', familyId: 'f2', benefitType: 'medical', amount: 8000, description: 'مساعدة في علاج الإعاقة', benefitDate: '2025-02-20', approvedBy: 'u2', createdAt: '2025-02-20T11:00:00Z' },
    { id: 'fb4', familyId: 'f3', benefitType: 'school_supplies', quantity: 3, description: 'أدوات مدرسية للموسم الجديد', benefitDate: '2024-09-01', occasionId: 'o2', approvedBy: 'u3', createdAt: '2024-09-01T08:00:00Z' },
    { id: 'fb5', familyId: 'f5', benefitType: 'food_basket', quantity: 2, description: 'سلة غذائية شهرية', benefitDate: '2025-03-10', occasionId: 'o1', approvedBy: 'u1', createdAt: '2025-03-10T09:30:00Z' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 't1', transactionType: 'income', category: 'donations', amount: 150000, currency: 'DZD', description: 'تبرع نقدي من السيد بشير لونيس', transactionDate: '2026-03-15', paymentMethod: 'cash', donorId: 'd1', donorName: 'بشير لونيس', createdBy: 'u3', createdAt: '2026-03-15T10:00:00Z' },
    { id: 't2', transactionType: 'income', category: 'member_fees', amount: 36000, currency: 'DZD', description: 'اشتراكات الأعضاء - ربع سنوي', transactionDate: '2026-03-01', paymentMethod: 'cash', createdBy: 'u3', createdAt: '2026-03-01T09:00:00Z' },
    { id: 't3', transactionType: 'expense', category: 'beneficiary_aid', amount: 45000, currency: 'DZD', description: 'توزيع مساعدات مالية - 3 عائلات', transactionDate: '2026-03-10', paymentMethod: 'cash', createdBy: 'u3', createdAt: '2026-03-10T11:00:00Z' },
    { id: 't4', transactionType: 'expense', category: 'activity_expense', amount: 28000, currency: 'DZD', description: 'تكاليف حملة توزيع قفف رمضان', transactionDate: '2026-03-20', paymentMethod: 'cash', createdBy: 'u3', createdAt: '2026-03-20T14:00:00Z' },
    { id: 't5', transactionType: 'income', category: 'grants', amount: 200000, currency: 'DZD', description: 'دعم حكومي من مديرية الشؤون الاجتماعية', transactionDate: '2026-02-15', paymentMethod: 'bank_transfer', bankReference: 'BNK-2026-0142', createdBy: 'u3', createdAt: '2026-02-15T09:00:00Z' },
    { id: 't6', transactionType: 'expense', category: 'admin_expense', amount: 12000, currency: 'DZD', description: 'مصاريف إدارية ومكتبية', transactionDate: '2026-03-05', paymentMethod: 'cash', createdBy: 'u3', createdAt: '2026-03-05T10:00:00Z' },
    { id: 't7', transactionType: 'income', category: 'donations', amount: 80000, currency: 'DZD', description: 'تبرع من شركة الهلال للبناء', transactionDate: '2026-03-18', paymentMethod: 'check', donorId: 'd2', donorName: 'شركة الهلال للبناء', createdBy: 'u3', createdAt: '2026-03-18T11:30:00Z' },
    { id: 't8', transactionType: 'expense', category: 'transport', amount: 8500, currency: 'DZD', description: 'نقل المساعدات للفروع', transactionDate: '2026-03-12', paymentMethod: 'cash', createdBy: 'u3', createdAt: '2026-03-12T15:00:00Z' },
];

export const MOCK_MEMBERS: Member[] = [
    { id: 'm1', fullName: 'أحمد بن عيسى', phone: '0550000001', email: 'president@ghayth.dz', gender: 'male', municipalityName: 'المسيلة', membershipNumber: 'MSL-M-0001', membershipDate: '2019-05-01', membershipType: 'founder', status: 'active', roleInAssociation: 'رئيس الجمعية', annualFeePaid: true, lastFeePaymentDate: '2026-01-10', createdAt: '2019-05-01T00:00:00Z' },
    { id: 'm2', fullName: 'فاطمة الزهراء بوعلام', phone: '0550000002', email: 'vice@ghayth.dz', gender: 'female', municipalityName: 'المسيلة', membershipNumber: 'MSL-M-0002', membershipDate: '2019-05-01', membershipType: 'founder', status: 'active', roleInAssociation: 'نائبة الرئيس', annualFeePaid: true, lastFeePaymentDate: '2026-01-10', createdAt: '2019-05-01T00:00:00Z' },
    { id: 'm3', fullName: 'محمد الصالح قاسمي', phone: '0550000003', gender: 'male', municipalityName: 'المسيلة', membershipNumber: 'MSL-M-0003', membershipDate: '2019-05-01', membershipType: 'founder', status: 'active', roleInAssociation: 'أمين المال', annualFeePaid: true, lastFeePaymentDate: '2026-01-10', createdAt: '2019-05-01T00:00:00Z' },
    { id: 'm4', fullName: 'عبد الرحمن زروقي', phone: '0550000004', gender: 'male', municipalityName: 'بوسعادة', membershipNumber: 'MSL-M-0004', membershipDate: '2020-03-15', membershipType: 'active', status: 'active', roleInAssociation: 'عضو مكتب', annualFeePaid: true, lastFeePaymentDate: '2026-01-15', createdAt: '2020-03-15T00:00:00Z' },
    { id: 'm5', fullName: 'سعيدة بلخير', phone: '0550000005', gender: 'female', municipalityName: 'المسيلة', membershipNumber: 'MSL-M-0005', membershipDate: '2020-03-15', membershipType: 'active', status: 'active', roleInAssociation: 'مشرفة فرع المسيلة', annualFeePaid: true, lastFeePaymentDate: '2026-02-01', createdAt: '2020-03-15T00:00:00Z' },
    { id: 'm6', fullName: 'كريم وناس', phone: '0661234560', gender: 'male', municipalityName: 'سيدي عيسى', membershipNumber: 'MSL-M-0006', membershipDate: '2021-08-10', membershipType: 'active', status: 'active', annualFeePaid: false, createdAt: '2021-08-10T00:00:00Z' },
    { id: 'm7', fullName: 'نورة حمدي', phone: '0772345671', gender: 'female', municipalityName: 'بوسعادة', membershipNumber: 'MSL-M-0007', membershipDate: '2022-01-20', membershipType: 'supporter', status: 'inactive', annualFeePaid: false, createdAt: '2022-01-20T00:00:00Z' },
    { id: 'm8', fullName: 'يوسف بلحاج', phone: '0553456782', gender: 'male', municipalityName: 'الحمامة', membershipNumber: 'MSL-M-0008', membershipDate: '2022-06-05', membershipType: 'active', status: 'active', annualFeePaid: true, lastFeePaymentDate: '2025-12-20', createdAt: '2022-06-05T00:00:00Z' },
];

export const MOCK_DONORS: Donor[] = [
    { id: 'd1', donorType: 'individual', fullName: 'بشير لونيس', phone: '0555111222', email: 'blouniss@email.com', municipalityName: 'المسيلة', communicationPreference: 'call', isAnonymous: false, totalDonated: 450000, lastDonationDate: '2026-03-15', createdAt: '2023-01-10T00:00:00Z' },
    { id: 'd2', donorType: 'company', fullName: 'شركة الهلال للبناء', companyName: 'شركة الهلال للبناء', phone: '0352111333', municipalityName: 'المسيلة', communicationPreference: 'email', isAnonymous: false, totalDonated: 320000, lastDonationDate: '2026-03-18', createdAt: '2023-03-15T00:00:00Z' },
    { id: 'd3', donorType: 'individual', fullName: 'محسن مجهول', communicationPreference: 'none', isAnonymous: true, totalDonated: 100000, lastDonationDate: '2025-12-10', createdAt: '2024-05-20T00:00:00Z' },
    { id: 'd4', donorType: 'institution', fullName: 'مديرية التضامن الاجتماعي', phone: '0352200100', municipalityName: 'المسيلة', communicationPreference: 'call', isAnonymous: false, totalDonated: 800000, lastDonationDate: '2026-02-15', createdAt: '2020-01-01T00:00:00Z' },
    { id: 'd5', donorType: 'individual', fullName: 'سامية قاسم', phone: '0668222444', municipalityName: 'بوسعادة', communicationPreference: 'sms', isAnonymous: false, totalDonated: 75000, lastDonationDate: '2025-11-20', createdAt: '2024-01-10T00:00:00Z' },
];

export const MOCK_OCCASIONS: Occasion[] = [
    { id: 'o1', title: 'توزيع قفف رمضان 1447هـ', occasionType: 'religious', subType: 'رمضان', description: 'توزيع قفف غذائية على العائلات المستفيدة خلال شهر رمضان المبارك', startDate: '2026-03-15', endDate: '2026-04-10', location: 'مقر الجمعية + الفروع', targetBeneficiariesCount: 200, actualBeneficiariesCount: 187, budgetPlanned: 500000, budgetActual: 475000, status: 'in_progress', responsibleMemberName: 'أحمد بن عيسى', createdBy: 'u1', createdAt: '2026-02-01T00:00:00Z' },
    { id: 'o2', title: 'دعم الدخول المدرسي 2025-2026', occasionType: 'educational', subType: 'دخول مدرسي', description: 'توفير اللوازم المدرسية لأبناء العائلات المستفيدة', startDate: '2025-09-01', endDate: '2025-09-15', location: 'مقر الجمعية', targetBeneficiariesCount: 150, actualBeneficiariesCount: 143, budgetPlanned: 200000, budgetActual: 195000, status: 'completed', responsibleMemberName: 'فاطمة الزهراء بوعلام', createdBy: 'u2', createdAt: '2025-07-15T00:00:00Z' },
    { id: 'o3', title: 'يوم تحسيسي بمناسبة يوم الإعاقة', occasionType: 'humanitarian', description: 'يوم تحسيسي وتوعوي بمناسبة اليوم العالمي للإعاقة', startDate: '2025-12-03', location: 'قاعة المحاضرات، المسيلة', targetBeneficiariesCount: 80, actualBeneficiariesCount: 92, budgetPlanned: 50000, budgetActual: 48000, status: 'completed', responsibleMemberName: 'عبد الرحمن زروقي', createdBy: 'u4', createdAt: '2025-11-01T00:00:00Z' },
    { id: 'o4', title: 'حملة التبرع بالدم - ربيع 2026', occasionType: 'humanitarian', description: 'حملة منظمة للتبرع بالدم بالتنسيق مع المستشفى الجوارى', startDate: '2026-04-15', location: 'المستشفى الجواري، المسيلة', targetBeneficiariesCount: 50, status: 'planned', responsibleMemberName: 'يوسف بلحاج', createdBy: 'u1', createdAt: '2026-03-10T00:00:00Z' },
];

export const MOCK_MAILS: Mail[] = [
    { id: 'mail1', mailDirection: 'incoming', subject: 'موافقة على تخصيص دعم مالي للجمعية', senderOrRecipient: 'والي ولاية المسيلة', mailNumber: 'IN-2026-0047', mailDate: '2026-03-18', actionStatus: 'completed', createdBy: 'u1', createdAt: '2026-03-18T09:00:00Z' },
    { id: 'mail2', mailDirection: 'outgoing', subject: 'تقرير النشاط السنوي 2025', senderOrRecipient: 'مديرية التضامن الاجتماعي', mailNumber: 'OUT-2026-0023', mailDate: '2026-03-10', actionStatus: 'completed', createdBy: 'u1', createdAt: '2026-03-10T10:00:00Z' },
    { id: 'mail3', mailDirection: 'incoming', subject: 'طلب إتاحة فضاء لتنظيم نشاط ثقافي', senderOrRecipient: 'جمعية الثقافة والفنون', mailNumber: 'IN-2026-0051', mailDate: '2026-03-20', actionStatus: 'pending', actionRequired: 'الرد خلال أسبوع', actionDeadline: '2026-03-27', createdBy: 'u4', createdAt: '2026-03-20T11:00:00Z' },
    { id: 'mail4', mailDirection: 'outgoing', subject: 'دعوة للمشاركة في حملة التبرع بالدم', senderOrRecipient: 'مدير المستشفى الجواري', mailNumber: 'OUT-2026-0025', mailDate: '2026-03-19', actionStatus: 'in_progress', createdBy: 'u2', createdAt: '2026-03-19T14:00:00Z' },
];

export const MOCK_MEETINGS: Meeting[] = [
    { id: 'mt1', title: 'اجتماع المكتب التنفيذي - مارس 2026', meetingType: 'board', meetingDate: '2026-03-15T14:00:00Z', location: 'مقر الجمعية، المسيلة', agenda: ['مراجعة ميزانية الربع الأول', 'تقييم نشاط رمضان', 'مناقشة خطة الصيف'], attendees: ['أحمد بن عيسى', 'فاطمة الزهراء بوعلام', 'محمد الصالح قاسمي', 'عبد الرحمن زروقي'], decisions: ['اعتماد ميزانية 500000 دج لرمضان', 'تشكيل لجنة متابعة نشاط الصيف'], status: 'completed', createdBy: 'u1', createdAt: '2026-03-10T09:00:00Z' },
    { id: 'mt2', title: 'الجمعية العامة العادية - 2026', meetingType: 'general', meetingDate: '2026-04-05T10:00:00Z', location: 'قاعة الاجتماعات الكبرى، المسيلة', agenda: ['مراجعة التقرير الأدبي 2025', 'مراجعة التقرير المالي 2025', 'انتخاب اللجان', 'مناقشة برنامج 2026'], attendees: [], decisions: [], status: 'scheduled', createdBy: 'u1', createdAt: '2026-03-01T09:00:00Z' },
];

export const MOCK_INVENTORY: InventoryItem[] = [
    { id: 'inv1', itemName: 'دقيق ممتاز', itemType: 'food', unit: 'كيس 25كغ', initialQuantity: 100, currentQuantity: 45, minimumThreshold: 20, location: 'المستودع الرئيسي', source: 'شراء مباشر', createdAt: '2026-01-01T00:00:00Z' },
    { id: 'inv2', itemName: 'زيت مائدة', itemType: 'food', unit: 'لتر 5', initialQuantity: 200, currentQuantity: 87, minimumThreshold: 30, location: 'المستودع الرئيسي', source: 'تبرع شركة الهلال', createdAt: '2026-01-01T00:00:00Z' },
    { id: 'inv3', itemName: 'سكر', itemType: 'food', unit: 'كيس 50كغ', initialQuantity: 50, currentQuantity: 18, minimumThreshold: 10, location: 'المستودع الرئيسي', source: 'شراء مباشر', createdAt: '2026-01-01T00:00:00Z' },
    { id: 'inv4', itemName: 'ملابس أطفال', itemType: 'clothing', unit: 'قطعة', initialQuantity: 300, currentQuantity: 12, minimumThreshold: 20, location: 'مستودع الملابس', source: 'حملة تبرعات', createdAt: '2026-01-01T00:00:00Z' },
    { id: 'inv5', itemName: 'أدوية أساسية', itemType: 'medical', unit: 'علبة', initialQuantity: 150, currentQuantity: 63, minimumThreshold: 25, location: 'خزانة الأدوية', source: 'مستشفى جواري', createdAt: '2026-01-01T00:00:00Z' },
    { id: 'inv6', itemName: 'مناضد مدرسية', itemType: 'equipment', unit: 'قطعة', initialQuantity: 50, currentQuantity: 50, minimumThreshold: 5, location: 'مخزن المعدات', source: 'هبة بلدية', createdAt: '2025-09-01T00:00:00Z' },
];

export const MOCK_INVENTORY_MOVEMENTS: InventoryMovement[] = [
    { id: 'im1', inventoryItemId: 'inv1', itemName: 'دقيق ممتاز', movementType: 'in', quantity: 100, reason: 'شراء مخزون لرمضان', relatedTo: 'occasion', relatedName: 'توزيع قفف رمضان 1447هـ', movementDate: '2026-03-01', recordedBy: 'محمد الصالح قاسمي', createdAt: '2026-03-01T09:00:00Z' },
    { id: 'im2', inventoryItemId: 'inv1', itemName: 'دقيق ممتاز', movementType: 'out', quantity: 55, reason: 'توزيع على العائلات', relatedTo: 'occasion', relatedName: 'توزيع قفف رمضان 1447هـ', movementDate: '2026-03-20', recordedBy: 'أحمد بن عيسى', createdAt: '2026-03-20T14:00:00Z' },
    { id: 'im3', inventoryItemId: 'inv4', itemName: 'ملابس أطفال', movementType: 'out', quantity: 288, reason: 'توزيع على أطفال العائلات المستفيدة', relatedTo: 'activity', movementDate: '2025-12-20', recordedBy: 'فاطمة الزهراء بوعلام', createdAt: '2025-12-20T10:00:00Z' },
];

export const MOCK_AID_REQUESTS: AidRequest[] = [
    { id: 'ar1', requestType: 'financial_aid', requesterType: 'family', requesterName: 'عائلة بن علي محمد', requesterPhone: '0559876543', requestDate: '2026-03-19', description: 'طلب مساعدة مالية عاجلة بسبب طارئ صحي', urgencyLevel: 'urgent', municipalityName: 'المسيلة', status: 'pending', createdAt: '2026-03-19T10:00:00Z' },
    { id: 'ar2', requestType: 'space_request', requesterType: 'external_org', requesterName: 'جمعية الأمل للمرأة', requesterPhone: '0354321098', requestDate: '2026-03-20', description: 'طلب إتاحة القاعة الكبرى لتنظيم يوم تحسيسي', urgencyLevel: 'medium', municipalityName: 'المسيلة', requestedSpace: 'القاعة الكبرى', eventPurpose: 'يوم تحسيسي بصحة المرأة', eventDate: '2026-04-08', expectedAttendees: 60, status: 'under_review', assignedTo: 'عبد الرحمن زروقي', createdAt: '2026-03-20T11:00:00Z' },
    { id: 'ar3', requestType: 'food_aid', requesterType: 'individual', requesterName: 'السيد رضا مسعود', requesterPhone: '0771234509', requestDate: '2026-03-15', description: 'أسرة من 5 أفراد بدون دخل، تحتاج مساعدة غذائية عاجلة', urgencyLevel: 'high', municipalityName: 'بوسعادة', status: 'approved', reviewerNotes: 'تمت الموافقة وتسجيل الأسرة في قاعدة البيانات', decisionDate: '2026-03-17', createdAt: '2026-03-15T09:00:00Z' },
    { id: 'ar4', requestType: 'educational_aid', requesterType: 'family', requesterName: 'أسرة الحاج سعد بلعيد', requestDate: '2026-03-10', description: 'دعم دراسي لـ 4 أطفال في الطور الابتدائي', urgencyLevel: 'low', municipalityName: 'سيدي عيسى', status: 'fulfilled', decisionDate: '2026-03-12', createdAt: '2026-03-10T10:00:00Z' },
];

export const MOCK_DOCUMENTS: Document[] = [
    { id: 'doc1', title: 'التقرير الأدبي السنوي 2025', documentType: 'literary_report', fileUrl: '#', fileType: 'pdf', uploadDate: '2026-02-01', uploadedBy: 'u1', uploaderName: 'أحمد بن عيسى', status: 'approved', isConfidential: false, createdAt: '2026-02-01T10:00:00Z' },
    { id: 'doc2', title: 'التقرير المالي السنوي 2025', documentType: 'financial_report', fileUrl: '#', fileType: 'pdf', uploadDate: '2026-02-10', uploadedBy: 'u3', uploaderName: 'محمد الصالح قاسمي', status: 'approved', isConfidential: true, createdAt: '2026-02-10T11:00:00Z' },
    { id: 'doc3', title: 'محضر اجتماع المكتب - مارس 2026', documentType: 'meeting_minutes', fileUrl: '#', fileType: 'pdf', uploadDate: '2026-03-16', uploadedBy: 'u2', uploaderName: 'فاطمة الزهراء بوعلام', status: 'approved', isConfidential: false, createdAt: '2026-03-16T09:30:00Z' },
    { id: 'doc4', title: 'تقرير نشاط رمضان 1446هـ', documentType: 'activity_report', fileUrl: '#', fileType: 'pdf', uploadDate: '2025-05-01', uploadedBy: 'u1', uploaderName: 'أحمد بن عيسى', status: 'archived', isConfidential: false, createdAt: '2025-05-01T10:00:00Z' },
    { id: 'doc5', title: 'طلب الدعم - رمضان 2026', documentType: 'aid_request', fileUrl: '#', fileType: 'pdf', uploadDate: '2026-03-01', uploadedBy: 'u1', uploaderName: 'أحمد بن عيسى', status: 'pending_approval', isConfidential: false, createdAt: '2026-03-01T09:00:00Z' },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
    { id: 'al1', userId: 'u1', userName: 'أحمد بن عيسى', action: 'login', resourceType: 'auth', description: 'تسجيل دخول للمنصة', createdAt: '2026-03-21T08:00:00Z' },
    { id: 'al2', userId: 'u2', userName: 'كريمة منصور', action: 'create', resourceType: 'family', resourceId: 'f1', description: 'إضافة عائلة جديدة (أرملة تيجاني)', createdAt: '2026-03-21T08:15:00Z' },
    { id: 'al3', userId: 'u3', userName: 'صالح بوزيد', action: 'update', resourceType: 'transaction', resourceId: 't1', description: 'الموافقة على صرف مساعدة طبية', createdAt: '2026-03-21T09:30:00Z' },
    { id: 'al4', userId: 'u1', userName: 'أحمد بن عيسى', action: 'login', resourceType: 'auth', description: 'تسجيل دخول للمنصة', createdAt: '2026-03-21T10:00:00Z' },
    { id: 'al5', userId: 'u4', userName: 'عبد الرحمن زروقي', action: 'create', resourceType: 'mail', resourceId: 'mail3', description: 'تسجيل بريد وارد جديد من جمعية الثقافة والفنون', createdAt: '2026-03-20T11:00:00Z' },
];

export const MOCK_DASHBOARD_STATS: DashboardStats = {
    totalFamilies: 247,
    beneficiariesThisMonth: 187,
    currentBalance: 892500,
    pendingRequests: 4,
    activeMembers: 32,
    activitiesThisMonth: 3,
    totalIncome: 466000,
    totalExpense: 93500,
};

export const CHART_BENEFICIARIES_12M = [
    { month: 'أبر', count: 145 }, { month: 'ماي', count: 132 }, { month: 'جوان', count: 98 },
    { month: 'جوي', count: 110 }, { month: 'أوت', count: 125 }, { month: 'سبت', count: 168 },
    { month: 'أكت', count: 142 }, { month: 'نوف', count: 155 }, { month: 'ديس', count: 178 },
    { month: 'جان', count: 162 }, { month: 'فيف', count: 143 }, { month: 'مار', count: 187 },
];

export const CHART_CATEGORIES = [
    { name: 'أرامل', value: 89, color: '#6366f1' },
    { name: 'ذوو إعاقة', value: 54, color: '#f59e0b' },
    { name: 'أمراض مزمنة', value: 38, color: '#ef4444' },
    { name: 'أيتام', value: 31, color: '#3b82f6' },
    { name: 'أسر معوزة', value: 27, color: '#22c55e' },
    { name: 'أخرى', value: 8, color: '#8b5cf6' },
];

export const CHART_FINANCE_6M = [
    { month: 'أكت', income: 280000, expense: 145000 },
    { month: 'نوف', income: 190000, expense: 210000 },
    { month: 'ديس', income: 350000, expense: 280000 },
    { month: 'جان', income: 220000, expense: 130000 },
    { month: 'فيف', income: 310000, expense: 180000 },
    { month: 'مار', income: 466000, expense: 93500 },
];

// Helper: current user stored in localStorage
export const getCurrentUser = (): User | null => {
    const stored = localStorage.getItem('ghaith_user');
    if (!stored) return null;
    try { return JSON.parse(stored) as User; } catch { return null; }
};

export const loginUser = (username: string, password: string): User | null => {
    const passwords: Record<string, string> = {
        president: 'president123', vice: 'vice123', treasurer: 'treasurer123',
        board: 'board123', branch1: 'branch123', member: 'member123',
    };
    if (passwords[username] === password) {
        const found = MOCK_USERS.find(u => u.username === username) || null;
        if (!found) return null;
        const user = { ...found, role: normalizeUserRole(found.role as string) };
        localStorage.setItem('ghaith_user', JSON.stringify(user));
        return user;
    }
    return null;
};

export const logoutUser = () => localStorage.removeItem('ghaith_user');
