import React, { useState } from 'react';

interface QuizItem {
    question: string;
    answer: string;
    hint?: string;
}

interface QuizBlockProps {
    title?: string;
    items: QuizItem[];
    icon?: string;
}

const QuizQuestion: React.FC<{ item: QuizItem; index: number }> = ({ item, index }) => {
    const [showAnswer, setShowAnswer] = useState(false);

    return (
        <div className="mb-6 last:mb-0 p-[20px] bg-[#111] rounded-[15px] border border-white/5 transition-all duration-300 hover:border-[#00ff88]/30 group">
            <div className="flex gap-4">
                <div className="text-xs font-black text-[#00ff88] bg-[#00ff88]/10 px-2 py-1 rounded h-fit">0{index + 1}</div>
                <div className="flex-1">
                    <p className="font-bold text-white mb-4 text-sm leading-relaxed">{item.question}</p>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowAnswer(!showAnswer)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${showAnswer ? 'bg-white/10 text-white' : 'bg-[#00ff88] text-black hover:bg-[#00dd77] shadow-[0_0_15px_rgba(0,255,136,0.3)]'}`}
                        >
                            {showAnswer ? 'Hide Answer' : 'Reveal Answer'}
                        </button>

                        {!showAnswer && item.hint && (
                            <span className="text-xs text-gray-600 italic group-hover:text-gray-500 transition-colors">Hint available in answer</span>
                        )}
                    </div>
                </div>
            </div>

            <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${showAnswer ? 'grid-rows-[1fr] mt-4 pt-4 border-t border-white/5' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                    <div className="bg-[#00ff88]/5 p-4 rounded-lg border border-[#00ff88]/10">
                        <div className="text-[10px] font-black text-[#00ff88] uppercase tracking-widest mb-1">Correct Answer</div>
                        <div className="text-white text-sm font-medium">{item.answer}</div>
                        {item.hint && <div className="mt-3 text-xs text-gray-500 italic border-t border-white/5 pt-2">💡 Hint: {item.hint}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const QuizBlock: React.FC<QuizBlockProps> = ({
    title = "Knowledge Check",
    items,
    icon = "❓"
}) => {
    if (!items || items.length === 0) return null;

    return (
        <div className="mb-[30px] rounded-[20px] p-[25px] bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
            <div className="flex items-center mb-[25px] gap-[15px]">
                <div className="w-[40px] h-[40px] flex items-center justify-center bg-[#00ff88] text-black rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(0,255,136,0.3)]">
                    ?
                </div>
                <div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Self Assessment</div>
                    <div className="text-[1.2rem] font-bold text-white">{title}</div>
                </div>
            </div>

            <div className="space-y-4">
                {items.map((item, i) => (
                    <QuizQuestion key={i} item={item} index={i} />
                ))}
            </div>
        </div>
    );
};
