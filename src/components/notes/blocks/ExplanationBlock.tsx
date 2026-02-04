import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ExplanationBlockProps {
    title?: string;
    content: string;
    icon?: string;
}

export const ExplanationBlock: React.FC<ExplanationBlockProps> = ({
    title = "Detailed Explanation",
    content,
    icon = "💡"
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`mb-[20px] rounded-[20px] transition-all duration-300 border ${isOpen ? 'bg-[#111] border-[#00ff88]/30 shadow-[0_0_20px_rgba(0,255,136,0.05)]' : 'bg-[#0a0a0a] border-white/10 hover:border-white/20'}`}>
            <button
                className="w-full flex items-center justify-between p-[20px] cursor-pointer group outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-[15px]">
                    <div className={`w-[36px] h-[36px] rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-[#00ff88]/20 text-[#00ff88]' : 'bg-white/5 text-gray-500 group-hover:text-white'}`}>
                        {icon}
                    </div>
                    <div className={`text-[1.1rem] font-bold transition-colors ${isOpen ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                        {title}
                    </div>
                </div>
                <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all duration-300 ${isOpen ? 'rotate-180 bg-[#00ff88] text-black border-[#00ff88]' : 'text-gray-500 group-hover:bg-white/10'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </button>

            <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-[20px] pt-0 border-t border-white/5">
                    <div className="pt-4 text-gray-300 leading-relaxed prose prose-invert prose-sm max-w-none prose-headings:text-white prose-a:text-[#00ff88]">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
};
