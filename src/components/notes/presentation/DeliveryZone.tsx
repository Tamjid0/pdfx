import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DeliveryZoneProps {
    items: string[];
}

export const DeliveryZone: React.FC<DeliveryZoneProps> = ({ items }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className="bg-[#111] rounded-[15px] p-[25px] border-l-[4px] border-[#f59e0b] shadow-[0_4px_15px_rgba(0,0,0,0.3)] h-full">
            <div className="flex items-center justify-between mb-[15px] border-b border-white/5 pb-[10px]">
                <div className="flex items-center gap-[10px]">
                    <span className="text-[1.5rem] grayscale-[0.2]">🎭</span>
                    <h2 className="text-[1.1rem] font-bold text-white uppercase tracking-wider">What to Do</h2>
                </div>
            </div>

            <ul className="space-y-3">
                {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 group">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#f59e0b] group-hover:shadow-[0_0_8px_#f59e0b] transition-all"></span>
                        <span className="text-gray-300 text-[14px] group-hover:text-white transition-colors">{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};
