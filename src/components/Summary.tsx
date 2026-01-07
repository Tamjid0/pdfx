import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import TiptapEditor from './TiptapEditor';
import { marked } from 'marked';

// Define Mode locally for now to avoid dependency on useStore conversion
export type Mode = 'summary' | 'insights' | 'notes' | 'quiz' | 'flashcards' | 'mindmap' | 'editor' | 'chat';

interface SummaryProps {
    onGenerate: (mode: Mode) => void;
}

const Summary: React.FC<SummaryProps> = ({ onGenerate }) => {
    const {
        summaryData, setSummaryData,
    } = useStore();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!summaryData?.summary) return;
        // Strip HTML tags for clean clipboard copy
        const plainText = summaryData.summary.replace(/<[^>]*>/g, '');
        navigator.clipboard.writeText(plainText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    // Helper to get HTML content
    const getSummaryHtml = () => {
        if (!summaryData?.summary) return '';
        // If it looks like HTML (has tags), return as is
        if (/<[a-z][\s\S]*>/i.test(summaryData.summary)) {
            return summaryData.summary;
        }
        // Otherwise treat as markdown and convert
        return marked.parse(summaryData.summary);
    };

    const handleSummaryChange = (html: string) => {
        if (summaryData) {
            setSummaryData({ ...summaryData, summary: html });
        }
    };

    // Changed to HTMLDivElement as it is a div
    const handleKeyPointChange = (e: React.FocusEvent<HTMLDivElement>, index: number) => {
        if (summaryData) {
            const newKeyPoints = [...summaryData.keyPoints];
            newKeyPoints[index] = e.currentTarget.innerText;
            setSummaryData({ ...summaryData, keyPoints: newKeyPoints });
        }
    };

    const addKeyPoint = () => {
        if (summaryData) {
            setSummaryData({
                ...summaryData,
                keyPoints: [...summaryData.keyPoints, 'New key point...']
            });
        }
    };

    const deleteKeyPoint = (index: number) => {
        if (summaryData) {
            const newKeyPoints = summaryData.keyPoints.filter((_: string, i: number) => i !== index);
            setSummaryData({ ...summaryData, keyPoints: newKeyPoints });
        }
    };

    if (!summaryData) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[#0a0a0a] rounded-xl border border-[#222]">
                <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6 border border-[#333] shadow-inner">
                    <svg className="w-10 h-10 text-[#00ff88] drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Intelligent Summary</h3>
                <p className="text-gray-400 mb-8 max-w-sm leading-relaxed">
                    Let our AI analyze your document to extract core concepts, main narratives, and actionable insights.
                </p>
                <button
                    onClick={() => onGenerate('summary')}
                    className="group relative px-8 py-3.5 bg-[#00ff88] text-black rounded-xl text-sm font-black transition-all hover:bg-[#00dd77] active:scale-95 shadow-[0_5px_15px_rgba(0,255,136,0.3)] overflow-hidden"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        GENERATE SUMMARY
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] rounded-xl border border-[#222] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-[#222] bg-[#111] backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] font-mono">Analysis Ready</h3>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onGenerate('summary')}
                        className="px-4 py-2 bg-[#1a1a1a] text-[#00ff88] border border-[#00ff88]/20 rounded-lg text-xs font-bold hover:bg-[#00ff88]/10 transition-all flex items-center gap-2"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        REGENERATE
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-8 space-y-12 max-w-4xl mx-auto">
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-4 mb-6">
                            <h4 className="flex-shrink-0 text-[10px] font-black text-[#444] uppercase tracking-[0.4em]">EXECUTIVE SUMMARY</h4>
                            <div className="h-px w-full bg-[#222]"></div>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#00ff88]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                            <div className="relative bg-[#111]/50 border border-[#222] rounded-2xl h-auto transition-all group-hover:border-[#00ff88]/20 overflow-hidden">
                                {/* Integrated Copy Button */}
                                <button
                                    onClick={handleCopy}
                                    className="absolute top-3 right-3 p-2 bg-[#1a1a1a]/50 backdrop-blur-md border border-[#333] rounded-xl text-gray-500 hover:text-[#00ff88] hover:bg-[#00ff88]/10 hover:border-[#00ff88]/30 transition-all z-20 opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
                                    title="Copy to clipboard"
                                >
                                    {copied ? (
                                        <svg className="w-4 h-4 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                    )}
                                    {copied && (
                                        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-[#00ff88] text-black text-[9px] font-black px-2 py-0.5 rounded-md whitespace-nowrap animate-in fade-in slide-in-from-right-2">
                                            CLIPBOARD READY
                                        </span>
                                    )}
                                </button>

                                <div className="p-4">
                                    <TiptapEditor
                                        htmlContent={getSummaryHtml() as string}
                                        onEditorChange={handleSummaryChange}
                                        minHeight="min-h-0"
                                        tightMargins={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="animate-in fade-in slide-in-from-bottom-4 delay-200 duration-700">
                        <div className="flex items-center gap-4 mb-6">
                            <h4 className="flex-shrink-0 text-[10px] font-black text-[#444] uppercase tracking-[0.4em]">CORE TAKEAWAYS</h4>
                            <div className="h-px w-full bg-[#222]"></div>
                        </div>
                        <div className="space-y-4">
                            {summaryData.keyPoints.map((point: string, index: number) => (
                                <div key={index} className="group relative bg-[#111]/30 border border-[#222] rounded-xl p-5 transition-all hover:bg-[#111] hover:border-[#00ff88]/30 hover:translate-x-1 flex items-start gap-4">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00ff88] rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <span className="text-xs font-mono text-[#00ff88] opacity-50 font-bold mt-1">{(index + 1).toString().padStart(2, '0')}</span>
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
                                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-all p-1"
                                        title="Delete point"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addKeyPoint}
                                className="w-full py-4 border-2 border-[#1a1a1a] border-dashed rounded-xl text-[10px] font-black text-[#444] uppercase tracking-widest hover:text-[#00ff88] hover:border-[#00ff88]/30 hover:bg-[#00ff88]/5 transition-all"
                            >
                                + Append New Insight
                            </button>
                        </div>
                    </section>
                </div>
            </div>

            <div className="p-6 bg-[#0f0f0f] border-t border-[#222] flex justify-between items-center">
                <p className="text-[10px] font-bold text-[#444] uppercase tracking-widest">
                    Last updated: {new Date().toLocaleTimeString()}
                </p>
                <div className="flex gap-4">
                    <button className="px-5 py-2.5 text-[#00ff88] text-xs font-black uppercase tracking-widest hover:underline transition-all">Download .PDF</button>
                    <button
                        className="px-6 py-2.5 bg-[#00ff88] text-black rounded-xl text-xs font-bold hover:bg-[#00dd77] transition-all shadow-[0_0_20px_rgba(0,255,136,0.15)] active:scale-95"
                        onClick={() => alert('Summary exported to main editor!')}
                    >
                        PUSH TO MAIN EDITOR
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Summary;
