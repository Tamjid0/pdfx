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
        <div className="flex flex-col h-full items-center justify-between p-4 md:p-8 bg-[#0a0a0a] overflow-hidden">
            {/* Progress Indicator */}
            <div className="w-full max-w-4xl flex flex-col items-center gap-2 mb-2">
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
                        <span className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-[0.2em]">
                            Matrix Position: {cardIndex + 1} / {totalCards}
                        </span>
                    </div>
                </div>
                <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#00ff88] transition-all duration-500 shadow-[0_0_10px_rgba(0,255,136,0.3)]"
                        style={{ width: `${((cardIndex + 1) / totalCards) * 100}%` }}
                    />
                </div>
            </div>

            {/* Card Container */}
            <div
                className="w-full max-w-4xl flex-1 cursor-pointer mb-4 group relative min-h-0"
                style={{ perspective: '2000px' }}
                onClick={onFlip}
            >
                <div
                    className={`relative w-full h-full transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front */}
                    <div
                        className="absolute inset-0 w-full h-full rounded-[2.5rem] flex flex-col p-8 md:p-12 bg-[#111] border border-white/10 group-hover:border-[#00ff88]/30 transition-all duration-500 shadow-2xl overflow-hidden"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <div className="flex justify-between items-center mb-8">
                            <span className="text-[10px] font-black text-[#444] uppercase tracking-[0.3em]">Query</span>
                            <div className="flex gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]/40 animate-pulse"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]/20"></span>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center text-center overflow-hidden w-full px-2">
                            <h2 className="text-white font-bold leading-[1.3] tracking-tight selection:bg-[#00ff88]/30 w-full"
                                style={{ fontSize: 'clamp(1rem, 3.5vh, 2.25rem)' }}>
                                {card.question}
                            </h2>
                            {card.hint && (
                                <div className="mt-4 p-3 bg-white/[0.03] rounded-2xl border border-dashed border-white/10 w-full max-w-md animate-in fade-in slide-in-from-bottom-2 duration-700">
                                    <p className="text-[10px] italic text-gray-500 leading-relaxed">"{card.hint}"</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                            <div className="flex items-center gap-2 group/tip">
                                <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center text-[8px] text-white/40 group-hover/tip:border-[#00ff88]/40 group-hover/tip:text-[#00ff88]">?</div>
                                <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest transition-colors group-hover/tip:text-gray-400">
                                    Double-sided matrix • Click to reveal
                                </span>
                            </div>
                            {card.hintNodeIds && card.hintNodeIds.length > 0 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onShowHint(card.hintNodeIds!); }}
                                    className="px-4 py-2 bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-xl text-[9px] font-black text-[#00ff88] uppercase tracking-widest hover:bg-[#00ff88]/10 hover:border-[#00ff88]/40 transition-all active:scale-95"
                                >
                                    Focus Source
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Back */}
                    <div
                        className="absolute inset-0 w-full h-full rounded-[2.5rem] flex flex-col p-8 md:p-12 bg-[#0a0a0a] border-2 border-[#00ff88]/20 shadow-[0_0_50px_rgba(0,255,136,0.05)] overflow-hidden"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-[#00ff88] uppercase tracking-[0.3em]">Knowledge</span>
                                {card.interval !== undefined && (
                                    <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-1">
                                        Recall efficiency: {card.interval} Days
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); onAskAI(); }}
                                className="w-12 h-12 flex items-center justify-center bg-[#00ff88]/5 rounded-2xl text-[#00ff88] hover:bg-[#00ff88]/10 transition-all border border-[#00ff88]/10 hover:border-[#00ff88]/40 shadow-xl"
                                title="Synthesize AI Explanation"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center text-center overflow-hidden w-full px-2">
                            <p className="text-white font-black leading-[1.2] selection:bg-[#00ff88]/30 w-full"
                                style={{ fontSize: 'clamp(1.125rem, 4.5vh, 2.75rem)' }}>
                                {card.answer}
                            </p>
                        </div>

                        {/* Rating Hub */}
                        <div className="mt-4 pt-4 border-t border-white/5">
                            <div className="text-[8px] font-black text-gray-600 uppercase tracking-[0.3em] mb-3 text-center">Recall difficulty Assessment</div>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { label: 'Again', key: 'again', color: 'red-500' },
                                    { label: 'Hard', key: 'hard', color: 'orange-500' },
                                    { label: 'Good', key: 'good', color: 'blue-500' },
                                    { label: 'Easy', key: 'easy', color: '[#00ff88]' }
                                ].map((r) => (
                                    <button
                                        key={r.key}
                                        onClick={(e) => { e.stopPropagation(); onRate(r.key as any); }}
                                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-${r.color}/10 transition-all group border border-transparent hover:border-${r.color}/20`}
                                    >
                                        <span className={`text-[8px] font-black text-${r.color} uppercase tracking-widest`}>{r.label}</span>
                                        <div className={`w-full h-0.5 bg-${r.color}/20 rounded-full group-hover:bg-${r.color}/40 transition-colors`}></div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation & Controls */}
            <div className="w-full max-w-2xl flex items-center justify-between gap-6 pb-4">
                <button
                    onClick={onPrev}
                    disabled={cardIndex === 0}
                    className="w-14 h-14 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all disabled:opacity-10 disabled:grayscale group active:scale-90"
                >
                    <svg className="w-5 h-5 text-white/50 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div className="flex flex-col items-center">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-2">Workspace Navigation</div>
                    <div className="flex items-center gap-3">
                        <kbd className="px-2 py-1 bg-white/5 rounded border border-white/10 text-[10px] text-gray-400 font-mono">←</kbd>
                        <span className="w-1 h-1 rounded-full bg-white/10"></span>
                        <kbd className="px-2 py-1 bg-white/5 rounded border border-white/10 text-[10px] text-gray-400 font-mono">→</kbd>
                    </div>
                </div>

                <button
                    onClick={onNext}
                    disabled={cardIndex === totalCards - 1}
                    className="w-14 h-14 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all disabled:opacity-10 disabled:grayscale group active:scale-90"
                >
                    <svg className="w-5 h-5 text-white/50 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default SingleCardView;
