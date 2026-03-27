import { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginSuccessToast({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay to allow fade-in animation
    const timer = setTimeout(() => setVisible(true), 100);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for fade out
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, [onClose]);

  if (!user) return null;

  return (
    <div 
      className={`fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-50 transition-all duration-300 transform
      ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
      dir="rtl"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-green-100 p-4 flex gap-4 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />
        
        <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 text-sm">تم تسجيل الدخول بنجاح</h4>
          <p className="text-gray-500 text-xs mt-1">
            مرحباً بك {user.fullName}، تم توثيق جلستك وتأمين بياناتك.
          </p>
        </div>
        
        <button 
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
