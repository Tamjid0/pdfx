import React from 'react';

interface TrendBlockProps {
    title: string;
    subtitle?: string;
    content: string;
    implication?: string;
}

export const TrendBlock: React.FC<TrendBlockProps> = ({ title, subtitle = "Emerging Trend", content, implication }) => {
    return (
        <div className="group relative bg-[#111] border border-[#222] rounded-2xl p-6 transition-all hover:border-purple-500/30 hover:shadow-[0_4px_20px_rgba(168,85,247,0.1)] mb-6">
            {/* Header */}
            <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-xl mr-3 border border-purple-500/20">
                    📈
                </div>
                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 mb-0.5">
                        {subtitle}
                    </div>
                    <h3 className="text-lg font-bold text-white">
                        {title}
                    </h3>
                </div>
            </div>

            {/* Content */}
            <div className="text-sm text-gray-300 leading-relaxed mb-4">
                <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>

            {/* Implication / What's Driving This */}
            {implication && (
                <div className="mt-4 pt-4 border-t border-white/5">
                    <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">Analysis</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        {implication}
                    </p>
                </div>
            )}

            <div className="mt-4 flex">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Trend to Watch
                </span>
            </div>
        </div>
    );
};
