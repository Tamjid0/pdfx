import React from 'react';

interface GapAnalysisBlockProps {
    title: string;
    subtitle?: string;
    content: string;
    items?: string[];
    badges?: { label: string; type: 'critical' | 'medium' | 'info' }[];
}

export const GapAnalysisBlock: React.FC<GapAnalysisBlockProps> = ({ title, subtitle = "Gap Analysis", content, items = [], badges = [] }) => {
    return (
        <div className="group relative bg-[#111] border border-[#222] rounded-2xl p-6 transition-all hover:border-orange-500/30 hover:shadow-[0_4px_20px_rgba(249,115,22,0.1)] mb-6">
            {/* Header */}
            <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center text-xl mr-3 border border-orange-500/20">
                    ⚠️
                </div>
                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400 mb-0.5">
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

            {/* List */}
            {items.length > 0 && (
                <ul className="space-y-2 mb-4">
                    {items.map((item, idx) => (
                        <li key={idx} className="flex gap-3 items-start">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500/50 flex-shrink-0"></span>
                            <span className="text-sm text-gray-400">{item}</span>
                        </li>
                    ))}
                </ul>
            )}

            {/* Badges */}
            {badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                    {badges.map((badge, idx) => {
                        let badgeClass = "bg-gray-800 text-gray-400 border-gray-700";
                        if (badge.type === 'critical') badgeClass = "bg-red-500/10 text-red-400 border-red-500/20";
                        if (badge.type === 'medium') badgeClass = "bg-orange-500/10 text-orange-400 border-orange-500/20";
                        if (badge.type === 'info') badgeClass = "bg-blue-500/10 text-blue-400 border-blue-500/20";

                        return (
                            <span key={idx} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${badgeClass}`}>
                                {badge.label}
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
