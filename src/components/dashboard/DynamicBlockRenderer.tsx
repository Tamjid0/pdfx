import React from 'react';
import { AdaptiveBlock } from '../../store/useStore';
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
        <div className="my-4 p-4 bg-white/5 rounded-xl border border-white/10 text-center">
            {label && <div className="text-[10px] font-black uppercase tracking-widest text-[#00ff88] mb-2">{label}</div>}
            <div dangerouslySetInnerHTML={{ __html: html }} className="text-xl text-white" />
        </div>
    );
};

export const DynamicBlockRenderer: React.FC<DynamicBlockRendererProps> = ({ blocks, onContentChange }) => {
    if (!blocks || blocks.length === 0) return null;

    const renderContent = (content: string | string[]) => {
        if (Array.isArray(content)) {
            return (
                <ul className="space-y-2 mt-4">
                    {content.map((item, i) => (
                        <li key={i} className="flex gap-3 text-sm text-gray-300">
                            <span className="text-[#00ff88] mt-1">•</span>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{item}</ReactMarkdown>
                        </li>
                    ))}
                </ul>
            );
        }
        return (
            <div className="mt-4 text-sm text-gray-300 leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
        );
    };

    return (
        <div className="space-y-12">
            {blocks.map((block, index) => {
                switch (block.type) {
                    case 'overview':
                        return (
                            <div key={index} className="space-y-2">
                                {block.title && <h2 className="text-2xl font-black text-white uppercase tracking-tight">{block.title}</h2>}
                                {block.content && renderContent(block.content)}
                            </div>
                        );

                    case 'key_concepts':
                    case 'patterns_relationships':
                        return (
                            <div key={index} className="space-y-6">
                                {block.title && (
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-lg font-bold text-[#00ff88] whitespace-nowrap">{block.title}</h3>
                                        <div className="h-px w-full bg-gradient-to-r from-[#00ff88]/30 to-transparent"></div>
                                    </div>
                                )}
                                <div className="grid gap-6">
                                    {block.items?.map((item, i) => (
                                        <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#00ff88]/30 transition-all group">
                                            {item.heading && <h4 className="text-sm font-black text-white uppercase tracking-widest mb-3 group-hover:text-[#00ff88] transition-colors">{item.heading}</h4>}
                                            {item.explanation && <div className="text-sm text-gray-400 leading-relaxed">{item.explanation}</div>}
                                            {item.source_pages && (
                                                <div className="mt-4 flex gap-2">
                                                    {item.source_pages.map((p: number) => (
                                                        <span key={p} className="text-[9px] font-bold bg-[#00ff88]/10 text-[#00ff88] px-2 py-0.5 rounded-full">PAGE {p}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );

                    case 'definitions':
                    case 'steps':
                    case 'key_takeaways':
                    case 'exam_focus':
                    case 'real_world':
                        return (
                            <div key={index} className="space-y-4">
                                {block.title && <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.3em]">{block.title}</h3>}
                                <div className="space-y-3">
                                    {(Array.isArray(block.content) ? block.content : [block.content]).map((text, i) => (
                                        <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5 group hover:bg-white/[0.07] transition-all">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00ff88]/30 group-hover:bg-[#00ff88] transition-colors flex-shrink-0"></div>
                                            <div className="text-sm text-gray-300 leading-relaxed italic">{text}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );

                    case 'formulas':
                        return (
                            <div key={index} className="space-y-4">
                                {block.title && <h3 className="text-sm font-black text-[#00ff88] uppercase tracking-[0.3em]">{block.title}</h3>}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {block.items?.map((item, i) => (
                                        <FormulaBlock key={i} formula={item.formula} label={item.label} />
                                    ))}
                                </div>
                            </div>
                        );

                    case 'code':
                        return (
                            <div key={index} className="space-y-3">
                                {block.title && <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{block.title}</h3>}
                                <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                                    <SyntaxHighlighter
                                        language={block.language || 'javascript'}
                                        style={vscDarkPlus}
                                        customStyle={{ margin: 0, padding: '20px', fontSize: '13px' }}
                                    >
                                        {block.content as string}
                                    </SyntaxHighlighter>
                                </div>
                            </div>
                        );

                    case 'conceptual_tests':
                        return (
                            <div key={index} className="bg-gradient-to-br from-[#00ff88]/10 to-transparent p-8 rounded-[2.5rem] border border-[#00ff88]/20">
                                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-[#00ff88] text-black flex items-center justify-center text-xs">?</span>
                                    {block.title || 'Conceptual Challenge'}
                                </h3>
                                <div className="space-y-6">
                                    {block.items?.map((item, i) => (
                                        <div key={i} className="space-y-3">
                                            <div className="text-sm font-bold text-[#00ff88]">Question {i + 1}: {item.question}</div>
                                            <div className="text-xs text-gray-400 bg-black/30 p-4 rounded-xl border border-white/5">
                                                <span className="text-[10px] uppercase font-black tracking-widest opacity-40 block mb-2">Think about:</span>
                                                {item.hint}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );

                    case 'revision_summary':
                        return (
                            <div key={index} className="bg-[#111] p-8 rounded-3xl border-2 border-[#00ff88]/20 shadow-[0_20px_50px_rgba(0,0,136,0.1)]">
                                <h3 className="text-xs font-black text-[#00ff88] uppercase tracking-[0.4em] mb-6 text-center">Lightning Revision</h3>
                                <div className="columns-1 md:columns-2 gap-8">
                                    {(block.content as string[])?.map((point, i) => (
                                        <div key={i} className="mb-4 break-inside-avoid flex gap-3 items-start">
                                            <svg className="w-4 h-4 text-[#00ff88] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm font-medium text-white/90">{point}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );

                    default:
                        return (
                            <div key={index} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <div className="text-xs font-bold text-red-500 uppercase mb-2">Unknown Block Type: {block.type}</div>
                                <pre className="text-[10px] text-gray-500">{JSON.stringify(block, null, 2)}</pre>
                            </div>
                        );
                }
            })}
        </div>
    );
};
