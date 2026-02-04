
import React, { useState, useEffect } from 'react';
import { useStore, type Mode, type Flashcard } from '../store/useStore';
import { VersionTabs } from './dashboard/VersionTabs';
import { toast } from 'react-hot-toast';
import GenerationScopeSelector from './dashboard/GenerationScopeSelector';
import SingleCardView from './SingleCardView';
import CollapsibleChatPanel from './CollapsibleChatPanel';

interface FlashcardsProps {
    onGenerate: (mode: Mode) => void;
}

import LocalizedShimmer from './LocalizedShimmer';
import { calculateNextReview, type Rating } from '../utils/srsEngine';

const Flashcards: React.FC<FlashcardsProps> = ({ onGenerate }) => {
    const {
        flashcardsData, setFlashcardsData, openExportModal, isGeneratingFlashcards,
        flashcardsRevisions, switchRevision, deleteRevision, renameRevision, loadProjectModule,
        activeRevisionIds, setMode, setPrompt, logActivity, embeddedChats, openEmbeddedChat, closeEmbeddedChat,
        setActiveNodeIds
    } = useStore();

    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [phase, setPhase] = useState<'initial' | 'session'>('initial');
    const [viewMode, setViewMode] = useState<'grid' | 'single'>('grid');
    const [currentCardIndex, setCurrentCardIndex] = useState(0);

    // Sync phase with data availability
    React.useEffect(() => {
        if (flashcardsData?.flashcards?.length) {
            setPhase('session');
        } else if (!isGeneratingFlashcards) {
            setPhase('initial');
        }
    }, [flashcardsData, isGeneratingFlashcards]);

    // Load view mode preference
    useEffect(() => {
        const saved = localStorage.getItem('flashcard_view_mode');
        if (saved === 'single' || saved === 'grid') {
            setViewMode(saved);
        }
    }, []);

    // Save view mode preference
    useEffect(() => {
        localStorage.setItem('flashcard_view_mode', viewMode);
    }, [viewMode]);

    const activeRevisionId = activeRevisionIds['flashcards'];
    const cardsArray = flashcardsData?.flashcards || [];

    // Keyboard shortcuts for single card view
    useEffect(() => {
        if (viewMode !== 'single') return;

        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                setCurrentCardIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'ArrowRight') {
                setCurrentCardIndex(prev => Math.min(prev + 1, cardsArray.length - 1));
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [viewMode, cardsArray.length]);

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
            setFlashcardsData({ ...flashcardsData, flashcards: newCards });
        }
    };

    const addCard = () => {
        if (flashcardsData) {
            const newCards = [...cardsArray, { question: 'New Question', answer: 'New Answer' }];
            setFlashcardsData({ ...flashcardsData, flashcards: newCards });
        }
    };

    const deleteCard = (index: number) => {
        if (flashcardsData) {
            const newCards = cardsArray.filter((_: Flashcard, i: number) => i !== index);
            setFlashcardsData({ ...flashcardsData, flashcards: newCards });
        }
    };

    const handleRateCard = (index: number, rating: Rating) => {
        if (!flashcardsData) return;
        const card = cardsArray[index];
        const result = calculateNextReview(card, rating);

        const newCards = [...cardsArray];
        newCards[index] = {
            ...newCards[index],
            ...result
        };

        setFlashcardsData({ ...flashcardsData, flashcards: newCards });
        logActivity(1); // Track engagement
        toast.success(`Scheduled for ${result.interval === 0 ? 'immediate' : result.interval + ' day'} review`);

        // Auto-flip back after rating
        setTimeout(() => {
            setFlippedCards(prev => prev.filter(i => i !== index));
        }, 1000);
    };

    const handleAskAI = (index: number) => {
        const card = cardsArray[index];
        const contextualPrompt = `I'm studying a flashcard. The question is: "${card.question}". The answer provided is: "${card.answer}". Can you explain this concept in more detail?`;
        setPrompt(contextualPrompt);
        setMode('chat');
    };

    const handleAnkiExport = () => {
        if (!flashcardsData?.flashcards.length) return;

        // Format for Anki: "Front, Back, Tags"
        // Escaping quotes for CSV validity
        const csvContent = flashcardsData.flashcards.map(card => {
            const front = `"${card.question.replace(/"/g, '""')}"`;
            const back = `"${card.answer.replace(/"/g, '""')}"`;
            return `${front},${back},"PDFx_Generated"`; // Adding a default tag
        }).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `anki_deck_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Anki deck exported!');
    };

    if (phase === 'initial' || cardsArray.length === 0) {
        return (
            <div className="flex flex-col h-full bg-[#0a0a0a] rounded-xl border border-[#222] overflow-hidden">
                <div className="border-b border-white/5 bg-white/[0.01]">
                    <VersionTabs
                        module="flashcards"
                        revisions={flashcardsRevisions}
                        activeRevisionId={activeRevisionId}
                        onSwitch={(revId) => switchRevision('flashcards', revId)}
                        onNew={() => {
                            setFlashcardsData(null);
                            setPhase('initial');
                        }}
                        onRename={async (revId, name) => renameRevision('flashcards', revId, name)}
                        onDelete={async (revId) => deleteRevision('flashcards', revId)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-10 max-w-2xl mx-auto w-full space-y-12">
                        <div className="text-center space-y-4 pt-8">
                            <div className="w-20 h-20 bg-[#00ff88]/5 rounded-[2.5rem] flex items-center justify-center mx-auto border border-[#00ff88]/10 shadow-2xl">
                                <svg className="w-10 h-10 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-3xl font-black text-white tracking-tight uppercase italic">Flashcard Laboratory</h3>
                            <p className="text-gray-400 max-w-sm mx-auto leading-relaxed text-sm">
                                Isolate specific material to synthesize high-retention smart decks.
                            </p>
                        </div>

                        {isGeneratingFlashcards ? (
                            <div className="w-full space-y-8 animate-pulse">
                                <div className="h-40 bg-white/5 rounded-[2rem] border border-white/10 flex flex-col items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Synthesizing Decks...</span>
                                </div>
                                <LocalizedShimmer blocks={2} />
                            </div>
                        ) : (
                            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Select Target Scope</h4>
                                    <GenerationScopeSelector />
                                </div>

                                <button
                                    onClick={() => onGenerate('flashcards')}
                                    className="w-full py-5 bg-[#00ff88] text-black rounded-2xl text-xs font-black transition-all hover:bg-[#00dd77] active:scale-95 shadow-2xl flex items-center justify-center gap-3 uppercase tracking-widest"
                                >
                                    Generate Flashcards
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const handleShowHint = (nodeIds: string[]) => {
        setActiveNodeIds(nodeIds);
        toast.success("Hint source highlighted in document");
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#0a0a0a] rounded-xl border border-[#222] overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between p-5 border-b border-[#222] bg-[#111]">
                <div className="flex items-center gap-3 text-[#00ff88]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Knowledge Deck</h3>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setViewMode(viewMode === 'grid' ? 'single' : 'grid')}
                        className="px-4 py-2 bg-[#1a1a1a] text-white border border-white/10 rounded-lg text-xs font-bold hover:bg-white/5 transition-all flex items-center gap-2"
                        title={viewMode === 'grid' ? 'Switch to Single Card View' : 'Switch to Grid View'}
                    >
                        {viewMode === 'grid' ? (
                            <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>SINGLE</>
                        ) : (
                            <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>GRID</>
                        )}
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm('Are you sure you want to regenerate? This will start a new session.')) {
                                onGenerate('flashcards');
                            }
                        }}
                        disabled={isGeneratingFlashcards}
                        className="px-4 py-2 bg-[#1a1a1a] text-[#00ff88] border border-[#00ff88]/20 rounded-lg text-xs font-bold hover:bg-[#00ff88]/10 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isGeneratingFlashcards ? (
                            <div className="w-3 h-3 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        )}
                        {isGeneratingFlashcards ? 'CREATING...' : 'REGENERATE'}
                    </button>
                </div>
            </div>

            <VersionTabs
                module="flashcards"
                revisions={flashcardsRevisions}
                activeRevisionId={activeRevisionId}
                onSwitch={(revId) => {
                    switchRevision('flashcards', revId);
                    if (!revId) {
                        setPhase('initial');
                        setFlashcardsData(null);
                    }
                }}
                onNew={() => {
                    setFlashcardsData(null);
                    setPhase('initial');
                }}
                onRename={async (revId, newName) => {
                    try {
                        await renameRevision('flashcards', revId, newName);
                        toast.success('Revision renamed');
                    } catch (err) {
                        toast.error('Failed to rename revision');
                    }
                }}
                onDelete={async (revisionId) => {
                    try {
                        await deleteRevision('flashcards', revisionId);
                        toast.success('Revision deleted');
                    } catch (err) {
                        toast.error('Failed to delete revision');
                    }
                }}
            />

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-8 relative">
                {viewMode === 'single' ? (
                    <SingleCardView
                        card={cardsArray[currentCardIndex]}
                        cardIndex={currentCardIndex}
                        totalCards={cardsArray.length}
                        isFlipped={flippedCards.includes(currentCardIndex)}
                        onFlip={() => handleCardClick({} as any, currentCardIndex)}
                        onNext={() => setCurrentCardIndex(prev => Math.min(prev + 1, cardsArray.length - 1))}
                        onPrev={() => setCurrentCardIndex(prev => Math.max(prev - 1, 0))}
                        onRate={(rating) => handleRateCard(currentCardIndex, rating)}
                        onAskAI={() => openEmbeddedChat(`flashcard_${currentCardIndex}`, 'flashcard', cardsArray[currentCardIndex])}
                        onShowHint={handleShowHint}
                    />
                ) : (
                    <>
                        <p className="text-[#666] text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-center">Interactive Sessions • Click to reveal</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                            {cardsArray.map((card, index: number) => (
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
                                            <div className="absolute w-full h-full backface-hidden rounded-xl flex flex-col p-6 bg-[#111] border border-[#222] group-hover:border-[#00ff88]/30 transition-colors shadow-xl">
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="text-[10px] font-black text-[#444] uppercase tracking-widest">Question {index + 1}</span>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]/20"></div>
                                                </div>
                                                <p
                                                    className="flex-1 text-sm font-bold text-center text-white flex items-center justify-center outline-none"
                                                    contentEditable={false}
                                                    suppressContentEditableWarning={true}
                                                >
                                                    {card.question}
                                                </p>
                                            </div>
                                            <div className="absolute w-full h-full backface-hidden rounded-xl flex flex-col p-6 bg-[#1a1a1a] border-2 border-[#00ff88]/50 text-white transform rotate-y-180 shadow-[0_0_30px_rgba(0,255,136,0.1)]">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-[#00ff88] uppercase tracking-widest">Self-Assessment</span>
                                                        {card.interval !== undefined && (
                                                            <span className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter">Current Interval: {card.interval}d</span>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleAskAI(index); }}
                                                            className="p-1.5 bg-[#00ff88]/10 rounded-lg text-[#00ff88] hover:bg-[#00ff88]/20 transition-all border border-[#00ff88]/20"
                                                            title="Ask AI for explanation"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                                        </button>
                                                        <svg className="w-4 h-4 text-[#00ff88]/40" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                                    </div>
                                                </div>
                                                <p
                                                    className="flex-1 text-sm font-bold text-center flex items-center justify-center outline-none px-4"
                                                    contentEditable={false}
                                                    suppressContentEditableWarning={true}
                                                >
                                                    {card.answer}
                                                </p>

                                                <div className="mt-4 grid grid-cols-4 gap-1.5 pt-4 border-t border-white/5">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleRateCard(index, 'again'); }}
                                                        className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-red-500/10 transition-colors group/btn"
                                                    >
                                                        <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter group-hover/btn:text-red-400">Again</span>
                                                        <div className="w-full h-1 bg-red-500/20 rounded-full group-hover/btn:bg-red-500/40"></div>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleRateCard(index, 'hard'); }}
                                                        className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-orange-500/10 transition-colors group/btn"
                                                    >
                                                        <span className="text-[8px] font-black text-orange-500 uppercase tracking-tighter group-hover/btn:text-orange-400">Hard</span>
                                                        <div className="w-full h-1 bg-orange-500/20 rounded-full group-hover/btn:bg-orange-500/40"></div>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleRateCard(index, 'good'); }}
                                                        className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-blue-500/10 transition-colors group/btn"
                                                    >
                                                        <span className="text-[8px] font-black text-blue-500 uppercase tracking-tighter group-hover/btn:text-blue-400">Good</span>
                                                        <div className="w-full h-1 bg-blue-500/20 rounded-full group-hover/btn:bg-blue-500/40"></div>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleRateCard(index, 'easy'); }}
                                                        className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[#00ff88]/10 transition-colors group/btn"
                                                    >
                                                        <span className="text-[8px] font-black text-[#00ff88] uppercase tracking-tighter group-hover/btn:text-[#00ff88]">Easy</span>
                                                        <div className="w-full h-1 bg-[#00ff88]/20 rounded-full group-hover/btn:bg-[#00ff88]/40"></div>
                                                    </button>
                                                </div>
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
                    </>
                )}
            </div>

            <div className="p-6 bg-[#0f0f0f] border-t border-[#222] flex justify-between items-center">
                <button className="text-[10px] font-black text-[#444] uppercase tracking-widest hover:text-white transition-all">Clear Session</button>
                <div className="flex gap-4">
                    <button
                        onClick={handleAnkiExport}
                        className="px-6 py-2.5 bg-[#444] text-white rounded-xl text-xs font-bold hover:bg-[#666] transition-all flex items-center gap-2"
                        title="Export as CSV for Anki"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        ANKI CSV
                    </button>
                    <button
                        onClick={() => openExportModal('flashcards', flashcardsData)}
                        className="px-8 py-2.5 bg-[#00ff88] text-black rounded-xl text-xs font-bold hover:bg-[#00dd77] transition-all shadow-xl active:scale-95"
                    >
                        EXPORT JSON
                    </button>
                </div>
            </div>

            {Object.entries(embeddedChats).map(([itemId, chat]) => (
                chat.isOpen && chat.itemType === 'flashcard' && (
                    <CollapsibleChatPanel
                        key={itemId}
                        itemId={itemId}
                        itemType={chat.itemType}
                        itemData={chat.itemData}
                        onClose={() => closeEmbeddedChat(itemId)}
                    />
                )
            ))}
        </div>
    );
};

export default Flashcards;
