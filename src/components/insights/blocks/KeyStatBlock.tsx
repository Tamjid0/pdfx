import React from 'react';

interface KeyStatBlockProps {
    title: string;
    subtitle?: string;
    content: string;
    stats: { value: string; label: string }[];
}

export const KeyStatBlock: React.FC<KeyStatBlockProps> = ({ title, subtitle = "Key Statistics", content, stats = [] }) => {
    return (
        <div className="group relative bg-[#111] border border-[#222] rounded-2xl p-6 transition-all hover:border-pink-500/30 hover:shadow-[0_4px_20px_rgba(236,72,153,0.1)] mb-6">
            {/* Header */}
            <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center text-xl mr-3 border border-pink-500/20">
                    📊
                </div>
                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-400 mb-0.5">
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

            {/* Stat Grid */}
            {stats.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-[#0a0a0a] border border-[#222] rounded-xl p-4 text-center group/stat hover:border-pink-500/30 transition-colors">
                            <div className="text-2xl font-black text-pink-500 mb-1">{stat.value}</div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{stat.label}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
