import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ScriptZoneProps {
    content: string; // Markdown content
    timing?: string;
}

export const ScriptZone: React.FC<ScriptZoneProps> = ({ content, timing }) => {
    return (
        <div className="bg-[#111] rounded-[15px] p-[25px] border-l-[4px] border-[#3b82f6] shadow-[0_4px_15px_rgba(0,0,0,0.3)] h-full flex flex-col">
            <div className="flex items-center justify-between mb-[15px] border-b border-white/5 pb-[10px]">
                <div className="flex items-center gap-[10px]">
                    <span className="text-[1.5rem] grayscale-[0.2]">💬</span>
                    <h2 className="text-[1.1rem] font-bold text-white uppercase tracking-wider">What to Say</h2>
                </div>
                {timing && (
                    <div className="flex items-center gap-2 bg-[#3b82f6]/10 px-3 py-1 rounded-full border border-[#3b82f6]/20">
                        <span className="text-xs font-mono text-[#60a5fa]">{timing}</span>
                    </div>
                )}
            </div>

            <div className="flex-1 text-gray-300 leading-relaxed text-[15px] prose prose-invert prose-p:my-3">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        // Custom highlighting for emphasis in script
                        strong: ({ node, ...props }) => <span className="bg-[#3b82f6]/20 text-[#60a5fa] px-1 py-0.5 rounded font-bold" {...props} />
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
};
