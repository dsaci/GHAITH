import React from 'react';
import clsx from 'clsx';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'indigo';
    trend?: { value: number; positive: boolean };
}

const COLOR_MAP = {
    green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-600', text: 'text-green-600' },
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', text: 'text-blue-600' },
    yellow: { bg: 'bg-yellow-50', icon: 'bg-yellow-100 text-yellow-600', text: 'text-yellow-600' },
    red: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', text: 'text-red-600' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', text: 'text-purple-600' },
    indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-100 text-indigo-600', text: 'text-indigo-600' },
};

export function StatCard({ title, value, subtitle, icon, color, trend }: StatCardProps) {
    const colors = COLOR_MAP[color];
    return (
        <div className={clsx('stat-card', colors.bg, 'border-0')}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500 font-medium">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
                    {trend && (
                        <p className={clsx('text-xs font-medium mt-1', trend.positive ? 'text-green-600' : 'text-red-500')}>
                            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% مقارنة بالشهر الماضي
                        </p>
                    )}
                </div>
                <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', colors.icon)}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

interface BadgeProps {
    children: React.ReactNode;
    variant: 'green' | 'red' | 'yellow' | 'gray' | 'blue' | 'purple' | 'orange';
    className?: string;
}

const BADGE_CLASSES = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800',
};

export function Badge({ children, variant, className }: BadgeProps) {
    return (
        <span className={clsx('badge', BADGE_CLASSES[variant], className)}>
            {children}
        </span>
    );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md';
    icon?: React.ReactNode;
}

export function Button({ children, variant = 'primary', size = 'md', icon, className, ...props }: ButtonProps) {
    return (
        <button
            className={clsx(
                variant === 'primary' && 'btn-primary',
                variant === 'secondary' && 'btn-secondary',
                variant === 'danger' && 'btn-danger',
                size === 'sm' && 'text-xs py-1.5 px-3',
                className
            )}
            {...props}
        >
            {icon}
            {children}
        </button>
    );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
    return (
        <div>
            {label && <label className="form-label">{label}</label>}
            <input className={clsx('input-field', error && 'border-red-400', className)} {...props} />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

export function Select({ label, error, className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }) {
    return (
        <div>
            {label && <label className="form-label">{label}</label>}
            <select className={clsx('select-field', error && 'border-red-400', className)} {...props}>
                {children}
            </select>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className={clsx('modal-content', size === 'lg' && 'max-w-3xl', size === 'sm' && 'max-w-sm')}>
                <div className="modal-header">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-4', lg: 'w-12 h-12 border-4' };
    return (
        <div className="flex items-center justify-center py-12">
            <div className={clsx(`border-primary-200 border-t-primary-600 rounded-full animate-spin`, sizeClasses[size])}></div>
        </div>
    );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-3xl">📭</span>
            </div>
            <p className="text-gray-700 font-semibold text-lg">{title}</p>
            {description && <p className="text-gray-400 text-sm mt-1">{description}</p>}
        </div>
    );
}
