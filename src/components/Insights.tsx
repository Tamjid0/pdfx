import React from 'react';
import { useStore } from '../store/useStore';
import type { Mode } from '../store/useStore';
import LocalizedShimmer from './LocalizedShimmer';
import GenerationScopeSelector from './dashboard/GenerationScopeSelector';

interface Insight {
    title: string;
    description: string;
}

interface InsightsProps {
    onGenerate: (mode: Mode) => void;
}

const Insights: React.FC<InsightsProps> = ({ onGenerate }) => {
    const {
        insightsData, setInsightsData, openExportModal, isGeneratingInsights,
        generationScope, insightsRevisions, switchRevision
    } = useStore();

    const [showRegenerateScope, setShowRegenerateScope] = React.useState(false);
    const [showHistory, setShowHistory] = React.useState(false);

    const insightsArray = Array.isArray(insightsData) ? insightsData : (insightsData?.insights || []);

    const handleContentChange = (e: React.FocusEvent<HTMLHeadingElement | HTMLParagraphElement>, index: number, field: 'title' | 'description') => {
        if (insightsData) {
            const newInsights = [...insightsArray];
            newInsights[index] = { ...newInsights[index], [field]: e.currentTarget.innerText };
            if (Array.isArray(insightsData)) {
                setInsightsData(newInsights);
            } else {
                setInsightsData({ ...insightsData, insights: newInsights });
            }
        }
    };

    const addInsight = () => {
        if (insightsData) {
            const newInsights = [...insightsArray, { title: 'New Insight Title', description: 'New insight description...' }];
            if (Array.isArray(insightsData)) {
                setInsightsData(newInsights);
            } else {
                setInsightsData({ ...insightsData, insights: newInsights });
            }
        }
    };

    const deleteInsight = (index: number) => {
        if (insightsData) {
            const newInsights = insightsArray.filter((_: Insight, i: number) => i !== index);
            if (Array.isArray(insightsData)) {
                setInsightsData(newInsights);
            } else {
                setInsightsData({ ...insightsData, insights: newInsights });
            }
        }
    };

    if (insightsArray.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[#0a0a0a] rounded-xl border border-[#222]">
                {isGeneratingInsights ? (
                    <div className="w-full max-w-md">
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-12 h-12 bg-gemini-green/5 rounded-2xl flex items-center justify-center mb-4 border border-gemini-green/10">
                                <div className="w-6 h-6 border-2 border-gemini-green border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.3em]">Extracting Insights...</h3>
                        </div>
                        <LocalizedShimmer blocks={3} />
                    </div>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6 border border-[#333] shadow-inner text-[#00ff88]">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Core Insights</h3>
                        <p className="text-gray-400 mb-8 max-w-sm leading-relaxed">
                            Extract deep patterns, hidden connections, and high-value conclusions from your reading material.
                        </p>

                        <div className="w-full max-w-sm mb-10 bg-black/20 p-6 rounded-[2rem] border border-white/5 shadow-inner">
                            <GenerationScopeSelector />
                        </div>

                        <button
                            onClick={() => onGenerate('insights')}
                            className="px-8 py-3.5 bg-[#00ff88] text-black rounded-xl text-sm font-black transition-all hover:bg-[#00dd77] active:scale-95 shadow-[0_5px_15px_rgba(0,255,136,0.3)]"
                        >
                            EXTRACT INSIGHTS
                        </button>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] rounded-xl border border-[#222] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-[#222] bg-[#111]">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full shadow-[0_0_8px_rgba(0,255,136,1)]"></div>
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Neural Extraction</h3>
                </div>

                <div className="flex gap-2 relative text-left">
                    {insightsData && (
                        <div className="relative">
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                className={`px-3 py-2 bg-gemini-dark-300 border rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${showHistory ? 'text-gemini-green border-gemini-green' : 'text-white/40 border-white/10 hover:text-white hover:border-white/20'}`}
                                title="Revision History"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </button>

                            {showHistory && (
                                <div className="absolute top-full right-0 mt-3 w-72 bg-gemini-dark-300 border border-gemini-dark-500 rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[110] animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Insights History</h4>
                                        {insightsRevisions.length === 0 && <span className="text-[8px] font-black text-white/10 uppercase">v1 (Current)</span>}
                                    </div>
                                    <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                                        {insightsRevisions.length > 0 ? (
                                            insightsRevisions.map((rev: any) => (
                                                <button
                                                    key={rev.id}
                                                    onClick={() => {
                                                        switchRevision('insights', rev.id);
                                                        setShowHistory(false);
                                                    }}
                                                    className="w-full text-left p-3 rounded-xl border border-white/5 hover:bg-white/5 hover:border-gemini-green/20 transition-all group"
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-[10px] font-bold text-white group-hover:text-gemini-green transition-colors">{new Date(rev.timestamp).toLocaleString()}</span>
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
                    )}

                    <div className="relative">
                        <button
                            onClick={() => setShowRegenerateScope(!showRegenerateScope)}
                            disabled={isGeneratingInsights}
                            className="px-4 py-2 bg-[#1a1a1a] text-[#00ff88] border border-[#00ff88]/20 rounded-lg text-xs font-bold hover:bg-[#00ff88]/10 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {isGeneratingInsights ? (
                                <div className="w-3 h-3 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            )}
                            {isGeneratingInsights ? 'EXTRACTING...' : 'REGENERATE'}
                        </button>

                        {showRegenerateScope && !isGeneratingInsights && (
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
                                        onGenerate('insights');
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

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <div className="max-w-4xl mx-auto grid grid-cols-1 gap-4 text-left">
                    {insightsArray.map((insight: Insight, index: number) => (
                        <div key={index} className="group relative bg-[#111]/50 border border-[#222] rounded-xl p-5 transition-all hover:bg-[#111] hover:border-[#00ff88]/30 hover:-translate-y-1">
                            <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button
                                    onClick={() => deleteInsight(index)}
                                    className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                                    title="Delete Insight"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                                <div className="p-1 opacity-50">
                                    <svg className="w-5 h-5 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </div>
                            </div>
                            <h4
                                className="text-base font-bold text-white mb-2 outline-none mr-8"
                                contentEditable={true}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleContentChange(e, index, 'title')}
                            >
                                {insight.title}
                            </h4>
                            <p
                                className="text-sm text-[#999] leading-relaxed outline-none focus:text-[#ccc]"
                                contentEditable={true}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleContentChange(e, index, 'description')}
                            >
                                {insight.description}
                            </p>
                        </div>
                    ))}

                    <button
                        onClick={addInsight}
                        className="w-full py-6 border-2 border-[#1a1a1a] border-dashed rounded-2xl text-xs font-black text-[#444] uppercase tracking-widest hover:text-[#00ff88] hover:border-[#00ff88]/30 hover:bg-[#00ff88]/5 transition-all text-center"
                    >
                        + Register New Insight
                    </button>
                </div>
            </div>

            <div className="p-6 bg-[#0f0f0f] border-t border-[#222] flex justify-between items-center">
                <div className="flex gap-2">
                    <span className="w-2 h-2 bg-[#00ff88]/20 rounded-full"></span>
                    <span className="w-2 h-2 bg-[#00ff88]/20 rounded-full"></span>
                    <span className="w-2 h-2 bg-[#00ff88]/20 rounded-full"></span>
                </div>
                <button
                    onClick={() => openExportModal('insights', insightsData)}
                    className="px-6 py-2.5 bg-[#00ff88] text-black rounded-xl text-xs font-bold hover:bg-[#00dd77] transition-all shadow-xl active:scale-95"
                >
                    EXPORT INSIGHTS
                </button>
            </div>
        </div>
    );
};

export default Insights;
