
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import type { Mode } from '../store/useStore';

interface Flashcard {
    question: string;
    answer: string;
}

interface FlashcardsProps {
    onGenerate: (mode: Mode) => void;
}

const Flashcards: React.FC<FlashcardsProps> = ({ onGenerate }) => {
    const {
        flashcardsData, setFlashcardsData, openExportModal
    } = useStore();

    const [flippedCards, setFlippedCards] = useState<number[]>([]);

    const cardsArray = Array.isArray(flashcardsData) ? flashcardsData : (flashcardsData?.flashcards || []);

    const handleCardClick = (e: React.MouseEvent, index: number) => {
        // Only flip if not clicking on an editable element
        if ((e.target as HTMLElement).isContentEditable) return;

        setFlippedCards(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const handleContentChange = (e: React.FocusEvent<HTMLParagraphElement>, index: number, field: 'question' | 'answer') => {
        if (flashcardsData) {
            const newCards = [...cardsArray];
            newCards[index] = { ...newCards[index], [field]: e.currentTarget.innerText };
            if (Array.isArray(flashcardsData)) {
                setFlashcardsData(newCards);
            } else {
                setFlashcardsData({ ...flashcardsData, flashcards: newCards });
            }
        }
    };

    const addCard = () => {
        if (flashcardsData) {
            const newCards = [...cardsArray, { question: 'New Question', answer: 'New Answer' }];
            if (Array.isArray(flashcardsData)) {
                setFlashcardsData(newCards);
            } else {
                setFlashcardsData({ ...flashcardsData, flashcards: newCards });
            }
        }
    };

    const deleteCard = (index: number) => {
        if (flashcardsData) {
            const newCards = cardsArray.filter((_: Flashcard, i: number) => i !== index);
            if (Array.isArray(flashcardsData)) {
                setFlashcardsData(newCards);
            } else {
                setFlashcardsData({ ...flashcardsData, flashcards: newCards });
            }
        }
    };

    if (cardsArray.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[#0a0a0a] rounded-xl border border-[#222]">
                <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6 border border-[#333] shadow-inner text-[#00ff88]">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Self-Quizzing Flashcards</h3>
                <p className="text-gray-400 mb-8 max-w-sm leading-relaxed">
                    Generate interactive flashcards to test your knowledge. Flip to reveal answers and edit them to match your learning style.
                </p>
                <button
                    onClick={() => onGenerate('flashcards')}
                    className="px-8 py-3.5 bg-[#00ff88] text-black rounded-xl text-sm font-black transition-all hover:bg-[#00dd77] active:scale-95 shadow-[0_5px_15px_rgba(0,255,136,0.3)]"
                >
                    GENERATE CARDS
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] rounded-xl border border-[#222] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-[#222] bg-[#111]">
                <div className="flex items-center gap-3 text-[#00ff88]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Knowledge Deck</h3>
                </div>
                <button
                    onClick={() => onGenerate('flashcards')}
                    className="px-4 py-2 bg-[#1a1a1a] text-[#00ff88] border border-[#00ff88]/20 rounded-lg text-xs font-bold hover:bg-[#00ff88]/10 transition-all flex items-center gap-2"
                >
                    REGENERATE
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <p className="text-[#666] text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-center">Interactive Sessions • Click to reveal</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    {cardsArray.map((card: Flashcard, index: number) => (
                        <div key={index} className="relative group">
                            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteCard(index);
                                    }}
                                    className="p-2 bg-[#111]/80 rounded-full text-gray-400 hover:text-red-500 hover:bg-[#111] border border-[#222] transition-colors shadow-lg backdrop-blur-sm"
                                    title="Delete Card"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                            <div
                                className="perspective-1000 h-64 cursor-pointer"
                                onClick={(e) => handleCardClick(e, index)}
                            >
                                <div className={`relative w-full h-full transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] transform-style-preserve-3d ${flippedCards.includes(index) ? 'rotate-y-180' : ''}`}>
                                    {/* Front */}
                                    <div className="absolute w-full h-full backface-hidden rounded-xl flex flex-col p-6 bg-[#111] border border-[#222] group-hover:border-[#00ff88]/30 transition-colors shadow-xl">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[10px] font-black text-[#444] uppercase tracking-widest">Question {index + 1}</span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]/20"></div>
                                        </div>
                                        <p
                                            className="flex-1 text-sm font-bold text-center text-white flex items-center justify-center outline-none focus:text-[#00ff88]"
                                            contentEditable={true}
                                            suppressContentEditableWarning={true}
                                            onBlur={(e) => handleContentChange(e, index, 'question')}
                                        >
                                            {card.question}
                                        </p>
                                    </div>
                                    {/* Back */}
                                    <div className="absolute w-full h-full backface-hidden rounded-xl flex flex-col p-6 bg-gradient-to-br from-[#00ff88] to-[#00cc66] text-black transform rotate-y-180 shadow-[0_0_30px_rgba(0,255,136,0.2)]">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">The Truth</span>
                                            <svg className="w-4 h-4 text-black/20" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                        </div>
                                        <p
                                            className="flex-1 text-sm font-black text-center flex items-center justify-center outline-none"
                                            contentEditable={true}
                                            suppressContentEditableWarning={true}
                                            onBlur={(e) => handleContentChange(e, index, 'answer')}
                                        >
                                            {card.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={addCard}
                        className="h-64 border-2 border-[#1a1a1a] border-dashed rounded-2xl flex flex-col items-center justify-center text-[#444] hover:text-[#00ff88] hover:border-[#00ff88]/30 hover:bg-[#00ff88]/5 transition-all group"
                    >
                        <svg className="w-8 h-8 mb-4 opacity-20 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">Append New Card</span>
                    </button>
                </div>
            </div>

            <div className="p-6 bg-[#0f0f0f] border-t border-[#222] flex justify-between items-center">
                <button className="text-[10px] font-black text-[#444] uppercase tracking-widest hover:text-white transition-all">Clear Session</button>
                <button
                    onClick={() => openExportModal('flashcards', flashcardsData)}
                    className="px-8 py-2.5 bg-[#00ff88] text-black rounded-xl text-xs font-bold hover:bg-[#00dd77] transition-all shadow-xl active:scale-95"
                >
                    EXPORT CARDS
                </button>
            </div>
        </div>
    );
};

export default Flashcards;
