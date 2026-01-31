import React, { useState } from 'react';
import { useStore, type Mode, type NoteSection } from '../store/useStore';
import LocalizedShimmer from './LocalizedShimmer';
import GenerationScopeSelector from './dashboard/GenerationScopeSelector';
import { VersionTabs } from './dashboard/VersionTabs';
import { toast } from 'react-hot-toast';
import { DynamicBlockRenderer } from './dashboard/DynamicBlockRenderer';


interface NotesProps {
    onGenerate: (mode: Mode) => void;
}

const Notes: React.FC<NotesProps> = ({ onGenerate }) => {
    const {
        notesData, setNotesData, openExportModal, isGeneratingNotes,
        generationScope, notesRevisions, switchRevision, deleteRevision, renameRevision, loadProjectModule,
        activeRevisionIds
    } = useStore();

    const [showRegenerateScope, setShowRegenerateScope] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const activeRevisionId = activeRevisionIds['notes'];

    const hasData = (notesData?.blocks && notesData.blocks.length > 0) || (notesData?.notes && notesData.notes.length > 0);

    if (!hasData) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[#0a0a0a] rounded-xl border border-[#222]">
                {isGeneratingNotes ? (
                    <div className="w-full max-w-md">
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-12 h-12 bg-gemini-green/5 rounded-2xl flex items-center justify-center mb-4 border border-gemini-green/10">
                                <div className="w-6 h-6 border-2 border-gemini-green border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.3em]">Synthesizing Notes...</h3>
                        </div>
                        <LocalizedShimmer blocks={3} />
                    </div>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6 border border-[#333] shadow-inner">
                            <svg className="w-10 h-10 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Structured Study Notes</h3>
                        <p className="text-gray-400 mb-8 max-w-sm leading-relaxed">
                            Transform your document into a highly organized set of study notes, categorized by domain and level of importance.
                        </p>

                        <div className="w-full max-w-sm mb-10 bg-black/20 p-6 rounded-[2rem] border border-white/5 shadow-inner">
                            <GenerationScopeSelector />
                        </div>

                        <button
                            onClick={() => onGenerate('notes')}
                            className="group relative px-8 py-3.5 bg-[#00ff88] text-black rounded-xl text-sm font-black transition-all hover:bg-[#00dd77] active:scale-95 shadow-[0_5px_15px_rgba(0,255,136,0.3)]"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                GENERATE STUDY NOTES
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </span>
                        </button>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] rounded-xl border border-[#222] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#222] bg-[#111] relative z-20">
                <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Module Overview</h3>
                </div>

                <div className="flex gap-2 relative text-left">
                    <div className="relative">
                        <button
                            onClick={() => setShowRegenerateScope(!showRegenerateScope)}
                            disabled={isGeneratingNotes}
                            className="px-4 py-2 bg-[#1a1a1a] text-[#00ff88] border border-[#00ff88]/20 rounded-lg text-xs font-bold hover:bg-[#00ff88]/10 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {isGeneratingNotes ? (
                                <div className="w-3 h-3 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            )}
                            {isGeneratingNotes ? 'SYNTHESIZING...' : 'REGENERATE'}
                        </button>

                        {showRegenerateScope && !isGeneratingNotes && (
                            <div className="absolute top-full right-0 mt-3 w-80 bg-[#111] border border-[#222] rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] animate-in fade-in zoom-in-95 duration-200 text-left">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Select Scope</h4>
                                    <button onClick={() => setShowRegenerateScope(false)} className="text-white/20 hover:text-white transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                                <GenerationScopeSelector className="!space-y-4" />
                                <button
                                    onClick={() => {
                                        setShowRegenerateScope(false);
                                        onGenerate('notes');
                                    }}
                                    className="w-full mt-6 py-3 bg-[#00ff88] text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#00dd77] transition-all shadow-[0_10px_20px_rgba(0,255,136,0.2)]"
                                >
                                    Confirm & Regenerate
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Version Tabs */}
            <VersionTabs
                module="notes"
                revisions={notesRevisions}
                activeRevisionId={activeRevisionId}
                onSwitch={(revId) => {
                    switchRevision('notes', revId);
                    if (!revId) {
                        loadProjectModule('notesData');
                    }
                }}
                onNew={() => setShowRegenerateScope(true)}
                onRename={async (revId, newName) => {
                    try {
                        await renameRevision('notes', revId, newName);
                        toast.success('Revision renamed');
                    } catch (err) {
                        toast.error('Failed to rename revision');
                    }
                }}
                onDelete={async (revisionId) => {
                    try {
                        await deleteRevision('notes', revisionId);
                        toast.success('Revision deleted');
                    } catch (err) {
                        toast.error('Failed to delete revision');
                    }
                }}
            />

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <div className="max-w-4xl mx-auto text-left">
                    {notesData?.blocks ? (
                        <DynamicBlockRenderer blocks={notesData.blocks} />
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

            <div className="p-6 bg-[#0f0f0f] border-t border-[#222] flex justify-end gap-4">
                <button className="px-5 py-2.5 text-[#00ff88] text-xs font-black uppercase tracking-widest hover:bg-[#00ff88]/5 rounded-xl transition-all">Archive</button>
                <button
                    onClick={() => openExportModal('notes', notesData)}
                    className="px-6 py-2.5 bg-[#00ff88] text-black rounded-xl text-xs font-bold hover:bg-[#00dd77] transition-all shadow-xl active:scale-95"
                >
                    EXPORT NOTES
                </button>
            </div>
        </div>
    );
};

export default Notes;
