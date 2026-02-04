import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DefinitionItem {
    term: string;
    definition: string;
}

interface DefinitionBlockProps {
    title?: string;
    items: DefinitionItem[];
    icon?: string;
}

export const DefinitionBlock: React.FC<DefinitionBlockProps> = ({
    title = "Key Definitions",
    items,
    icon = "📖"
}) => {
    if (!items || items.length === 0) return null;

    return (
        <div className="mb-[30px] rounded-[20px] bg-[#111] border border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="p-[20px] border-b border-white/5 flex items-center gap-[10px] bg-white/[0.02]">
                <div className="text-[10px] font-black text-[#00ff88] uppercase tracking-[0.2em]">{title}</div>
            </div>

            <div className="divide-y divide-white/5">
                {items.map((item, i) => (
                    <div key={i} className="group flex flex-col md:flex-row hover:bg-white/[0.02] transition-colors">
                        <div className="p-[15px] md:w-1/3 md:border-r border-white/5">
                            <span className="text-sm font-bold text-white group-hover:text-[#00ff88] transition-colors">{item.term}</span>
                        </div>
                        <div className="p-[15px] md:w-2/3">
                            <div className="text-sm text-gray-400 prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.definition}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
