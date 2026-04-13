// Types for the Ghaith Platform (aligned with Supabase user_profiles.role)
export type UserRole =
    | 'president'
    | 'vice_president'
    | 'treasurer'
    | 'board_member'
    | 'branch_president'
    | 'secretary'
    | 'manager'
    | 'member';

export type UserSpace = 'executive' | 'branch' | 'member';


export type PortalType = 'volunteer' | 'donor' | 'beneficiary';
export type ExternalUserStatus = 'pending' | 'active' | 'suspended' | 'rejected';
export interface Municipality {
    id: string;
    name: string;
    daira: string;
    wilaya?: string;
    code?: string;
}

export interface User {
    id: string;
    email: string;
    full_name: string;
    fullName?: string;
    username?: string;
    role: UserRole;
    space: UserSpace;
    branch_id?: string;
    branchId?: string;
    phone?: string;
    status: 'active' | 'inactive';
    is_active?: boolean;
    isActive?: boolean;
    lastLogin?: string;
}


/** Map DB / legacy role strings to UserRole */
export function normalizeUserRole(role: string): UserRole {
    if (role === 'executive_board_member') return 'board_member';
    if (role === 'branch_supervisor') return 'branch_president';
    return role as UserRole;
}

export type BeneficiaryCategory = 'widow' | 'disabled' | 'chronic_illness' | 'orphan' | 'poor_family' | 'other' | 'divorced';
export type IncomeLevel = 'none' | 'very_low' | 'low' | 'medium';
export type HousingStatus = 'owned' | 'rented' | 'family' | 'other';
export type FamilyStatus = 'active' | 'inactive' | 'suspended';

export interface Family {
    id: string;
    registrationNumber: string;
    familyName: string;
    nationalId?: string;
    phone: string;
    secondaryPhone?: string;
    address: string;
    municipalityId: string;
    municipalityName: string;
    category: BeneficiaryCategory;
    membersCount: number;
    incomeLevel: IncomeLevel;
    monthlyIncome?: number;
    housingStatus: HousingStatus;
    hasSocialCoverage: boolean;
    notes?: string;
    registrationDate: string;
    registeredBy: string;
    branchId?: string;
    branchName?: string;
    status: FamilyStatus;
    is_deleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export type BenefitType = 'ramadan_basket' | 'eid_gift' | 'school_supplies' | 'medical' | 'financial_aid' | 'food_basket' | 'clothing' | 'other';

export interface FamilyBenefit {
    id: string;
    familyId: string;
    benefitType: BenefitType;
    amount?: number;
    quantity?: number;
    description?: string;
    benefitDate: string;
    occasionId?: string;
    approvedBy: string;
    notes?: string;
    createdAt: string;
}

export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'check' | 'other';

export interface Transaction {
    id: string;
    transactionType: TransactionType;
    category: string;
    amount: number;
    currency: string;
    description: string;
    transactionDate: string;
    referenceNumber?: string;
    donorId?: string;
    donorName?: string;
    familyId?: string;
    familyName?: string;
    occasionId?: string;
    paymentMethod: PaymentMethod;
    bankReference?: string;
    attachmentUrl?: string;
    approvedBy?: string;
    branchId?: string;
    branchName?: string;
    notes?: string;
    createdBy: string;
    createdAt: string;
}

export type MembershipType = 'founder' | 'active' | 'supporter' | 'honorary';
export type MemberStatus = 'active' | 'inactive' | 'suspended' | 'resigned';

export interface Member {
    id: string;
    fullName: string;
    nationalId?: string;
    phone: string;
    email?: string;
    address?: string;
    municipalityId?: string;
    municipalityName?: string;
    birthDate?: string;
    gender: 'male' | 'female';
    educationLevel?: string;
    occupation?: string;
    membershipNumber: string;
    membershipDate: string;
    membershipType: MembershipType;
    status: MemberStatus;
    roleInAssociation?: string;
    branchId?: string;
    branchName?: string;
    annualFeePaid: boolean;
    lastFeePaymentDate?: string;
    skills?: string;
    notes?: string;
    photoUrl?: string;
    createdAt: string;
}

export type DonorType = 'individual' | 'company' | 'institution' | 'anonymous';

export interface Donor {
    id: string;
    donorType: DonorType;
    fullName: string;
    phone?: string;
    email?: string;
    address?: string;
    municipalityName?: string;
    companyName?: string;
    donationPreference?: string;
    communicationPreference: 'call' | 'sms' | 'email' | 'none';
    isAnonymous: boolean;
    notes?: string;
    totalDonated: number;
    lastDonationDate?: string;
    createdAt: string;
}

export type OccasionType = 'national' | 'religious' | 'humanitarian' | 'educational' | 'social' | 'other';
export type OccasionStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export interface Occasion {
    id: string;
    title: string;
    occasionType: OccasionType;
    subType?: string;
    description?: string;
    startDate: string;
    endDate?: string;
    location?: string;
    targetBeneficiariesCount?: number;
    actualBeneficiariesCount?: number;
    budgetPlanned?: number;
    budgetActual?: number;
    status: OccasionStatus;
    responsibleMemberName?: string;
    responsibleMemberId?: string;
    branchId?: string;
    branchName?: string;
    report?: string;
    notes?: string;
    partners?: string;
    postReport?: string;
    photosUrls?: string[];
    documentUrls?: string[];
    isRecurring?: boolean;
    recurrencePattern?: 'annual' | 'monthly' | 'custom';
    municipalityName?: string;
    isDeleted?: boolean;
    createdBy: string;
    createdAt: string;
}

export type MailDirection = 'incoming' | 'outgoing';

export interface Mail {
    id: string;
    mailDirection: MailDirection;
    subject: string;
    senderOrRecipient: string;
    mailNumber: string;
    mailDate: string;
    receivedOrSentDate?: string;
    category?: string;
    summary?: string;
    actionRequired?: string;
    actionDeadline?: string;
    actionStatus: 'pending' | 'in_progress' | 'completed' | 'no_action';
    assignedTo?: string;
    attachmentUrl?: string;
    notes?: string;
    createdBy: string;
    createdAt: string;
}

export interface Meeting {
    id: string;
    title: string;
    meetingType: 'board' | 'general' | 'emergency' | 'committee' | 'other';
    meetingDate: string;
    location?: string;
    agenda: string[];
    attendees: string[];
    decisions: string[];
    nextMeetingDate?: string;
    minutesUrl?: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'postponed';
    createdBy: string;
    createdAt: string;
}

export interface InventoryItem {
    id: string;
    itemName: string;
    itemType: 'food' | 'clothing' | 'medical' | 'equipment' | 'stationery' | 'furniture' | 'other';
    unit: string;
    initialQuantity: number;
    currentQuantity: number;
    minimumThreshold: number;
    location?: string;
    source?: string;
    notes?: string;
    branchId?: string;
    createdAt: string;
}

export interface InventoryMovement {
    id: string;
    inventoryItemId: string;
    itemName: string;
    movementType: 'in' | 'out';
    quantity: number;
    reason: string;
    relatedTo: 'family' | 'activity' | 'occasion' | 'donation' | 'other';
    relatedName?: string;
    movementDate: string;
    recordedBy: string;
    notes?: string;
    createdAt: string;
}

export interface AidRequest {
    id: string;
    requestType: 'financial_aid' | 'food_aid' | 'medical_aid' | 'educational_aid' | 'space_request' | 'other';
    requesterType: 'family' | 'individual' | 'external_org' | 'branch';
    requesterName: string;
    requesterPhone?: string;
    requestDate: string;
    description: string;
    urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
    requestedSpace?: string;
    eventPurpose?: string;
    eventDate?: string;
    expectedAttendees?: number;
    status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'fulfilled';
    assignedTo?: string;
    reviewerNotes?: string;
    decisionDate?: string;
    branchId?: string;
    municipalityName?: string;
    createdAt: string;
}

export interface Document {
    id: string;
    title: string;
    documentType: string;
    category?: string;
    fileUrl: string;
    fileType: string;
    fileSize?: number;
    uploadDate: string;
    referenceNumber?: string;
    relatedTo?: string;
    tags?: string[];
    description?: string;
    isConfidential: boolean;
    branchId?: string;
    uploadedBy: string;
    uploaderName: string;
    approvedBy?: string;
    status: 'draft' | 'pending_approval' | 'approved' | 'archived';
    createdAt: string;
}

export interface Branch {
    id: string;
    branchName: string;
    municipality: string;
    address?: string;
    phone?: string;
    supervisorName?: string;
    isActive: boolean;
    establishmentDate?: string;
    familiesCount: number;
    createdAt: string;
}

export interface DashboardStats {
    totalFamilies: number;
    beneficiariesThisMonth: number;
    currentBalance: number;
    pendingRequests: number;
    activeMembers: number;
    activitiesThisMonth: number;
    totalIncome: number;
    totalExpense: number;
}

export interface AuditLog {
    id: string;
    userId: string;
    userName: string;
    action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'export';
    resourceType: string;
    resourceId?: string;
    description: string;
    ipAddress?: string;
    createdAt: string;
}

export interface SavedReport {
    id: string;
    report_type: 'literary' | 'financial';
    report_year: number;
    title: string;
    data: any;
    pdf_url?: string;
    docx_url?: string;
    status: 'draft' | 'final' | 'submitted';
    created_by: string;
    approved_by?: string;
    created_at: string;
    updated_at: string;
}

export interface ReportReminder {
    id: string;
    report_type: 'literary' | 'financial';
    reminder_date: string;
    period?: 'monthly' | 'quarterly' | 'annual';
    target_roles: UserRole[];
    message?: string;
    is_sent: boolean;
    is_acknowledged: boolean;
    year: number;
    created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  space: UserSpace;
  branch_id: string | null;
  is_active: boolean;
  last_login: string | null;
}


export interface ExternalUser {
  id: string;
  auth_id: string;
  portal_type: PortalType;
  full_name: string;
  phone: string;
  email: string;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
}

export interface BenefitReceipt {
  id: string;
  receipt_number: string;
  receipt_date: string;
  fiscal_year: number;
  beneficiary_full_name: string;
  benefit_type: string;
  benefit_description: string;
  benefit_value: number;
  benefit_value_in_words: string;
  status: 'draft' | 'printed' | 'signed' | 'delivered' | 'cancelled';
}

export interface ExternalSession {
    authId: string;
    externalUserId: string;
    portalType: PortalType;
    status: ExternalUserStatus;
    fullName: string;
}
