import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/Login/LoginPage';
import {
    RequireAuth,
    WilayaInternalScope,
    RequireFinanceAccess,
    RequirePortalAdmin,
    RequireFinancialReportAccess,
    ExternalPortalRoute,
    ExternalPendingRoute,
    RequireBeneficiaryAuth,
    RequireSpace
} from './components/routing/RouteGuards';
import { LoadingSpinner } from './components/ui';

// Lazy loaded components
const DashboardPage = React.lazy(() => import('./pages/Dashboard/DashboardPage'));
const BeneficiariesPage = React.lazy(() => import('./pages/Beneficiaries/BeneficiariesPage'));
const BenefitFormPage = React.lazy(() => import('./pages/Beneficiaries/BenefitForm'));
const ReceiptsPage = React.lazy(() => import('./pages/Receipts/ReceiptsPage'));
const FinancePage = React.lazy(() => import('./pages/Finance/FinancePage'));
const DocumentsPage = React.lazy(() => import('./pages/Documents/DocumentsPage'));
const MembersPage = React.lazy(() => import('./pages/Members/MembersPage'));
const DonorsPage = React.lazy(() => import('./pages/Donors/DonorsPage'));
const ActivitiesIndexPage = React.lazy(() => import('./pages/Activities/index'));
const ActivitiesCalendarPage = React.lazy(() => import('./pages/Activities/ActivitiesCalendar'));
const ActivityDetailPage = React.lazy(() => import('./pages/Activities/ActivityDetail'));
const ActivityFormPage = React.lazy(() => import('./pages/Activities/ActivityForm'));
const ArchivePage = React.lazy(() => import('./pages/Archive/index'));
const AdministrationPage = React.lazy(() => import('./pages/Administration/AdministrationPage'));
const BylawManagementPage = React.lazy(() => import('./pages/Administration/BylawManagement'));
const RequestsPage = React.lazy(() => import('./pages/Requests/RequestsPage'));
const ReportsPage = React.lazy(() => import('./pages/Reports'));
const LiteraryReport = React.lazy(() => import('./pages/Reports/LiteraryReport'));
const FinancialReport = React.lazy(() => import('./pages/Reports/FinancialReport'));
const PlanningPage = React.lazy(() => import('./pages/Planning/PlanningPage'));
const AuditLogsPage = React.lazy(() => import('./pages/Administration/AuditLogsPage'));
const BranchesPage = React.lazy(() => import('./pages/Branches/BranchesPage'));
const LandingPage = React.lazy(() => import('./pages/Landing'));
const PublicBylawPage = React.lazy(() => import('./pages/Landing/BylawPage'));
const PublicRequestPage = React.lazy(() => import('./pages/Landing/PublicRequestPage'));
const VolunteerPage = React.lazy(() => import('./pages/Landing/VolunteerPage'));
const PlaceholderPage = React.lazy(() => import('./pages/Placeholders/PlaceholderPage'));
const PortalSelectPage = React.lazy(() => import('./pages/Portal/PortalSelectPage'));
const PortalLoginPage = React.lazy(() => import('./pages/Portal/PortalLoginPage'));
const RegisterExternalPage = React.lazy(() => import('./pages/Portal/RegisterExternalPage'));
const AwaitingApprovalPage = React.lazy(() => import('./pages/Portal/AwaitingApprovalPage'));
const PendingPage = React.lazy(() => import('./pages/Portal/PendingPage'));
const RejectedPage = React.lazy(() => import('./pages/Portal/RejectedPage'));
const PortalLayout = React.lazy(() => import('./pages/Portal/PortalLayout'));
const PortalSubPage = React.lazy(() => import('./pages/Portal/PortalSubPage'));
const BeneficiaryLoginPage = React.lazy(() => import('./pages/BeneficiaryPortal/BeneficiaryLoginPage'));
const BeneficiaryLayout = React.lazy(() => import('./components/layout/BeneficiaryLayout'));
const BeneficiaryDashboardNew = React.lazy(() => import('./pages/BeneficiaryPortal/BeneficiaryDashboard'));
const MyBenefits = React.lazy(() => import('./pages/BeneficiaryPortal/MyBenefits'));
const MyProfile = React.lazy(() => import('./pages/BeneficiaryPortal/MyProfile'));
const MyRequests = React.lazy(() => import('./pages/BeneficiaryPortal/MyRequests'));
const Notifications = React.lazy(() => import('./pages/BeneficiaryPortal/Notifications'));
const DonorDashboard = React.lazy(() => import('./pages/Portal/DonorDashboard'));
const HonorWallPage = React.lazy(() => import('./pages/HonorWallPage'));
const PublicArchivePage = React.lazy(() => import('./pages/Archive/PublicArchivePage'));
const RegulationsPage = React.lazy(() => import('./pages/Rules/RegulationsPage'));
const RegistrationRequests = React.lazy(() => import('./pages/Admin/Portal/RegistrationRequests'));
const PortalRequestsPage = React.lazy(() => import('./pages/Admin/Portal/PortalRequestsPage'));

const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
    <React.Suspense fallback={<div className="h-full w-full flex items-center justify-center p-12"><LoadingSpinner size="lg" /></div>}>
        {children}
    </React.Suspense>
);

function LoginGate() {
    const { user } = useAuth();
    if (!user) return <LoginPage />;
    return <Navigate to={user.space === 'branch' ? '/branch/dashboard' : '/dashboard'} replace />;
}

function WilayaShell() {
    return (
        <RequireAuth>
            <WilayaInternalScope>
                <MainLayout branchMode={false} />
            </WilayaInternalScope>
        </RequireAuth>
    );
}

function BranchShell() {
    return (
        <RequireAuth>
            <RequireSpace space="branch">
                <MainLayout branchMode />
            </RequireSpace>
        </RequireAuth>
    );
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<LazyWrapper><LandingPage /></LazyWrapper>} />
            <Route path="/bylaw" element={<LazyWrapper><PublicBylawPage /></LazyWrapper>} />
            <Route path="/request" element={<LazyWrapper><PublicRequestPage /></LazyWrapper>} />
            <Route path="/volunteer" element={<LazyWrapper><VolunteerPage /></LazyWrapper>} />
            <Route path="/honor-wall" element={<LazyWrapper><HonorWallPage /></LazyWrapper>} />
            <Route path="/archive/public" element={<LazyWrapper><PublicArchivePage /></LazyWrapper>} />

            <Route path="/portal" element={<LazyWrapper><PortalSelectPage /></LazyWrapper>} />
            <Route path="/portal/login" element={<LazyWrapper><PortalLoginPage /></LazyWrapper>} />
            <Route path="/portal/:portalType/register" element={<LazyWrapper><RegisterExternalPage /></LazyWrapper>} />
            <Route path="/portal/awaiting-approval" element={<LazyWrapper><AwaitingApprovalPage /></LazyWrapper>} />
            <Route path="/portal/pending" element={<LazyWrapper><ExternalPendingRoute><PendingPage /></ExternalPendingRoute></LazyWrapper>} />
            <Route path="/portal/rejected" element={<LazyWrapper><RejectedPage /></LazyWrapper>} />

            <Route
                path="/portal/volunteer/dashboard"
                element={
                    <LazyWrapper>
                        <ExternalPortalRoute portalType="volunteer">
                            <PortalLayout>
                                <PortalSubPage title="لوحة المتطوع" />
                            </PortalLayout>
                        </ExternalPortalRoute>
                    </LazyWrapper>
                }
            />
            <Route
                path="/portal/volunteer/activities"
                element={
                    <LazyWrapper>
                        <ExternalPortalRoute portalType="volunteer">
                            <PortalLayout>
                                <PortalSubPage title="أنشطة التطوع" />
                            </PortalLayout>
                        </ExternalPortalRoute>
                    </LazyWrapper>
                }
            />
            <Route
                path="/portal/volunteer/certificate"
                element={
                    <LazyWrapper>
                        <ExternalPortalRoute portalType="volunteer">
                            <PortalLayout>
                                <PortalSubPage title="الشهادة" />
                            </PortalLayout>
                        </ExternalPortalRoute>
                    </LazyWrapper>
                }
            />
            <Route
                path="/portal/donor/dashboard"
                element={
                    <LazyWrapper>
                        <ExternalPortalRoute portalType="donor">
                            <PortalLayout>
                                <DonorDashboard />
                            </PortalLayout>
                        </ExternalPortalRoute>
                    </LazyWrapper>
                }
            />
            <Route
                path="/portal/donor/donations"
                element={
                    <LazyWrapper>
                        <ExternalPortalRoute portalType="donor">
                            <PortalLayout>
                                <PortalSubPage title="تبرعاتي" />
                            </PortalLayout>
                        </ExternalPortalRoute>
                    </LazyWrapper>
                }
            />
            <Route
                path="/portal/donor/impact"
                element={
                    <LazyWrapper>
                        <ExternalPortalRoute portalType="donor">
                            <PortalLayout>
                                <PortalSubPage title="الأثر" />
                            </PortalLayout>
                        </ExternalPortalRoute>
                    </LazyWrapper>
                }
            />
            <Route path="/beneficiary/login" element={<LazyWrapper><BeneficiaryLoginPage /></LazyWrapper>} />
            <Route
                path="/beneficiary"
                element={
                    <LazyWrapper>
                        <RequireBeneficiaryAuth>
                            <BeneficiaryLayout />
                        </RequireBeneficiaryAuth>
                    </LazyWrapper>
                }
            >
                <Route index element={<Navigate to="/beneficiary/dashboard" replace />} />
                <Route path="dashboard" element={<BeneficiaryDashboardNew />} />
                <Route path="benefits" element={<MyBenefits />} />
                <Route path="requests" element={<MyRequests />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profile" element={<MyProfile />} />
            </Route>

            <Route path="/login" element={<LoginGate />} />

            <Route element={<WilayaShell />}>
                <Route path="/dashboard" element={<LazyWrapper><DashboardPage /></LazyWrapper>} />
                <Route path="/families" element={<Navigate to="/beneficiaries" replace />} />
                <Route path="/families/new" element={<Navigate to="/beneficiaries" replace />} />
                <Route path="/families/:id" element={<Navigate to="/beneficiaries" replace />} />
                <Route path="/beneficiaries" element={<LazyWrapper><BeneficiariesPage /></LazyWrapper>} />
                <Route path="/beneficiaries/:id/receipt/new" element={<LazyWrapper><BenefitFormPage /></LazyWrapper>} />
                <Route path="/receipts" element={<LazyWrapper><ReceiptsPage /></LazyWrapper>} />
                <Route path="/finance" element={<LazyWrapper><RequireFinanceAccess><FinancePage /></RequireFinanceAccess></LazyWrapper>} />
                <Route path="/finance/transactions" element={<LazyWrapper><RequireFinanceAccess><FinancePage /></RequireFinanceAccess></LazyWrapper>} />
                <Route path="/finance/reports" element={<LazyWrapper><RequireFinanceAccess><ReportsPage /></RequireFinanceAccess></LazyWrapper>} />
                <Route path="/documents" element={<LazyWrapper><DocumentsPage /></LazyWrapper>} />
                <Route path="/members" element={<LazyWrapper><MembersPage /></LazyWrapper>} />
                <Route path="/donors" element={<LazyWrapper><DonorsPage /></LazyWrapper>} />
                <Route path="/activities" element={<LazyWrapper><ActivitiesIndexPage /></LazyWrapper>} />
                <Route path="/activities/calendar" element={<LazyWrapper><ActivitiesCalendarPage /></LazyWrapper>} />
                <Route path="/activities/new" element={<LazyWrapper><ActivityFormPage /></LazyWrapper>} />
                <Route path="/activities/:id/edit" element={<LazyWrapper><ActivityFormPage /></LazyWrapper>} />
                <Route path="/activities/:id" element={<LazyWrapper><ActivityDetailPage /></LazyWrapper>} />
                <Route path="/archive" element={<LazyWrapper><ArchivePage /></LazyWrapper>} />
                <Route path="/administration" element={<LazyWrapper><AdministrationPage /></LazyWrapper>} />
                <Route path="/administration/logs" element={<LazyWrapper><AuditLogsPage /></LazyWrapper>} />
                <Route path="/administration/mail" element={<LazyWrapper><PlaceholderPage title="سجل البريد" /></LazyWrapper>} />
                <Route path="/administration/meetings" element={<LazyWrapper><PlaceholderPage title="محاضر الاجتماعات" /></LazyWrapper>} />
                <Route path="/administration/inventory" element={<LazyWrapper><PlaceholderPage title="المخزون والحركات" /></LazyWrapper>} />
                <Route path="/administration/bylaws" element={<LazyWrapper><BylawManagementPage /></LazyWrapper>} />
                <Route path="/regulations" element={<LazyWrapper><RegulationsPage /></LazyWrapper>} />
                <Route path="/requests" element={<LazyWrapper><RequestsPage /></LazyWrapper>} />
                <Route path="/reports" element={<LazyWrapper><ReportsPage /></LazyWrapper>} />
                <Route path="/reports/literary/new" element={<LazyWrapper><LiteraryReport /></LazyWrapper>} />
                <Route
                    path="/reports/financial/new"
                    element={
                        <LazyWrapper>
                            <RequireFinancialReportAccess>
                                <FinancialReport />
                            </RequireFinancialReportAccess>
                        </LazyWrapper>
                    }
                />
                <Route path="/planning" element={<LazyWrapper><PlanningPage /></LazyWrapper>} />
                <Route path="/branches" element={<LazyWrapper><BranchesPage /></LazyWrapper>} />
                <Route
                    path="/admin/portal/pending"
                    element={
                        <LazyWrapper>
                            <RequirePortalAdmin>
                                <RegistrationRequests />
                            </RequirePortalAdmin>
                        </LazyWrapper>
                    }
                />
                <Route
                    path="/admin/portal/volunteers"
                    element={
                        <LazyWrapper>
                            <RequirePortalAdmin>
                                <PlaceholderPage title="إدارة المتطوعين" />
                            </RequirePortalAdmin>
                        </LazyWrapper>
                    }
                />
                <Route
                    path="/admin/portal/donors"
                    element={
                        <LazyWrapper>
                            <RequirePortalAdmin>
                                <PlaceholderPage title="إدارة المحسنين (البوابة)" />
                            </RequirePortalAdmin>
                        </LazyWrapper>
                    }
                />
                <Route
                    path="/admin/portal/requests"
                    element={
                        <LazyWrapper>
                            <RequirePortalAdmin>
                                <PortalRequestsPage />
                            </RequirePortalAdmin>
                        </LazyWrapper>
                    }
                />
            </Route>

            <Route element={<BranchShell />}>
                <Route path="/branch/dashboard" element={<LazyWrapper><DashboardPage /></LazyWrapper>} />
                <Route path="/branch/families" element={<LazyWrapper><BeneficiariesPage /></LazyWrapper>} />
                <Route path="/branch/families/:id/receipt/new" element={<LazyWrapper><BenefitFormPage /></LazyWrapper>} />
                <Route path="/branch/receipts" element={<LazyWrapper><ReceiptsPage /></LazyWrapper>} />
                <Route path="/branch/finance" element={<LazyWrapper><RequireFinanceAccess><FinancePage /></RequireFinanceAccess></LazyWrapper>} />
                <Route path="/branch/members" element={<LazyWrapper><MembersPage /></LazyWrapper>} />
                <Route path="/branch/mail" element={<LazyWrapper><PlaceholderPage title="بريد الفرع" /></LazyWrapper>} />
                <Route path="/branch/meetings" element={<LazyWrapper><PlaceholderPage title="اجتماعات الفرع" /></LazyWrapper>} />
                <Route path="/branch/inventory" element={<LazyWrapper><PlaceholderPage title="مخزون الفرع" /></LazyWrapper>} />
                <Route path="/branch/documents" element={<LazyWrapper><DocumentsPage /></LazyWrapper>} />
                <Route path="/branch/activities" element={<LazyWrapper><ActivitiesIndexPage /></LazyWrapper>} />
                <Route path="/branch/activities/calendar" element={<LazyWrapper><ActivitiesCalendarPage /></LazyWrapper>} />
                <Route path="/branch/activities/new" element={<LazyWrapper><ActivityFormPage /></LazyWrapper>} />
                <Route path="/branch/activities/:id/edit" element={<LazyWrapper><ActivityFormPage /></LazyWrapper>} />
                <Route path="/branch/activities/:id" element={<LazyWrapper><ActivityDetailPage /></LazyWrapper>} />
                <Route path="/branch/archive" element={<LazyWrapper><ArchivePage /></LazyWrapper>} />
                <Route path="/branch/administration" element={<LazyWrapper><AdministrationPage /></LazyWrapper>} />
                <Route path="/branch/administration/logs" element={<LazyWrapper><AuditLogsPage /></LazyWrapper>} />
                <Route path="/branch/administration/bylaws" element={<LazyWrapper><BylawManagementPage /></LazyWrapper>} />
                <Route path="/branch/regulations" element={<LazyWrapper><RegulationsPage /></LazyWrapper>} />
                <Route path="/branch/requests" element={<LazyWrapper><RequestsPage /></LazyWrapper>} />
                <Route path="/branch/planning" element={<LazyWrapper><PlanningPage /></LazyWrapper>} />
                <Route path="/branch/reports" element={<LazyWrapper><ReportsPage /></LazyWrapper>} />
                <Route path="/branch/donors" element={<LazyWrapper><DonorsPage /></LazyWrapper>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
                <AppRoutes />
                <Toaster position="top-center" reverseOrder={false} />
            </AuthProvider>
        </BrowserRouter>
    );
}
