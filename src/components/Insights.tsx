import React, { useState } from 'react';
import { useStore, type Mode, type Insight } from '../store/useStore';
import LocalizedShimmer from './LocalizedShimmer';
import GenerationScopeSelector from './dashboard/GenerationScopeSelector';
import { InsightBlockRenderer } from './insights/InsightBlockRenderer';
import { ModeContainer } from './shared/ModeContainer';
import { DocumentPreview } from './DocumentPreview/DocumentPreview';

interface InsightsProps {
    onGenerate: (mode: Mode) => void;
    historyActions?: React.ReactNode;
    interactiveAction?: React.ReactNode;
    toolsAction?: React.ReactNode;
}

const Insights: React.FC<InsightsProps> = ({
    onGenerate,
    historyActions,
    interactiveAction,
    toolsAction
}) => {
    const {
        insightsData, openExportModal, isGeneratingInsights,
        activeRevisionIds
    } = useStore();

    const hasData = (insightsData?.blocks && insightsData.blocks.length > 0) || (insightsData?.insights && insightsData.insights.length > 0);

    return (
        <ModeContainer
            module="insights"
            title="Neural Extraction"
            isGenerating={isGeneratingInsights}
            hasData={hasData}
            onGenerate={onGenerate}
            onExport={() => hasData && openExportModal('insights', insightsData)}
            historyActions={historyActions}
            interactiveAction={interactiveAction}
            toolsAction={toolsAction}
        >
            <DocumentPreview mode="insights">
                <div className="w-full relative">
                    {!hasData ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center pt-2 px-8 pb-8 bg-[#0a0a0a] rounded-xl space-y-6">
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
                                    <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-4 border border-[#333] shadow-inner text-[#00ff88]">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Core Insights</h3>
                                    <p className="text-gray-400 mb-6 max-w-sm leading-relaxed text-sm">
                                        Extract deep patterns, hidden connections, and high-value conclusions from your reading material.
                                    </p>

                                    <div className="w-full max-w-sm mx-auto mb-6 bg-black/20 p-6 rounded-[2.5rem] border border-white/5 shadow-inner">
                                        <GenerationScopeSelector />
                                    </div>

                                    <button
                                        onClick={() => onGenerate('insights')}
                                        className="px-12 py-4 bg-[#00ff88] text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-[0_5px_15px_rgba(0,255,136,0.3)] flex items-center justify-center gap-3 w-full max-w-sm mx-auto"
                                    >
                                        EXTRACT INSIGHTS
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="p-8">
                            <div className="max-w-4xl mx-auto text-left">
                                {insightsData?.blocks ? (
                                    <InsightBlockRenderer blocks={insightsData.blocks as any} />
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
                    )}
                </div>
            </DocumentPreview>
        </ModeContainer>
    );
};

export default Insights;
