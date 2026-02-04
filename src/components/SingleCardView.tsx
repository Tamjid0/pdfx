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
        <div className="flex flex-col h-full items-center justify-between p-2 md:p-1 bg-[#0a0a0a] overflow-hidden">
            {/* Progress Indicator - Slimmed Down */}
            <div className="w-full max-w-5xl flex flex-col items-center gap-1.5 mb-1.5 px-4">
                <div className="flex items-center gap-2">
                    <div className="px-2.5 py-0.5 bg-white/5 rounded-full border border-white/10">
                        <span className="text-[8px] md:text-[9px] font-black text-white/60 uppercase tracking-[0.2em]">
                            Matrix: {cardIndex + 1} / {totalCards}
                        </span>
                    </div>
                </div>
                <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#00ff88] transition-all duration-700 shadow-[0_0_10px_rgba(0,255,136,0.2)]"
                        style={{ width: `${((cardIndex + 1) / totalCards) * 100}%` }}
                    />
                </div>
            </div>

            {/* Card Container - Maximized Height */}
            <div
                className="w-full max-w-5xl flex-1 cursor-pointer mb-2 group relative min-h-0"
                style={{ perspective: '2000px' }}
                onClick={onFlip}
            >
                <div
                    className={`relative w-full h-full transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front Side */}
                    <div
                        className="absolute inset-0 w-full h-full rounded-[2rem] flex flex-col p-5 md:p-6 bg-[#111] border border-white/10 group-hover:border-[#00ff88]/30 transition-all duration-500 shadow-2xl overflow-hidden"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[9px] font-black text-[#444] uppercase tracking-[0.3em]">Query Matrix</span>
                            <div className="flex gap-1">
                                <span className="w-1 h-1 rounded-full bg-[#00ff88]/40 animate-pulse"></span>
                                <span className="w-1 h-1 rounded-full bg-white/10"></span>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center text-center overflow-hidden w-full px-4">
                            <h4 className="text-white font-bold leading-[1.2] tracking-tight selection:bg-[#00ff88]/30 w-full"
                                style={{ fontSize: 'clamp(0.875rem, calc(0.5rem + 2.5vh), 2.5rem)' }}>
                                {card.question}
                            </h4>
                            {card.hint && (
                                <div className="mt-4 p-3 bg-white/[0.02] rounded-xl border border-dashed border-white/5 w-full max-w-lg animate-in fade-in slide-in-from-bottom-2 duration-700">
                                    <p className="text-[9px] italic text-gray-500 leading-relaxed">"{card.hint}"</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 rounded-full border border-white/10 flex items-center justify-center text-[7px] text-white/20">?</div>
                                <span className="text-[8px] text-gray-600 uppercase font-black tracking-widest whitespace-nowrap">
                                    Click to reveal knowledge
                                </span>
                            </div>
                            {card.hintNodeIds && card.hintNodeIds.length > 0 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onShowHint(card.hintNodeIds!); }}
                                    className="px-4 py-1.5 bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-lg text-[8px] font-black text-[#00ff88] uppercase tracking-widest hover:bg-[#00ff88]/10 hover:border-[#00ff88]/40 transition-all active:scale-95"
                                >
                                    Focus Source
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Back Side */}
                    <div
                        className="absolute inset-0 w-full h-full rounded-[2rem] flex flex-col p-4 md:p-6 bg-[#0c0c0c] border-2 border-[#00ff88]/10 shadow-[0_0_60px_rgba(0,255,136,0.03)] overflow-hidden"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-[#00ff88]/80 uppercase tracking-[0.3em]">Knowledge Node</span>
                                {card.interval !== undefined && (
                                    <span className="text-[8px] text-gray-700 font-bold uppercase tracking-widest mt-1">
                                        SRS Interval: {card.interval}d
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); onAskAI(); }}
                                className="w-10 h-10 flex items-center justify-center bg-[#00ff88]/5 rounded-xl text-[#00ff88] hover:bg-[#00ff88]/10 transition-all border border-[#00ff88]/10 hover:border-[#00ff88]/40 shadow-xl"
                                title="Synthesize AI Explanation"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center text-center overflow-hidden w-full px-4">
                            <p className="text-white font-black leading-[1.1] selection:bg-[#00ff88]/30 w-full"
                                style={{ fontSize: 'clamp(1rem, calc(0.6rem + 3vh), 3rem)' }}>
                                {card.answer}
                            </p>
                        </div>

                        {/* Rating Hub - Injected Assessment */}
                        <div className="mt-1 pt-4 border-t border-white/5">
                            <div className="text-[5px] font-black text-gray-700 uppercase tracking-[0.4em] mb-2 text-center">Recall Assessment</div>
                            <div className="grid grid-cols-4 gap-1.5">
                                {[
                                    { label: 'Again', key: 'again', color: 'red-500' },
                                    { label: 'Hard', key: 'hard', color: 'orange-500' },
                                    { label: 'Good', key: 'good', color: 'blue-500' },
                                    { label: 'Easy', key: 'easy', color: '[#00ff88]' }
                                ].map((r) => (
                                    <button
                                        key={r.key}
                                        onClick={(e) => { e.stopPropagation(); onRate(r.key as any); }}
                                        className={`flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-${r.color}/10 transition-all group border border-transparent hover:border-${r.color}/20`}
                                    >
                                        <span className={`text-[7px] font-black text-${r.color} uppercase tracking-widest`}>{r.label}</span>
                                        <div className={`w-full h-0.5 bg-${r.color}/20 rounded-full group-hover:bg-${r.color}/40 transition-colors`}></div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation - Minimal Footprint */}
            <div className="w-full max-w-2xl flex items-center justify-between gap-4 py-1">
                <button
                    onClick={onPrev}
                    disabled={cardIndex === 0}
                    className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all disabled:opacity-5 disabled:grayscale group active:scale-95"
                >
                    <svg className="w-4 h-4 text-white/30 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div className="flex flex-col items-center opacity-40 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2">
                        <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-[8px] text-gray-500 font-mono">←</kbd>
                        <span className="w-0.5 h-0.5 rounded-full bg-white/20"></span>
                        <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-[8px] text-gray-500 font-mono">→</kbd>
                    </div>
                </div>

                <button
                    onClick={onNext}
                    disabled={cardIndex === totalCards - 1}
                    className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all disabled:opacity-5 disabled:grayscale group active:scale-95"
                >
                    <svg className="w-4 h-4 text-white/30 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default SingleCardView;
