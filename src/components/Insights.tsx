import React, { useState } from 'react';
import { useStore, type Mode, type Insight } from '../store/useStore';
import LocalizedShimmer from './LocalizedShimmer';
import GenerationScopeSelector from './dashboard/GenerationScopeSelector';
import { VersionTabs } from './dashboard/VersionTabs';
import { toast } from 'react-hot-toast';
import { DynamicBlockRenderer } from './dashboard/DynamicBlockRenderer';
import { InsightBlockRenderer } from './insights/InsightBlockRenderer';


interface InsightsProps {
    onGenerate: (mode: Mode) => void;
}

const Insights: React.FC<InsightsProps> = ({ onGenerate }) => {
    const {
        insightsData, setInsightsData, openExportModal, isGeneratingInsights,
        generationScope, insightsRevisions, switchRevision, deleteRevision, renameRevision, loadProjectModule,
        activeRevisionIds, addLocalDraft
    } = useStore();
    const [showRegenerateScope, setShowRegenerateScope] = useState(false);

    const activeRevisionId = activeRevisionIds['insights'];

    const hasData = (insightsData?.blocks && insightsData.blocks.length > 0) || (insightsData?.insights && insightsData.insights.length > 0);

    if (!hasData) {
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
        <div className="flex flex-col h-full w-full bg-[#0a0a0a] rounded-xl border border-[#222] overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#222] bg-[#111] relative z-20">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full shadow-[0_0_8px_rgba(0,255,136,1)]"></div>
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Neural Extraction</h3>
                </div>

                <div className="flex gap-2 relative text-left">
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

            {/* Version Tabs */}
            <VersionTabs
                module="insights"
                revisions={insightsRevisions}
                activeRevisionId={activeRevisionId}
                onSwitch={(revId) => {
                    switchRevision('insights', revId);
                    if (!revId) {
                        loadProjectModule('insightsData');
                    }
                }}
                onNew={() => {
                    const draftId = addLocalDraft('insights');
                    switchRevision('insights', draftId);
                }}
                onRename={async (revId, newName) => {
                    try {
                        await renameRevision('insights', revId, newName);
                        toast.success('Revision renamed');
                    } catch (err) {
                        toast.error('Failed to rename revision');
                    }
                }}
                onDelete={async (revisionId) => {
                    try {
                        await deleteRevision('insights', revisionId);
                        toast.success('Revision deleted');
                    } catch (err) {
                        toast.error('Failed to delete revision');
                    }
                }}
            />

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-8 relative">
                <div className="max-w-4xl mx-auto text-left">
                    {insightsData?.blocks ? (
                        <InsightBlockRenderer blocks={insightsData.blocks} />
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {insightsData?.insights?.map((insight: Insight, index: number) => (
                                <div key={index} className="group relative bg-[#111]/50 border border-[#222] rounded-xl p-5 transition-all hover:bg-[#111] hover:border-[#00ff88]/30 hover:-translate-y-1">
                                    <h4 className="text-base font-bold text-white mb-2 mr-8">
                                        {insight.title}
                                    </h4>
                                    <p className="text-sm text-[#999] leading-relaxed">
                                        {insight.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
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
