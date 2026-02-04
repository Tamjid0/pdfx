import React from 'react';

interface KeywordsBlockProps {
    title?: string;
    tags: string[];
    icon?: string;
}

export const KeywordsBlock: React.FC<KeywordsBlockProps> = ({
    title = "Key Terms",
    tags,
    icon = "🔑"
}) => {
    if (!tags || tags.length === 0) return null;

    return (
        <div className="mb-[30px] animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center mb-[15px] gap-[10px]">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{title}</span>
                <div className="h-px flex-1 bg-white/10"></div>
            </div>

            <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                    <button
                        key={i}
                        className="group relative inline-flex items-center justify-center px-4 py-2 bg-[#111] border border-white/10 rounded-xl text-xs font-medium text-gray-300 transition-all hover:border-[#00ff88]/40 hover:text-[#00ff88] hover:-translate-y-0.5 active:scale-95"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]/20 mr-2 group-hover:bg-[#00ff88] transition-colors"></span>
                        {tag}
                    </button>
                ))}
            </div>
        </div>
    );
};
