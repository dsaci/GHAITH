export default function PlaceholderPage({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div className="max-w-2xl mx-auto text-center py-16 px-4" dir="rtl">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">{title}</h1>
            {subtitle && <p className="text-gray-600 dark:text-slate-400">{subtitle}</p>}
        </div>
    );
}
