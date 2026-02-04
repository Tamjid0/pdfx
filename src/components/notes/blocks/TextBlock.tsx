import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TextBlockProps {
    title?: string;
    content: string;
    icon?: string;
}

export const TextBlock: React.FC<TextBlockProps> = ({
    title = "Context",
    content,
    icon = "📚"
}) => {
    return (
        <div className="mb-[20px] rounded-[20px] p-[25px] transition-all duration-300 hover:bg-[#1a1a1a] bg-[#0a0a0a] border border-white/5 animate-in fade-in slide-in-from-bottom-4 group">
            <div className="flex items-center mb-[15px] gap-[12px]">
                <div className="text-[1.1rem] w-[36px] h-[36px] flex items-center justify-center bg-white/5 text-gray-400 rounded-lg group-hover:text-[#00ff88] group-hover:bg-[#00ff88]/10 transition-colors">
                    {icon}
                </div>
                <div className="text-[1.1rem] font-bold text-gray-200 group-hover:text-white transition-colors">{title}</div>
            </div>
            <div className="text-gray-400 leading-relaxed prose prose-invert prose-sm max-w-none border-l-2 border-white/5 pl-4 group-hover:border-[#00ff88]/40 transition-colors">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
        </div>
    );
};
