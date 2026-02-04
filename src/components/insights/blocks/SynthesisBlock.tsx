import React from 'react';

interface SynthesisBlockProps {
    title: string;
    subtitle?: string;
    content: string;
}

export const SynthesisBlock: React.FC<SynthesisBlockProps> = ({ title, subtitle = "Hidden Connection", content }) => {
    return (
        <div className="group relative bg-[#111] border border-[#222] rounded-2xl p-6 transition-all hover:border-blue-500/30 hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)] mb-6">
            {/* Header */}
            <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl mr-3 border border-blue-500/20">
                    🔗
                </div>
                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-0.5">
                        {subtitle}
                    </div>
                    <h3 className="text-lg font-bold text-white">
                        {title}
                    </h3>
                </div>
            </div>

            {/* Content */}
            <div className="text-sm text-gray-300 leading-relaxed space-y-4">
                <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
        </div>
    );
};
