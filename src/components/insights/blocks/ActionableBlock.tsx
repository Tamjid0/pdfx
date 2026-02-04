import React from 'react';

interface ActionableBlockProps {
    title: string;
    subtitle?: string;
    content: string;
    steps?: { title?: string; description: string }[];
}

export const ActionableBlock: React.FC<ActionableBlockProps> = ({ title, subtitle = "Actionable Takeaway", content, steps = [] }) => {
    return (
        <div className="group relative bg-[#111] border border-[#222] rounded-2xl p-6 transition-all hover:border-green-500/30 hover:shadow-[0_4px_20px_rgba(34,197,94,0.1)] mb-6">
            {/* Header */}
            <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center text-xl mr-3 border border-green-500/20">
                    ✓
                </div>
                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400 mb-0.5">
                        {subtitle}
                    </div>
                    <h3 className="text-lg font-bold text-white">
                        {title}
                    </h3>
                </div>
            </div>

            {/* Content */}
            <div className="text-sm text-gray-300 leading-relaxed mb-6">
                <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>

            {/* Action List */}
            {steps.length > 0 && (
                <div className="bg-[#0a0a0a] rounded-xl p-5 border border-[#222] border-l-4 border-l-green-500 space-y-4">
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex gap-4">
                            <div className="w-6 h-6 rounded-full bg-green-500 text-black flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                {idx + 1}
                            </div>
                            <div>
                                {step.title && <div className="text-sm font-bold text-white mb-1">{step.title}</div>}
                                <div className="text-sm text-gray-400 leading-relaxed">{step.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
