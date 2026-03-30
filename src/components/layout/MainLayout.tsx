import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { LayoutBranchProvider } from '../../context/LayoutBranchContext';
import { useAuth } from '../../context/AuthContext';
import { bylawService } from '../../services/bylaw.service';
import BylawModal from '../auth/BylawModal';
import LoginSuccessToast from '../auth/LoginSuccessToast';

export default function MainLayout({ branchMode = false }: { branchMode?: boolean }) {
    const [collapsed, setCollapsed] = useState(false);
    const { user } = useAuth();
    
    const [needsAgreement, setNeedsAgreement] = useState(false);
    const [showLoginToast, setShowLoginToast] = useState(false);

    useEffect(() => {
        if (sessionStorage.getItem('justLoggedIn') === 'true') {
            setShowLoginToast(true);
            sessionStorage.removeItem('justLoggedIn');
        }
        
        if (user) {
            bylawService.checkUserAgreement(user.id).then(hasAgreed => {
                if (!hasAgreed) setNeedsAgreement(true);
            }).catch(console.error);
        }
    }, [user]);

    return (
        <LayoutBranchProvider branchMode={branchMode}>
            {needsAgreement && <BylawModal onAgreed={() => setNeedsAgreement(false)} />}
            {showLoginToast && <LoginSuccessToast onClose={() => setShowLoginToast(false)} />}
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden" dir="rtl">
                <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </LayoutBranchProvider>
    );
}
