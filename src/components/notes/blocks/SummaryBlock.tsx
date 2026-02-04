import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SummaryBlockProps {
    title?: string;
    content: string;
    icon?: string;
}

export const SummaryBlock: React.FC<SummaryBlockProps> = ({
    title = "Quick Summary",
    content,
    icon = "📋"
}) => {
    return (
        <div className="mb-[30px] rounded-[20px] p-[30px] transition-all duration-300 ease-in-out hover:-translate-y-[5px] hover:shadow-[0_10px_30px_rgba(0,255,136,0.1)] bg-[#111] border border-[#00ff88]/20 animate-in fade-in slide-in-from-bottom-4 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff88]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="flex items-center mb-[20px] gap-[15px] relative z-10">
                <div className="text-[1.2rem] w-[40px] h-[40px] flex items-center justify-center bg-[#00ff88]/10 text-[#00ff88] rounded-xl border border-[#00ff88]/20 shadow-[0_0_15px_rgba(0,255,136,0.2)]">
                    {icon}
                </div>
                <div>
                    <div className="text-[10px] font-black text-[#00ff88] uppercase tracking-[0.3em] opacity-80">Executive Overview</div>
                    <div className="text-[1.4rem] font-bold text-white tracking-tight">{title}</div>
                </div>
            </div>

            <div className="text-gray-300 leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-2 relative z-10">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
        </div>
    );
};
