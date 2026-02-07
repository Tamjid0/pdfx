import React, { useState } from 'react';
import { useStore, type Mode } from '../store/useStore';
import TiptapEditor from './TiptapEditor';
import { marked } from 'marked';
import { ModeContainer } from './shared/ModeContainer';
import { DocumentPreview } from './DocumentPreview/DocumentPreview';
import LocalizedShimmer from './LocalizedShimmer';
import GenerationScopeSelector from './dashboard/GenerationScopeSelector';

interface SummaryProps {
    onGenerate: (mode: Mode) => void;
    historyActions?: React.ReactNode;
    interactiveAction?: React.ReactNode;
    toolsAction?: React.ReactNode;
}

const Summary: React.FC<SummaryProps> = ({
    onGenerate,
    historyActions,
    interactiveAction,
    toolsAction
}) => {
    const {
        summaryData, setSummaryData, openExportModal, isGeneratingSummary,
        generationScope, switchRevision, loadProjectModule,
        activeRevisionIds
    } = useStore();
    const [copied, setCopied] = useState(false);

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

    return (
        <ModeContainer
            module="summary"
            title="Executive Brief"
            isGenerating={isGeneratingSummary}
            hasData={!!summaryData}
            onGenerate={onGenerate}
            onExport={() => summaryData && openExportModal('summary', summaryData)}
            historyActions={historyActions}
            interactiveAction={interactiveAction}
            toolsAction={toolsAction}
        >
            <DocumentPreview mode="summary">
                <div className="p-8 space-y-12 max-w-4xl mx-auto">
                    {!summaryData ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-gemini-dark rounded-xl">
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
                                    <p className="text-gemini-gray mb-8 max-w-sm leading-relaxed text-sm">
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
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            </DocumentPreview>

            <div className="px-6 py-3 bg-gemini-dark-200 border-t border-gemini-dark-400 flex justify-between items-center">
                <p className="text-[10px] font-bold text-gemini-dark-500 uppercase tracking-widest">
                    Last updated: {new Date().toLocaleTimeString()}
                </p>
                <div className="flex gap-4">
                    <button className="px-5 py-2.5 text-gemini-green text-xs font-black uppercase tracking-widest hover:underline transition-all">Download .PDF</button>
                    <button
                        className={`px-6 py-2.5 bg-gemini-green text-black rounded-xl text-xs font-bold hover:bg-gemini-green-300 transition-all shadow-[0_0_20px_rgba(0,255,136,0.15)] active:scale-95 ${!summaryData ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => summaryData && openExportModal('summary', summaryData)}
                        disabled={!summaryData}
                    >
                        EXPORT
                    </button>
                </div>
            </div>
        </ModeContainer>
    );
};

export default Summary;
