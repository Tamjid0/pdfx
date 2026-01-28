import React, { useState } from 'react';
import { useStore } from '../../store/useStore';

interface RevisionSwitcherProps {
    module: 'summary' | 'notes' | 'insights' | 'flashcards' | 'quiz';
}

export const RevisionSwitcher: React.FC<RevisionSwitcherProps> = ({ module }) => {
    const {
        summaryRevisions, notesRevisions, insightsRevisions, flashcardsRevisions, quizRevisions,
        summaryData, notesData, insightsData, flashcardsData, quizData,
        switchRevision
    } = useStore();

    const [showHistory, setShowHistory] = useState(false);

    // Get current module specific data
    const getModuleData = () => {
        switch (module) {
            case 'summary': return { revisions: summaryRevisions, active: summaryData, label: 'Analysis' };
            case 'notes': return { revisions: notesRevisions, active: notesData, label: 'Notes' };
            case 'insights': return { revisions: insightsRevisions, active: insightsData, label: 'Insights' };
            case 'flashcards': return { revisions: flashcardsRevisions, active: flashcardsData, label: 'Flashcards' };
            case 'quiz': return { revisions: quizRevisions, active: quizData, label: 'Quiz' };
            default: return { revisions: [], active: null, label: 'History' };
        }
    };

    const { revisions, active, label } = getModuleData();

    // Only show if the module has active data
    if (!active) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setShowHistory(!showHistory)}
                className={`px-3 py-1.5 bg-gemini-dark-300 border rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${showHistory ? 'text-gemini-green border-gemini-green shadow-[0_0_15px_rgba(0,255,136,0.2)]' : 'text-white/40 border-white/10 hover:text-white hover:border-white/20'}`}
                title="Revision History"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden md:inline uppercase tracking-widest text-[10px]">History</span>
            </button>

            {showHistory && (
                <div className="absolute top-full right-0 mt-3 w-72 bg-gemini-dark-300 border border-gemini-dark-500 rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[110] animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{label} History</h4>
                        {revisions.length === 0 && <span className="text-[8px] font-black text-white/10 uppercase">v1 (Current)</span>}
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                        {revisions.length > 0 ? (
                            revisions.map((rev: any) => (
                                <button
                                    key={rev.id}
                                    onClick={() => {
                                        switchRevision(module, rev.id);
                                        setShowHistory(false);
                                    }}
                                    className="w-full text-left p-3 rounded-xl border border-white/5 hover:bg-white/5 hover:border-gemini-green/20 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-bold text-white group-hover:text-gemini-green transition-colors">
                                            {rev.timestamp ? new Date(rev.timestamp).toLocaleString() : 'Previous Version'}
                                        </span>
                                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{rev.scope?.type || 'all'}</span>
                                    </div>
                                    <p className="text-[9px] text-white/40 line-clamp-1">
                                        {rev.scope?.type === 'pages' ? `Pages ${rev.scope.value[0]}-${rev.scope.value[1]}` : rev.scope?.type === 'topics' ? `Selected Topics` : 'Full Document'}
                                    </p>
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-[9px] text-white/20 uppercase font-black tracking-widest leading-relaxed"> No previous versions.<br />Snapshots created on refresh.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
