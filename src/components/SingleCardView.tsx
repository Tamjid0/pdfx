import React from 'react';
import { type Flashcard } from '../store/useStore';

interface SingleCardViewProps {
    card: Flashcard;
    cardIndex: number;
    totalCards: number;
    isFlipped: boolean;
    onFlip: () => void;
    onNext: () => void;
    onPrev: () => void;
    onRate: (rating: 'again' | 'hard' | 'good' | 'easy') => void;
    onAskAI: () => void;
    onShowHint: (nodeIds: string[]) => void;
}

const SingleCardView: React.FC<SingleCardViewProps> = ({
    card,
    cardIndex,
    totalCards,
    isFlipped,
    onFlip,
    onNext,
    onPrev,
    onRate,
    onAskAI,
    onShowHint
}) => {
    return (
        <div className="flex flex-col h-full items-center justify-center p-8 bg-[#0a0a0a]">
            {/* Progress Indicator */}
            <div className="mb-8 flex items-center gap-4">
                <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10">
                    <span className="text-xs font-black text-white uppercase tracking-widest">
                        Card {cardIndex + 1} of {totalCards}
                    </span>
                </div>
                <div className="h-1 w-48 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#00ff88] transition-all duration-500"
                        style={{ width: `${((cardIndex + 1) / totalCards) * 100}%` }}
                    />
                </div>
            </div>

            {/* Card */}
            <div
                className="perspective-1000 w-full max-w-2xl h-96 cursor-pointer mb-8"
                onClick={onFlip}
            >
                <div className={`relative w-full h-full transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    {/* Front */}
                    <div className="absolute w-full h-full backface-hidden rounded-3xl flex flex-col p-12 bg-[#111] border-2 border-[#333] hover:border-[#00ff88]/30 transition-colors shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-xs font-black text-[#444] uppercase tracking-widest">Question</span>
                            <div className="w-2 h-2 rounded-full bg-[#00ff88]/20"></div>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                            <p className="text-2xl font-bold text-center text-white leading-relaxed">
                                {card.question}
                            </p>
                            {card.hint && (
                                <div className="mt-4 p-4 bg-white/[0.02] rounded-2xl border border-dashed border-white/10 max-w-sm">
                                    <p className="text-[11px] italic text-gray-400 leading-relaxed">"{card.hint}"</p>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-600 uppercase tracking-widest">
                                Click to reveal answer
                            </div>
                            {card.hintNodeIds && card.hintNodeIds.length > 0 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onShowHint(card.hintNodeIds!); }}
                                    className="px-3 py-1.5 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-lg text-[9px] font-black text-[#00ff88] uppercase tracking-[0.2em] hover:bg-[#00ff88]/20 transition-all"
                                >
                                    Source Hint
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Back */}
                    <div className="absolute w-full h-full backface-hidden rounded-3xl flex flex-col p-12 bg-[#1a1a1a] border-2 border-[#00ff88]/50 transform rotate-y-180 shadow-[0_0_40px_rgba(0,255,136,0.15)]">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-[#00ff88] uppercase tracking-widest">Answer</span>
                                {card.interval !== undefined && (
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-1">
                                        Interval: {card.interval}d
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); onAskAI(); }}
                                className="p-2 bg-[#00ff88]/10 rounded-xl text-[#00ff88] hover:bg-[#00ff88]/20 transition-all border border-[#00ff88]/20"
                                title="Ask AI for explanation"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-xl font-bold text-center text-white leading-relaxed">
                                {card.answer}
                            </p>
                        </div>

                        {/* Rating Buttons */}
                        <div className="mt-8 grid grid-cols-4 gap-3 pt-6 border-t border-white/10">
                            <button
                                onClick={(e) => { e.stopPropagation(); onRate('again'); }}
                                className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-red-500/10 transition-all group border border-transparent hover:border-red-500/20"
                            >
                                <span className="text-xs font-black text-red-500 uppercase tracking-wider group-hover:text-red-400">Again</span>
                                <div className="w-full h-2 bg-red-500/20 rounded-full group-hover:bg-red-500/40"></div>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onRate('hard'); }}
                                className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-orange-500/10 transition-all group border border-transparent hover:border-orange-500/20"
                            >
                                <span className="text-xs font-black text-orange-500 uppercase tracking-wider group-hover:text-orange-400">Hard</span>
                                <div className="w-full h-2 bg-orange-500/20 rounded-full group-hover:bg-orange-500/40"></div>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onRate('good'); }}
                                className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-blue-500/10 transition-all group border border-transparent hover:border-blue-500/20"
                            >
                                <span className="text-xs font-black text-blue-500 uppercase tracking-wider group-hover:text-blue-400">Good</span>
                                <div className="w-full h-2 bg-blue-500/20 rounded-full group-hover:bg-blue-500/40"></div>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onRate('easy'); }}
                                className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-[#00ff88]/10 transition-all group border border-transparent hover:border-[#00ff88]/20"
                            >
                                <span className="text-xs font-black text-[#00ff88] uppercase tracking-wider">Easy</span>
                                <div className="w-full h-2 bg-[#00ff88]/20 rounded-full group-hover:bg-[#00ff88]/40"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-6">
                <button
                    onClick={onPrev}
                    disabled={cardIndex === 0}
                    className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Navigation</div>
                    <div className="text-sm text-white font-mono">← / →</div>
                </div>

                <button
                    onClick={onNext}
                    disabled={cardIndex === totalCards - 1}
                    className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default SingleCardView;
