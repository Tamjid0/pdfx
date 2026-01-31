import React, { useState } from 'react';
import { useStore, type Mode } from '../store/useStore';
import TiptapEditor from './TiptapEditor';
import { marked } from 'marked';

interface SummaryProps {
    onGenerate: (mode: Mode) => void;
}

import LocalizedShimmer from './LocalizedShimmer';
import GenerationScopeSelector from './dashboard/GenerationScopeSelector';
import { VersionTabs } from './dashboard/VersionTabs';
import { toast } from 'react-hot-toast';

const Summary: React.FC<SummaryProps> = ({ onGenerate }) => {
    const {
        summaryData, setSummaryData, openExportModal, isGeneratingSummary,
        generationScope, summaryRevisions, switchRevision, deleteRevision, renameRevision, loadProjectModule,
        activeRevisionIds
    } = useStore();
    const [copied, setCopied] = useState(false);
    const [showRegenerateScope, setShowRegenerateScope] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const activeRevisionId = activeRevisionIds['summary'];

    const handleCopy = () => {
        if (!summaryData?.summary) return;
        const summaryText = Array.isArray(summaryData.summary) ? summaryData.summary.join('\n') : summaryData.summary;
        // Strip HTML tags for clean clipboard copy
        const plainText = summaryText.replace(/<[^>]*>/g, '');
        navigator.clipboard.writeText(plainText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    // Helper to get HTML content
    const getSummaryHtml = () => {
        if (!summaryData?.summary) return '';
        const summaryText = Array.isArray(summaryData.summary) ? summaryData.summary.join('\n') : summaryData.summary;
        // If it looks like HTML (has tags), return as is
        if (/<[a-z][\s\S]*>/i.test(summaryText)) {
            return summaryText;
        }
        // Otherwise treat as markdown and convert
        return marked.parse(summaryText);
    };

    const handleSummaryChange = (html: string) => {
        if (summaryData) {
            setSummaryData({ ...summaryData, summary: html });
        }
    };

    // Changed to HTMLDivElement as it is a div
    const handleKeyPointChange = (e: React.FocusEvent<HTMLDivElement>, index: number) => {
        if (summaryData?.keyPoints) {
            const newKeyPoints = [...summaryData.keyPoints];
            newKeyPoints[index] = e.currentTarget.innerText;
            setSummaryData({ ...summaryData, keyPoints: newKeyPoints });
        }
    };

    const addKeyPoint = () => {
        if (summaryData) {
            setSummaryData({
                ...summaryData,
                keyPoints: [...(summaryData.keyPoints || []), 'New key point...']
            });
        }
    };

    const deleteKeyPoint = (index: number) => {
        if (summaryData?.keyPoints) {
            const newKeyPoints = summaryData.keyPoints.filter((_: string, i: number) => i !== index);
            setSummaryData({ ...summaryData, keyPoints: newKeyPoints });
        }
    };

    if (!summaryData) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gemini-dark rounded-xl border border-gemini-dark-400">
                {isGeneratingSummary ? (
                    <div className="w-full max-w-md">
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-12 h-12 bg-gemini-green/5 rounded-2xl flex items-center justify-center mb-4 border border-gemini-green/10">
                                <div className="w-6 h-6 border-2 border-gemini-green border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.3em]">Decoding Document...</h3>
                        </div>
                        <LocalizedShimmer blocks={2} />
                    </div>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-gemini-dark-300 rounded-full flex items-center justify-center mb-6 border border-gemini-dark-500 shadow-inner">
                            <svg className="w-10 h-10 text-gemini-green drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Intelligent Summary</h3>
                        <p className="text-gemini-gray mb-8 max-w-sm leading-relaxed">
                            Let our AI analyze your document to extract core concepts, main narratives, and actionable insights.
                        </p>

                        <div className="w-full max-w-sm mb-10 bg-black/20 p-6 rounded-[2rem] border border-white/5 shadow-inner">
                            <GenerationScopeSelector />
                        </div>

                        <button
                            onClick={() => onGenerate('summary')}
                            className="group relative px-8 py-3.5 bg-gemini-green text-black rounded-xl text-sm font-black transition-all hover:bg-gemini-green-300 active:scale-95 shadow-[0_5px_15px_rgba(0,255,136,0.3)] overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                GENERATE SUMMARY
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </button>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full bg-gemini-dark rounded-xl border border-gemini-dark-400 overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gemini-dark-400 bg-gemini-dark-200 backdrop-blur-md relative z-20">
                <div className="flex items-center gap-3">
                    <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-gemini-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-gemini-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-gemini-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] font-mono">Analysis Ready</h3>
                </div>
                <div className="flex gap-2 relative">
                    <button
                        onClick={() => setShowRegenerateScope(!showRegenerateScope)}
                        disabled={isGeneratingSummary}
                        className="px-4 py-2 bg-gemini-dark-300 text-gemini-green border border-gemini-green/20 rounded-lg text-xs font-bold hover:bg-gemini-green/10 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isGeneratingSummary ? (
                            <div className="w-3 h-3 border-2 border-gemini-green border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        )}
                        {isGeneratingSummary ? 'REGENERATING...' : 'REGENERATE'}
                    </button>

                    {showRegenerateScope && !isGeneratingSummary && (
                        <div className="absolute top-full right-0 mt-3 w-80 bg-gemini-dark-300 border border-gemini-dark-500 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] animate-in fade-in zoom-in-95 duration-200">
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
                                    onGenerate('summary');
                                }}
                                className="w-full mt-6 py-3 bg-gemini-green text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gemini-green-300 transition-all shadow-[0_10px_20px_rgba(0,255,136,0.2)]"
                            >
                                Confirm & Regenerate
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Version Tabs */}
            <VersionTabs
                module="summary"
                revisions={summaryRevisions}
                activeRevisionId={activeRevisionId}
                onSwitch={(revId) => {
                    switchRevision('summary', revId);
                    if (!revId) {
                        loadProjectModule('summaryData');
                    }
                }}
                onNew={() => setShowRegenerateScope(true)}
                onRename={async (revId, newName) => {
                    try {
                        await renameRevision('summary', revId, newName);
                        toast.success('Revision renamed');
                    } catch (err) {
                        toast.error('Failed to rename revision');
                    }
                }}
                onDelete={async (revisionId) => {
                    try {
                        await deleteRevision('summary', revisionId);
                        toast.success('Revision deleted');
                    } catch (err) {
                        toast.error('Failed to delete revision');
                    }
                }}
            />

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar relative">
                <div className="p-8 space-y-12 max-w-4xl mx-auto">
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-4 mb-6">
                            <h4 className="flex-shrink-0 text-[10px] font-black text-[#444] uppercase tracking-[0.4em]">EXECUTIVE SUMMARY</h4>
                            <div className="h-px w-full bg-[#222]"></div>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-gemini-green/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                            <div className="relative bg-gemini-dark-200/50 border border-gemini-dark-400 rounded-2xl h-auto transition-all group-hover:border-gemini-green/20 overflow-hidden">
                                {/* Integrated Copy Button */}
                                <button
                                    onClick={handleCopy}
                                    className="absolute top-3 right-3 p-2 bg-gemini-dark-300/50 backdrop-blur-md border border-gemini-dark-500 rounded-xl text-gemini-gray hover:text-gemini-green hover:bg-gemini-green/10 hover:border-gemini-green/30 transition-all z-20 opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
                                    title="Copy to clipboard"
                                >
                                    {copied ? (
                                        <svg className="w-4 h-4 text-gemini-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                    )}
                                    {copied && (
                                        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gemini-green text-black text-[9px] font-black px-2 py-0.5 rounded-md whitespace-nowrap animate-in fade-in slide-in-from-right-2">
                                            CLIPBOARD READY
                                        </span>
                                    )}
                                </button>

                                <div className="p-4">
                                    {isGeneratingSummary ? (
                                        <LocalizedShimmer blocks={2} />
                                    ) : (
                                        <TiptapEditor
                                            htmlContent={getSummaryHtml() as string}
                                            onEditorChange={handleSummaryChange}
                                            minHeight="min-h-0"
                                            tightMargins={true}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="animate-in fade-in slide-in-from-bottom-4 delay-200 duration-700">
                        <div className="flex items-center gap-4 mb-6">
                            <h4 className="flex-shrink-0 text-[10px] font-black text-[#444] uppercase tracking-[0.4em]">CORE TAKEAWAYS</h4>
                            <div className="h-px w-full bg-gemini-dark-400"></div>
                        </div>
                        <div className="space-y-4">
                            {(summaryData?.keyPoints || []).map((point: string, index: number) => (
                                <div key={index} className="group relative bg-gemini-dark-200/30 border border-gemini-dark-400 rounded-xl p-5 transition-all hover:bg-gemini-dark-200 hover:border-gemini-green/30 hover:translate-x-1 flex items-start gap-4">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gemini-green rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <span className="text-xs font-mono text-gemini-green opacity-50 font-bold mt-1">{(index + 1).toString().padStart(2, '0')}</span>
                                    <div
                                        className="flex-1 text-sm text-[#ddd] leading-relaxed outline-none focus:text-white"
                                        contentEditable={true}
                                        suppressContentEditableWarning={true}
                                        onBlur={(e) => handleKeyPointChange(e, index)}
                                    >
                                        {point}
                                    </div>
                                    <button
                                        onClick={() => deleteKeyPoint(index)}
                                        className="opacity-0 group-hover:opacity-100 text-gemini-gray hover:text-red-500 transition-all p-1"
                                        title="Delete point"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addKeyPoint}
                                className="w-full py-4 border-2 border-gemini-dark-300 border-dashed rounded-xl text-[10px] font-black text-gemini-dark-500 uppercase tracking-widest hover:text-gemini-green hover:border-gemini-green/30 hover:bg-gemini-green/5 transition-all"
                            >
                                + Append New Insight
                            </button>
                        </div>
                    </section>
                </div>
            </div>

            <div className="px-6 py-3 bg-gemini-dark-200 border-t border-gemini-dark-400 flex justify-between items-center">
                <p className="text-[10px] font-bold text-gemini-dark-500 uppercase tracking-widest">
                    Last updated: {new Date().toLocaleTimeString()}
                </p>
                <div className="flex gap-4">
                    <button className="px-5 py-2.5 text-gemini-green text-xs font-black uppercase tracking-widest hover:underline transition-all">Download .PDF</button>
                    <button
                        className="px-6 py-2.5 bg-gemini-green text-black rounded-xl text-xs font-bold hover:bg-gemini-green-300 transition-all shadow-[0_0_20px_rgba(0,255,136,0.15)] active:scale-95"
                        onClick={() => openExportModal('summary', summaryData)}
                    >
                        EXPORT
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Summary;
