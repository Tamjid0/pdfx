import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DeepDiveItem {
    question?: string;
    answer?: string;
    // Or simpler:
    title?: string;
    content?: string;
}

interface DeepDiveZoneProps {
    items: DeepDiveItem[];
}

const CollapsibleItem: React.FC<{ item: DeepDiveItem }> = ({ item }) => {
    const [isOpen, setIsOpen] = useState(false);
    const title = item.question || item.title || "Detail";
    const content = item.answer || item.content || "";

    return (
        <div className="border-b border-white/5 last:border-0 py-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between text-left group"
            >
                <span className="font-bold text-gray-200 text-sm group-hover:text-[#00ff88] transition-colors">{title}</span>
                <span className={`text-gray-600 transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#00ff88]' : ''}`}>▼</span>
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                <div className="text-xs text-gray-400 bg-[#00ff88]/5 p-3 rounded-lg border border-[#00ff88]/10 prose prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

export const DeepDiveZone: React.FC<DeepDiveZoneProps> = ({ items }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className="bg-[#111] rounded-[15px] p-[25px] border-l-[4px] border-[#00ff88] shadow-[0_4px_15px_rgba(0,0,0,0.3)] mt-[20px]">
            <div className="flex items-center justify-between mb-[15px] border-b border-white/5 pb-[10px]">
                <div className="flex items-center gap-[10px]">
                    <span className="text-[1.5rem] grayscale-[0.2]">📚</span>
                    <h2 className="text-[1.1rem] font-bold text-white uppercase tracking-wider">Deep Dive (Safety Net)</h2>
                </div>
            </div>

            <div className="flex flex-col">
                {items.map((item, i) => (
                    <CollapsibleItem key={i} item={item} />
                ))}
            </div>
        </div>
    );
};
