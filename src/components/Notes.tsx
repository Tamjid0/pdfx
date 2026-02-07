import React, { useState } from 'react';
import { useStore, type Mode, type NoteSection } from '../store/useStore';
import LocalizedShimmer from './LocalizedShimmer';
import GenerationScopeSelector from './dashboard/GenerationScopeSelector';
import { NoteBlockRenderer } from './notes/NoteBlockRenderer';
import { ModeContainer } from './shared/ModeContainer';
import { DocumentPreview } from './DocumentPreview/DocumentPreview';

interface NotesProps {
    onGenerate: (mode: Mode) => void;
    historyActions?: React.ReactNode;
    interactiveAction?: React.ReactNode;
    toolsAction?: React.ReactNode;
}

const Notes: React.FC<NotesProps> = ({
    onGenerate,
    historyActions,
    interactiveAction,
    toolsAction
}) => {
    const {
        notesData, openExportModal, isGeneratingNotes,
        notesSettings, setNotesSettings
    } = useStore();

    const categories = [
        { id: 'study', title: 'Study Notes', desc: 'Academic depth, definitions, formulas & self-quizzes.', icon: '📚', color: '#00ff88' },
        { id: 'presentation', title: 'Presentation', desc: 'Narrative flow, slide structure & key talking points.', icon: '🎙️', color: '#f59e0b' }
    ];

    const hasData = (notesData?.blocks && notesData.blocks.length > 0) || (notesData?.notes && notesData.notes.length > 0);

    return (
        <ModeContainer
            module="notes"
            title="Module Overview"
            isGenerating={isGeneratingNotes}
            hasData={hasData}
            onGenerate={onGenerate}
            onExport={() => hasData && openExportModal('notes', notesData)}
            historyActions={historyActions}
            interactiveAction={interactiveAction}
            toolsAction={toolsAction}
        >
            <DocumentPreview mode="notes">
                <div className="w-full h-full relative">
                    {!hasData ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-[#0a0a0a] rounded-xl">
                            {isGeneratingNotes ? (
                                <div className="w-full max-w-md">
                                    <div className="flex flex-col items-center mb-8">
                                        <div className="w-12 h-12 bg-gemini-green/5 rounded-2xl flex items-center justify-center mb-4 border border-gemini-green/10">
                                            <div className="w-6 h-6 border-2 border-gemini-green border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                        <h3 className="text-sm font-bold text-white uppercase tracking-[0.3em]">Synthesizing {notesSettings.category} Notes...</h3>
                                        <p className="text-[10px] text-gray-500 mt-2 animate-pulse uppercase tracking-widest">Constructing deep narrative...</p>
                                    </div>
                                    <LocalizedShimmer blocks={3} />
                                </div>
                            ) : (
                                <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    <div className="mb-10">
                                        <h3 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase">What are we building?</h3>
                                        <p className="text-gray-400 max-w-md mx-auto leading-relaxed text-sm">
                                            Choose a category to transform your document into a specialized knowledge base.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setNotesSettings({ ...notesSettings, category: cat.id })}
                                                className={`group flex items-start gap-4 p-6 rounded-[2rem] border transition-all duration-300 text-left relative overflow-hidden ${notesSettings.category === cat.id
                                                    ? 'bg-white/5 border-white/20 ring-1 ring-white/10'
                                                    : 'bg-black/40 border-white/5 hover:border-white/10'
                                                    }`}
                                            >
                                                <div
                                                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg transition-transform group-hover:scale-110"
                                                    style={{ backgroundColor: `${cat.color}15`, border: `1px solid ${cat.color}30` }}
                                                >
                                                    {cat.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className={`text-sm font-black uppercase tracking-widest mb-1 ${notesSettings.category === cat.id ? 'text-white' : 'text-gray-400'}`}>
                                                        {cat.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">
                                                        {cat.desc}
                                                    </p>
                                                </div>
                                                {notesSettings.category === cat.id && (
                                                    <div className="absolute top-4 right-4 animate-in zoom-in-0 duration-300">
                                                        <div className="w-2 h-2 rounded-full shadow-[0_0_10px_#fff]" style={{ backgroundColor: cat.color }}></div>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="w-full max-w-sm mx-auto mb-10 bg-black/20 p-6 rounded-[2.5rem] border border-white/5 shadow-inner">
                                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Target Context</div>
                                        <GenerationScopeSelector />
                                    </div>

                                    <button
                                        onClick={() => onGenerate('notes')}
                                        className="group relative px-12 py-4 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-2xl"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            Start Generation
                                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-8">
                            <div className="max-w-4xl mx-auto text-left">
                                {notesData?.blocks ? (
                                    <NoteBlockRenderer blocks={notesData.blocks} />
                                ) : (
                                    <div className="space-y-12">
                                        <div className="flex flex-col gap-1">
                                            <h1 className="text-4xl font-black text-white tracking-tight">Structured Notes</h1>
                                            <p className="text-[#666] text-sm uppercase tracking-widest font-mono">Curated Knowledge Base</p>
                                        </div>

                                        {notesData?.notes?.map((noteSection: NoteSection, sectionIndex: number) => (
                                            <div key={sectionIndex} className="group relative">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <h3 className="text-lg font-bold text-[#00ff88] flex-1">
                                                        {noteSection.section}
                                                    </h3>
                                                    <div className="h-px flex-1 bg-gradient-to-r from-[#00ff88]/30 to-transparent"></div>
                                                </div>

                                                <ul className="space-y-4 ml-2">
                                                    {(noteSection.points || []).map((point: string, pointIndex: number) => (
                                                        <li key={pointIndex} className="flex gap-4 group/item items-start">
                                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00ff88]/40 flex-shrink-0"></div>
                                                            <div className="text-[#ccc] text-sm leading-relaxed">
                                                                {point}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DocumentPreview>
        </ModeContainer>
    );
};

export default Notes;
