import React, { useState } from 'react';
import { AdaptiveBlock, useStore } from '../../store/useStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';
import katex from 'katex';

interface DynamicBlockRendererProps {
    blocks: AdaptiveBlock[];
    onContentChange?: (blockIndex: number, field: string, value: any) => void;
}

const FormulaBlock: React.FC<{ formula: string; label?: string }> = ({ formula, label }) => {
    let html = '';
    try {
        html = katex.renderToString(formula, { throwOnError: false, displayMode: true });
    } catch (e) {
        html = formula;
    }

    return (
        <div className="my-4 p-6 bg-white/5 rounded-2xl border border-white/10 text-center group hover:border-[#00ff88]/30 transition-all duration-300">
            {label && <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00ff88] mb-4 opacity-70 group-hover:opacity-100 transition-opacity">{label}</div>}
            <div
                className="text-lg md:text-xl text-white overflow-x-auto custom-scrollbar pb-2 mask-fade-edges"
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </div>
    );
};

const TerminologyMatrix: React.FC<{ items: any[] }> = ({ items }) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, i) => (
                <div
                    key={i}
                    onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                    className={`group relative p-6 rounded-3xl border transition-all duration-500 cursor-pointer overflow-hidden ${activeIndex === i
                            ? 'bg-[#00ff88]/10 border-[#00ff88]/40 ring-1 ring-[#00ff88]/20'
                            : 'bg-white/[0.03] border-white/5 hover:border-[#00ff88]/30 hover:bg-white/[0.05]'
                        }`}
                >
                    <div className="flex flex-col h-full">
                        <div className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${activeIndex === i ? 'text-[#00ff88]' : 'text-gray-400 group-hover:text-white'}`}>
                            {item.term || item.heading || 'Terminology'}
                        </div>

                        <div className={`mt-4 overflow-hidden transition-all duration-500 ease-in-out ${activeIndex === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="text-sm text-gray-300 leading-relaxed border-t border-white/10 pt-4 prose prose-invert prose-xs max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {item.description || item.explanation || item.content || ''}
                                </ReactMarkdown>
                            </div>
                        </div>

                        {!activeIndex && activeIndex !== i && (
                            <div className="mt-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[9px] font-bold text-[#00ff88] uppercase tracking-[0.1em]">Reveal Definition</span>
                                <svg className="w-4 h-4 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Subtle corner accent */}
                    <div className={`absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-[#00ff88]/10 to-transparent transition-opacity duration-500 ${activeIndex === i ? 'opacity-100' : 'opacity-0'}`}></div>
                </div>
            ))}
        </div>
    );
};

export const DynamicBlockRenderer: React.FC<DynamicBlockRendererProps> = ({ blocks, onContentChange }) => {
    const isPreviewMode = useStore(state => state.isPreviewMode);
    if (!blocks || blocks.length === 0) return null;

    // Filter out blocks with no meaningful content
    const validBlocks = blocks.filter(block => {
        const hasContent = block.content && (Array.isArray(block.content) ? block.content.length > 0 : !!block.content);
        const hasItems = block.items && block.items.length > 0;
        return hasContent || hasItems;
    });

    if (validBlocks.length === 0) return null;

    const renderContent = (content: string | string[]) => {
        if (Array.isArray(content)) {
            const validItems = content.filter(item => !!item && item.trim() !== '');
            if (validItems.length === 0) return null;
            return (
                <ul className="space-y-4 mt-6">
                    {validItems.map((item, i) => (
                        <li key={i} className="flex gap-4 text-sm text-gray-300 group/li">
                            <span className="text-[#00ff88] mt-1 opacity-50 group-hover/li:opacity-100 transition-opacity">•</span>
                            <div className="flex-1 prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{item}</ReactMarkdown>
                            </div>
                        </li>
                    ))}
                </ul>
            );
        }
        if (!content || (typeof content === 'string' && content.trim() === '')) return null;
        return (
            <div className="mt-6 text-sm text-gray-300 leading-relaxed prose prose-invert prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
        );
    };

    return (
        <div className="space-y-16 py-4">
            {validBlocks.map((block, index) => {
                switch (block.type) {
                    case 'overview':
                        return (
                            <div key={index} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {block.title && <h2 className="text-3xl font-black text-white uppercase tracking-tighter border-l-4 border-[#00ff88] pl-4">{block.title}</h2>}
                                {block.content && renderContent(block.content)}
                            </div>
                        );

                    case 'key_concepts':
                    case 'patterns_relationships':
                        const validConceptItems = block.items?.filter(item => item.heading || item.explanation) || [];
                        if (validConceptItems.length === 0 && !block.title) return null;

                        return (
                            <div key={index} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {block.title && (
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-xl font-bold text-[#00ff88] whitespace-nowrap uppercase tracking-widest">{block.title}</h3>
                                        <div className="h-px w-full bg-gradient-to-r from-[#00ff88]/30 to-transparent"></div>
                                    </div>
                                )}
                                <div className="grid gap-6">
                                    {validConceptItems.map((item, i) => (
                                        <div key={i} className="bg-[#111] p-8 rounded-3xl border border-white/5 hover:border-[#00ff88]/30 transition-all duration-300 group shadow-lg hover:shadow-[#00ff88]/5">
                                            {item.heading && <h4 className="text-base font-bold text-white mb-4 group-hover:text-[#00ff88] transition-colors">{item.heading}</h4>}
                                            {item.explanation && (
                                                <div className="text-sm text-gray-400 leading-relaxed prose prose-invert prose-sm max-w-none">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.explanation}</ReactMarkdown>
                                                </div>
                                            )}
                                            {item.source_pages && item.source_pages.length > 0 && (
                                                <div className="mt-6 flex gap-2">
                                                    {item.source_pages.map((p: number) => (
                                                        <span key={p} className="text-[10px] font-black bg-[#00ff88]/10 text-[#00ff88] px-3 py-1 rounded-full border border-[#00ff88]/20">PAGE {p}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );

                    case 'definitions':
                        const defItems = block.items?.filter(item => item.term || item.description || item.explanation || item.content) || [];
                        if (defItems.length === 0 && !block.title) return null;

                        return (
                            <div key={index} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {block.title && (
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-xl font-bold text-[#00ff88] whitespace-nowrap uppercase tracking-widest">{block.title}</h3>
                                        <div className="h-px w-full bg-gradient-to-r from-[#00ff88]/30 to-transparent"></div>
                                    </div>
                                )}

                                {!isPreviewMode ? (
                                    <TerminologyMatrix items={defItems} />
                                ) : (
                                    <div className="grid gap-4">
                                        {defItems.map((item, i) => (
                                            <div key={i} className="bg-white/[0.03] p-6 rounded-2xl border border-white/5 hover:border-[#00ff88]/20 transition-all duration-300">
                                                {item.term && (
                                                    <div className="text-[#00ff88] text-[11px] font-black uppercase tracking-[0.2em] mb-3">
                                                        {item.term}
                                                    </div>
                                                )}
                                                <div className="text-sm text-gray-300 leading-relaxed prose prose-invert prose-sm max-w-none">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {item.description || item.explanation || item.content || ''}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );

                    case 'steps':
                    case 'examples':
                    case 'key_takeaways':
                    case 'exam_focus':
                    case 'real_world':
                        const regularItems = block.items?.filter(item => item.example || item.step || item.description || item.explanation || item.content) || [];
                        const hasStaticContent = block.content && (Array.isArray(block.content) ? block.content.length > 0 : !!block.content);

                        if (regularItems.length === 0 && !hasStaticContent && !block.title) return null;

                        return (
                            <div key={index} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {block.title && <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em]">{block.title}</h3>}
                                <div className="space-y-4">
                                    {block.items ? (
                                        <div className="grid gap-4">
                                            {regularItems.map((item, i) => (
                                                <div key={i} className="bg-white/[0.03] p-6 rounded-2xl border border-white/5 hover:border-[#00ff88]/20 transition-all duration-300">
                                                    {(item.example || item.step) && (
                                                        <div className="text-[#00ff88] text-[11px] font-black uppercase tracking-[0.2em] mb-3">
                                                            {item.example || item.step}
                                                        </div>
                                                    )}
                                                    <div className="text-sm text-gray-300 leading-relaxed prose prose-invert prose-sm max-w-none">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {item.description || item.explanation || item.content || ''}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        (Array.isArray(block.content) ? block.content : [block.content]).map((text, i) => {
                                            if (!text || text.trim() === '') return null;
                                            return (
                                                <div key={i} className="flex gap-5 p-5 bg-white/[0.02] rounded-2xl border border-white/5 group hover:bg-white/[0.05] transition-all">
                                                    <div className="mt-2 w-1.5 h-1.5 rounded-full bg-[#00ff88]/30 group-hover:bg-[#00ff88] transition-colors flex-shrink-0 shadow-[0_0_8px_rgba(0,255,136,0)] group-hover:shadow-[0_0_8px_rgba(0,255,136,0.5)]"></div>
                                                    <div className="text-sm text-gray-300 leading-relaxed prose prose-invert prose-sm max-w-none flex-1">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        );

                    case 'action_items':
                        const validActions = block.items?.filter(item => item.task) || [];
                        if (validActions.length === 0 && !block.title) return null;

                        return (
                            <div key={index} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {block.title && <h3 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.4em]">{block.title}</h3>}
                                <div className="grid gap-3">
                                    {validActions.map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.status === 'completed' ? 'bg-blue-500' : 'border-2 border-white/20'}`}>
                                                {item.status === 'completed' && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                            </div>
                                            <div className="flex-1 text-sm font-medium text-gray-200">
                                                {item.task.startsWith('@') ? (
                                                    <span className="text-blue-400 font-bold mr-1">{item.task.split(' ')[0]}</span>
                                                ) : null}
                                                {item.task.startsWith('@') ? item.task.substring(item.task.indexOf(' ') + 1) : item.task}
                                            </div>
                                            {item.status && <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-white/5 rounded-md text-gray-500">{item.status}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );

                    case 'milestones':
                        const validMilestones = block.items?.filter(item => item.milestone) || [];
                        if (validMilestones.length === 0 && !block.title) return null;

                        return (
                            <div key={index} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {block.title && <h3 className="text-[11px] font-black text-purple-500 uppercase tracking-[0.4em]">{block.title}</h3>}
                                <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-purple-500/50 before:to-transparent">
                                    {validMilestones.map((item, i) => (
                                        <div key={i} className="relative group">
                                            <div className="absolute -left-8 top-1.5 w-6 h-6 rounded-full bg-[#0a0a0a] border-2 border-purple-500 flex items-center justify-center z-10 group-hover:scale-125 transition-transform shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                                                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                                            </div>
                                            <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/5 group-hover:border-purple-500/30 transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="text-sm font-bold text-white">{item.milestone}</h4>
                                                    {item.date && <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2 py-1 rounded-md">{item.date}</span>}
                                                </div>
                                                {item.description && <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );

                    case 'blockers':
                        let blockerItems: string[] = [];
                        if (Array.isArray(block.content)) {
                            blockerItems = block.content;
                        } else if (typeof block.content === 'string') {
                            blockerItems = [block.content];
                        } else if (block.items) {
                            blockerItems = block.items.map(i => i.content || i.description || i.blocker).filter(b => !!b);
                        }

                        const validBlockers = blockerItems.filter(b => !!b && b.trim() !== '');
                        if (validBlockers.length === 0 && !block.title) return null;

                        return (
                            <div key={index} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {block.title && <h3 className="text-[11px] font-black text-red-500 uppercase tracking-[0.4em]">{block.title}</h3>}
                                <div className="grid gap-4">
                                    {validBlockers.map((text, i) => (
                                        <div key={i} className="flex gap-4 p-5 bg-red-500/5 rounded-2xl border border-red-500/10 group hover:bg-red-500/10 transition-all">
                                            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            </div>
                                            <div className="text-sm font-medium text-gray-200 leading-relaxed py-1">{text}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );

                    case 'formulas':
                        const validFormulas = block.items?.filter(item => item.formula) || [];
                        if (validFormulas.length === 0 && !block.title) return null;

                        return (
                            <div key={index} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {block.title && <h3 className="text-sm font-black text-[#00ff88] uppercase tracking-[0.3em]">{block.title}</h3>}
                                <div className="grid grid-cols-1 gap-6">
                                    {validFormulas.map((item, i) => (
                                        <FormulaBlock key={i} formula={item.formula || ''} label={item.label} />
                                    ))}
                                </div>
                            </div>
                        );

                    case 'code':
                        if (!block.content) return null;
                        return (
                            <div key={index} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {block.title && <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">{block.title}</h3>}
                                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                    <SyntaxHighlighter
                                        language={block.language || 'javascript'}
                                        style={vscDarkPlus}
                                        customStyle={{ margin: 0, padding: '24px', fontSize: '13px', background: '#0a0a0a' }}
                                    >
                                        {(block.content as string) || ''}
                                    </SyntaxHighlighter>
                                </div>
                            </div>
                        );

                    case 'conceptual_tests':
                        const validQuestions = block.items?.filter(item => item.question) || [];
                        if (validQuestions.length === 0 && !block.title) return null;

                        return (
                            <div key={index} className="bg-gradient-to-br from-[#00ff88]/10 via-[#00ff88]/5 to-transparent p-10 rounded-[3rem] border border-[#00ff88]/20 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4">
                                    <span className="w-10 h-10 rounded-2xl bg-[#00ff88] text-black flex items-center justify-center text-sm font-black shadow-lg shadow-[#00ff88]/20">?</span>
                                    {block.title || 'Conceptual Challenge'}
                                </h3>
                                <div className="space-y-8">
                                    {validQuestions.map((item, i) => (
                                        <div key={i} className="space-y-4 group/q">
                                            <div className="text-base font-bold text-gray-100 group-hover/q:text-[#00ff88] transition-colors flex gap-4">
                                                <span className="text-[#00ff88] opacity-50">0{i + 1}</span>
                                                {item.question}
                                            </div>
                                            {item.hint && (
                                                <div className="text-xs text-gray-400 bg-black/40 p-6 rounded-2xl border border-white/5 backdrop-blur-sm ml-10">
                                                    <span className="text-[10px] uppercase font-black tracking-[0.3em] text-[#00ff88] opacity-60 block mb-3">Thinking Catalyst</span>
                                                    <div className="prose prose-invert prose-xs max-w-none">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.hint}</ReactMarkdown>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );

                    case 'revision_summary':
                        const summaryContent = Array.isArray(block.content) ? block.content : (typeof block.content === 'string' ? [block.content] : []);
                        const validPoints = summaryContent.filter(p => !!p && p.trim() !== '') || [];
                        if (validPoints.length === 0 && !block.title) return null;

                        return (
                            <div key={index} className="bg-[#111] p-10 rounded-[2.5rem] border border-[#00ff88]/20 shadow-2xl relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <svg className="w-24 h-24 text-[#00ff88]" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </div>
                                <h3 className="text-[11px] font-black text-[#00ff88] uppercase tracking-[0.4em] mb-10 text-center relative z-10">Lightning Revision Matrix</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 relative z-10">
                                    {validPoints.map((point, i) => (
                                        <div key={i} className="flex gap-4 items-start group/p">
                                            <div className="w-5 h-5 rounded-full bg-[#00ff88]/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/p:bg-[#00ff88]/20 transition-colors">
                                                <svg className="w-3 h-3 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-medium text-gray-200 group-hover/p:text-white transition-colors">{point}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );

                    default:
                        return null;
                }
            })}
        </div>
    );
};
