import React from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import clsx from 'clsx';

export interface WizardStepMeta {
    title: string;
    description: string;
    /** Short label shown in progress, e.g. "الخطوة 1" */
    stepLabel?: string;
}

interface ReportWizardProps {
    title: string;
    steps: WizardStepMeta[];
    currentStep: number;
    onNext: () => void;
    onBack: () => void;
    onFinish?: () => void;
    canNext?: boolean;
    isLastStep?: boolean;
    children: React.ReactNode;
    /** When set on the last step, replaces the default «توليد وحفظ» button */
    lastStepActions?: React.ReactNode;
}

export default function ReportWizard({
    title,
    steps,
    currentStep,
    onNext,
    onBack,
    onFinish,
    canNext = true,
    isLastStep = false,
    lastStepActions,
    children,
}: ReportWizardProps) {
    const meta = steps[currentStep];
    return (
        <div className="max-w-[1000px] mx-auto space-y-8 font-['Cairo'] pb-20" dir="rtl">
            <div className="bg-white rounded-[32px] p-8 shadow-xl border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-[28px] font-black text-[#1e3a5f]">{title}</h1>
                        <p className="text-[#64748b] mt-1">{meta.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        {steps.map((s, idx) => (
                            <React.Fragment key={idx}>
                                <div className="flex flex-col items-center gap-1">
                                    <div
                                        className={clsx(
                                            'w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all text-sm',
                                            idx === currentStep
                                                ? 'bg-[#1e3a5f] text-white shadow-lg shadow-[#1e3a5f]/20'
                                                : idx < currentStep
                                                  ? 'bg-[#3dd163] text-white'
                                                  : 'bg-gray-100 text-gray-400'
                                        )}
                                    >
                                        {idx < currentStep ? <Check className="w-5 h-5" /> : idx + 1}
                                    </div>
                                    {s.stepLabel && (
                                        <span className="text-[10px] font-bold text-[#64748b] whitespace-nowrap">{s.stepLabel}</span>
                                    )}
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className={clsx('w-6 md:w-8 h-1 rounded-full mb-5', idx < currentStep ? 'bg-[#3dd163]' : 'bg-gray-100')} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-xl border border-gray-100 min-h-[400px]">{children}</div>

            <div className="flex items-center justify-between bg-white/80 backdrop-blur-md sticky bottom-4 p-4 rounded-2xl border border-white/20 shadow-2xl z-50">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={currentStep === 0}
                    className={clsx(
                        'px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all',
                        currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-[#1e3a5f] hover:bg-gray-100'
                    )}
                >
                    <ChevronRight className="w-5 h-5" />
                    السابق
                </button>

                <div className="flex items-center gap-4 flex-wrap justify-end">
                    {isLastStep && lastStepActions ? (
                        lastStepActions
                    ) : !isLastStep ? (
                        <button
                            type="button"
                            onClick={onNext}
                            disabled={!canNext}
                            className={clsx(
                                'bg-[#1e3a5f] text-white px-10 py-4 rounded-xl font-black flex items-center gap-2 transition-all shadow-lg',
                                !canNext ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#2a4f7c] shadow-[#1e3a5f]/20'
                            )}
                        >
                            التالي
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onFinish}
                            className="bg-[#3dd163] text-[#1e3a5f] px-12 py-4 rounded-xl font-black flex items-center gap-2 transition-all shadow-lg shadow-[#3dd163]/20 hover:bg-[#28a849]"
                        >
                            توليد وحفظ التقرير
                            <Check className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
