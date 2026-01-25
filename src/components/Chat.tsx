import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { triggerBrowserSearch } from '../utils/citationParser';

import { useStore } from '../store/useStore';

interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
}

interface ChatProps {
    history: ChatMessage[];
    onSendMessage: (message: string) => void;
    isTyping?: boolean;
}

const Chat: React.FC<ChatProps> = ({ history, onSendMessage, isTyping }) => {
    const {
    } = useStore();
    const [inputValue, setInputValue] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
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

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    const useSuggestion = (text: string) => {
        onSendMessage(text);
    };

    return (
        <div className="chat-container flex flex-col h-full w-full bg-[#0f0f0f] text-[#e5e5e5]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#1a1a1a] border-b border-[#2f2f2f] sticky top-0 z-20">
                <h1 className="text-xl font-bold bg-gradient-to-r from-gemini-green to-teal-400 bg-clip-text text-transparent uppercase tracking-wider">AI Assistant</h1>
            </div>

            <div className="main-content flex-1 flex flex-col overflow-hidden relative">
                <div className="messages-container flex-1 overflow-y-auto px-6 py-8 custom-scrollbar scroll-smooth">
                    <div className="messages max-w-3xl mx-auto w-full">
                        {history.length === 0 ? (
                            <div className="welcome-section flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
                                <div className="welcome-text text-center mb-12">
                                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gemini-green to-teal-400 bg-clip-text text-transparent mb-3">Chat with your documents</h2>
                                    <p className="text-[#9ca3af] text-base">Upload a document and ask questions about it</p>
                                </div>
                                <div className="suggestion-cards grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                    {[
                                        { title: 'Summarize document', desc: 'Get a concise summary of the key points', prompt: 'Summarize this document' },
                                        { title: 'Extract key info', desc: 'Pull out important data and facts', prompt: 'Extract key information from this document' },
                                        { title: 'Main topics', desc: 'Identify the core themes and subjects', prompt: 'What are the main topics discussed?' },
                                        { title: 'Ask questions', desc: 'Get specific answers from your document', prompt: 'Answer questions about this document' }
                                    ].map((s, i) => (
                                        <div
                                            key={i}
                                            onClick={() => useSuggestion(s.prompt)}
                                            className="suggestion-card bg-[#2f2f2f] border border-[#3f3f3f] rounded-xl p-5 cursor-pointer hover:bg-[#333333] hover:border-[#4f4f4f] hover:-translate-y-0.5 transition-all group"
                                        >
                                            <h3 className="text-sm font-bold text-[#e5e5e5] mb-2 group-hover:text-gemini-green transition-colors">{s.title}</h3>
                                            <p className="text-xs text-[#9ca3af] leading-relaxed">{s.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col space-y-8">
                                {history.map((msg, index) => (
                                    <div key={index} className={`message flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                        <div className={`max-w-[85%] ${msg.sender === 'user' ? 'user' : 'assistant-message w-full'}`}>
                                            <div className={`message-content leading-relaxed ${msg.sender === 'user'
                                                ? 'bg-[#2f2f2f] px-5 py-3 rounded-2xl text-white'
                                                : 'text-[#d1d1d1]'
                                                }`}>
                                                {msg.sender === 'ai' ? (
                                                    <div className="prose prose-invert prose-sm max-w-none">
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm]}
                                                            components={{
                                                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                                h2: ({ children }) => <h2 className="text-xl font-bold mt-6 mb-3 text-white">{children}</h2>,
                                                                h3: ({ children }) => <h3 className="text-lg font-bold mt-4 mb-2 text-white/90">{children}</h3>,
                                                                ul: ({ children }) => <ul className="list-disc pl-4 mb-4">{children}</ul>,
                                                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                                                a: ({ href, children }) => <a href={href} className="text-gemini-green underline" target="_blank" rel="noreferrer">{children}</a>,
                                                                code: ({ node, inline, className, children, ...props }: any) => {
                                                                    const match = /language-(\w+)/.exec(className || '');
                                                                    return !inline && match ? (
                                                                        <SyntaxHighlighter
                                                                            style={vscDarkPlus as any}
                                                                            language={match[1]}
                                                                            PreTag="div"
                                                                            className="rounded-lg !bg-[#0f0f0f] !p-4 border border-[#2f2f2f] my-4"
                                                                            {...props}
                                                                        >
                                                                            {String(children).replace(/\n$/, '')}
                                                                        </SyntaxHighlighter>
                                                                    ) : (
                                                                        <code className="bg-white/10 rounded px-1.5 py-0.5 font-mono text-sm" {...props}>
                                                                            {children}
                                                                        </code>
                                                                    )
                                                                }
                                                            }}
                                                        >
                                                            {msg.text}
                                                        </ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    <span className="whitespace-pre-wrap">{msg.text}</span>
                                                )}
                                            </div>

                                            {msg.sender === 'ai' && (
                                                <div className="message-actions flex items-center gap-2 mt-3 opacity-60 hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleCopy(msg.text, `copy-${index}`)}
                                                        className={`action-btn flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-[#3f3f3f] rounded-lg text-xs text-[#9ca3af] hover:bg-[#2f2f2f] hover:text-white transition-all ${copiedId === `copy-${index}` ? 'text-gemini-green border-gemini-green' : ''}`}
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                                        {copiedId === `copy-${index}` ? 'Copied' : 'Copy'}
                                                    </button>
                                                    <button className="action-btn flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-[#3f3f3f] rounded-lg text-xs text-[#9ca3af] hover:bg-[#2f2f2f] hover:text-white transition-all">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                                        Regenerate
                                                    </button>
                                                    <button className="action-btn p-1.5 bg-transparent border border-[#3f3f3f] rounded-lg text-[#9ca3af] hover:bg-[#2f2f2f] hover:text-white transition-all">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>
                                                    </button>
                                                    <button className="action-btn p-1.5 bg-transparent border border-[#3f3f3f] rounded-lg text-[#9ca3af] hover:bg-[#2f2f2f] hover:text-white transition-all">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"></path></svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} className="h-4" />
                            </div>
                        )}

                        {isTyping && (
                            <div className="typing-indicator flex items-center space-x-2 py-4 animate-in fade-in duration-300">
                                <div className="typing-dots flex gap-1.5 px-3 py-2 bg-white/[0.03] rounded-full border border-white/5">
                                    <span className="dot w-1.5 h-1.5 bg-gemini-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="dot w-1.5 h-1.5 bg-gemini-green rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                                    <span className="dot w-1.5 h-1.5 bg-gemini-green rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="input-container bg-transparent border-t border-[#2f2f2f] p-4">
                    <div className="input-wrapper max-w-3xl mx-auto">
                        <div className="input-box bg-[#1a1a1a] border border-[#3f3f3f] rounded-[24px] p-2 pl-6 flex items-end gap-3 transition-all focus-within:border-[#4f4f4f] focus-within:ring-4 focus-within:ring-[#4f4f4f]/10">
                            <textarea
                                ref={textareaRef}
                                className="flex-1 bg-[#1a1a1a] border-none text-[15px] text-[#e5e5e5] placeholder-[#6b7280] outline-none py-1 resize-none max-h-48 min-h-[24px] leading-relaxed"
                                placeholder="Ask about your document..."
                                rows={1}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button
                                className="send-button w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-gemini-green to-teal-500 hover:from-gemini-green/90 hover:to-teal-500/90 transition-all flex items-center justify-center text-black disabled:bg-[#3f3f3f] disabled:from-[#3f3f3f] disabled:to-[#3f3f3f] disabled:text-[#6b7280] shadow-lg shadow-gemini-green/10"
                                onClick={handleSend}
                                disabled={!inputValue.trim()}
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            </button>
                        </div>
                        <p className="footer-text text-center text-[11px] text-[#6b7280] mt-4 tracking-wide font-medium">AI can make mistakes. Consider checking important information.</p>
                    </div>
                </div>
            </div>

            {copiedId && (
                <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-[#2f2f2f] border border-[#3f3f3f] px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-2xl shadow-black animate-in fade-in slide-in-from-bottom-2 duration-300">
                    Copied to clipboard
                </div>
            )}
        </div>
    );
};

export default Chat;