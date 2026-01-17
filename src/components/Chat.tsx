import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { parseMessageParts, triggerBrowserSearch, linkifyCitations } from '../utils/citationParser'; // Updated imports

import { useStore } from '../store/useStore';

interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
}

interface ChatProps {
    history: ChatMessage[];
    onSendMessage: (message: string) => void;
    onCitationClick?: (pageIndex: number, searchText?: string | null) => void;
    isTyping?: boolean;
}

const Chat: React.FC<ChatProps> = ({ history, onSendMessage, onCitationClick, isTyping }) => {
    const {
        citationMode,
        setCitationMode
    } = useStore();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history, isTyping]);

    const handleSend = () => {
        if (inputValue.trim()) {
            onSendMessage(inputValue.trim());
            setInputValue('');
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    const autoResize = (textarea: HTMLTextAreaElement) => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    };

    useEffect(() => {
        if (textareaRef.current) {
            autoResize(textareaRef.current);
        }
    }, [inputValue]);

    return (
        <div className="chat-container flex flex-col h-full w-full bg-[#0a0a0a] text-[#e0e0e0]">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-3 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-20">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#00ff88]/10 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#00ff88]"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em]">Research Assistant</h3>
                            <p className="text-[10px] text-[#666] font-medium uppercase tracking-wider">AI Insight Engine</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setCitationMode(!citationMode)}
                    className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${citationMode
                        ? 'bg-[#00ff88]/5 text-[#00ff88] border-[#00ff88]/20 hover:bg-[#00ff88]/10'
                        : 'bg-white/5 text-[#666] border-white/10 hover:border-white/20'
                        }`}
                >
                    <div className={`w-1.5 h-1.5 rounded-full transition-all ${citationMode ? 'bg-[#00ff88] animate-pulse shadow-[0_0_8px_rgba(0,255,136,0.6)]' : 'bg-[#444]'}`}></div>
                    CITATIONS: {citationMode ? 'ON' : 'OFF'}
                </button>
            </div>

            <div className="chat-messages-area flex-1 overflow-y-auto relative pb-32">
                {history.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto p-8 pt-20">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#00ff88]/20 to-transparent rounded-2xl flex items-center justify-center mb-8 border border-[#00ff88]/10">
                            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-[#00ff88]"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">How can I help today?</h2>
                        <p className="text-[#666] text-center mb-12 text-lg font-medium leading-relaxed">
                            I can analyze documents, extract key insights, and answer specialized questions with high-precision citations.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {history.map((msg, index) => (
                            <div
                                key={index}
                                className={`group py-12 px-8 border-b border-white/[0.03] transition-colors ${msg.sender === 'ai' ? 'bg-white/[0.02]/5' : ''}`}
                            >
                                <div className="max-w-3xl mx-auto flex gap-8">
                                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-xs tracking-tighter shadow-xl transform transition-transform group-hover:scale-110 ${msg.sender === 'user'
                                        ? 'bg-gradient-to-br from-[#00ff88] to-[#00cc66] text-black ring-4 ring-[#00ff88]/10'
                                        : 'bg-[#1a1a1a] border border-white/10 text-[#00ff88] ring-4 ring-white/5'
                                        }`}>
                                        {msg.sender === 'user' ? 'JD' : (
                                            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 pt-1">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#444]">
                                                {msg.sender === 'user' ? 'Research Request' : 'Analysis Output'}
                                            </span>
                                            <span className="text-[10px] font-bold text-[#333] tracking-wider">{msg.timestamp}</span>
                                        </div>

                                        <div className="text-[15px] leading-[1.8] font-medium text-[#ccc]">
                                            {msg.sender === 'ai' ? (
                                                <div className="markdown-content flex flex-col gap-4">
                                                    {parseMessageParts(msg.text).map((part, i) => {
                                                        const linkifiedContent = linkifyCitations(part.content || '');
                                                        if (!linkifiedContent) return null;

                                                        return (
                                                            <div key={i} className={part.type === 'block' ? `ai-block-integrated ai-block-${part.blockType}` : ''}>
                                                                <ReactMarkdown
                                                                    remarkPlugins={[remarkGfm]}
                                                                    components={{
                                                                        p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed text-[#bbb]">{children}</p>,
                                                                        h2: ({ children }) => <h2 className="text-xl font-bold mt-8 mb-4 border-l-2 border-[#00ff88]/30 pl-4 text-white tracking-tight">{children}</h2>,
                                                                        h3: ({ children }) => <h3 className="text-lg font-bold mt-6 mb-3 text-white/90">{children}</h3>,
                                                                        table: ({ children }) => <div className="my-6 overflow-hidden rounded-xl border border-white/5 bg-[#050505] shadow-2xl"><table className="w-full text-left border-collapse">{children}</table></div>,
                                                                        th: ({ children }) => <th className="px-5 py-4 bg-white/[0.02] text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 border-b border-white/5">{children}</th>,
                                                                        td: ({ children }) => <td className="px-5 py-4 text-sm border-b border-white/[0.02] text-[#aaa]">{children}</td>,
                                                                        ul: ({ children }) => <ul className="space-y-4 list-none mb-6">{children}</ul>,
                                                                        li: ({ children }) => <li className="flex gap-3 text-[#aaa] before:content-['•'] before:text-white/20">{children}</li>,
                                                                        a: ({ href, children }) => {
                                                                            if (href?.startsWith('cite:')) {
                                                                                const page = parseInt(href.split(':')[1], 10);
                                                                                return (
                                                                                    <span
                                                                                        onClick={() => onCitationClick?.(page, String(children))}
                                                                                        className="cursor-pointer text-[#00ff88]/80 font-semibold hover:text-[#00ff88] transition-colors inline-flex items-center gap-0.5 group/cite"
                                                                                        title={`Context from Page ${page}`}
                                                                                    >
                                                                                        <span className="underline decoration-[#00ff88]/10 underline-offset-4 group-hover/cite:decoration-[#00ff88]/40">{children}</span>
                                                                                        <sup className="text-[9px] opacity-30">[{page}]</sup>
                                                                                    </span>
                                                                                );
                                                                            }
                                                                            return <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#00ff88]/90 hover:underline underline-offset-4 decoration-[#00ff88]/20">{children}</a>
                                                                        },
                                                                        code: ({ node, inline, className, children, ...props }: any) => {
                                                                            const match = /language-(\w+)/.exec(className || '');
                                                                            return !inline && match ? (
                                                                                <SyntaxHighlighter
                                                                                    style={vscDarkPlus as any}
                                                                                    language={match[1]}
                                                                                    PreTag="div"
                                                                                    className="rounded-xl !bg-[#050505] !p-6 border border-white/5 my-6 shadow-2xl"
                                                                                    {...props}
                                                                                >
                                                                                    {String(children).replace(/\n$/, '')}
                                                                                </SyntaxHighlighter>
                                                                            ) : (
                                                                                <code className="bg-white/5 px-1.5 py-0.5 rounded text-white/90 font-mono text-sm border border-white/5" {...props}>
                                                                                    {children}
                                                                                </code>
                                                                            )
                                                                        }
                                                                    }}
                                                                >
                                                                    {linkifiedContent}
                                                                </ReactMarkdown>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <span className="whitespace-pre-wrap text-white text-lg tracking-tight font-semibold">{msg.text}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isTyping && (
                    <div className="py-12 px-8 bg-white/[0.01]">
                        <div className="max-w-3xl mx-auto flex gap-8">
                            <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <div className="pt-2">
                                <div className="flex gap-1 items-center px-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00ff88] animate-pulse">Processing Insights...</span>
                                </div>
                                <div className="h-4 w-48 bg-white/5 rounded-full mt-4 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Premium Floating Input */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent pointer-events-none">
                <div className="max-w-3xl mx-auto pointer-events-auto">
                    <div className="group bg-[#111] border border-white/10 rounded-2xl flex flex-col p-2 transition-all shadow-2xl shadow-black focus-within:border-[#00ff88]/50 focus-within:ring-4 focus-within:ring-[#00ff88]/5">
                        <textarea
                            ref={textareaRef}
                            className="w-full bg-transparent border-none text-[#fff] text-base resize-none outline-none px-4 py-3 min-h-[50px] max-h-48 leading-relaxed placeholder:text-[#444] font-medium"
                            placeholder="Message Research Assistant..."
                            rows={1}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <div className="flex items-center justify-between px-2 pb-2">
                            <div className="flex items-center gap-2 px-2">
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md text-[9px] font-black text-[#666] uppercase tracking-widest border border-white/5">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    Encrypted
                                </div>
                                <div className="text-[9px] font-bold text-[#333] uppercase">Shift + Enter for newline</div>
                            </div>
                            <button
                                className="w-10 h-10 bg-[#00ff88] rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:grayscale disabled:opacity-20 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(0,255,136,0.3)]"
                                onClick={handleSend}
                                disabled={!inputValue.trim()}
                            >
                                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-black"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Chat;
