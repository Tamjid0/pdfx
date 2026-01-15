import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { parseCitations } from '../utils/citationParser';

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
        textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    };

    useEffect(() => {
        if (textareaRef.current) {
            autoResize(textareaRef.current);
        }
    }, [inputValue]);

    return (
        <div className="chat-container flex flex-col h-full w-full">
            <div className="chat-messages-area flex-1 overflow-y-auto p-6 flex flex-col gap-5">
                {history.length === 0 ? (
                    <div className="chat-empty-state flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="chat-empty-icon w-20 h-20 bg-gradient-to-br from-[rgba(0,255,136,0.2)] to-[rgba(0,255,136,0.05)] rounded-2xl flex items-center justify-center mb-5">
                            <svg viewBox="0 0 24 24" className="w-10 h-10 fill-[#00ff88]"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z" /></svg>
                        </div>
                        <h2 className="chat-empty-title text-2xl font-semibold text-white mb-2.5">Chat with Your Document</h2>
                        <p className="chat-empty-subtitle text-sm text-[#666] mb-6 max-w-sm">Ask me anything about your document. I can summarize, explain concepts, or answer specific questions.</p>
                        <div className="chat-starter-grid grid grid-cols-2 gap-2.5 max-w-md w-full">
                            <div className="chat-starter-card bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-left cursor-pointer transition-all hover:bg-[rgba(0,255,136,0.05)] hover:border-[#00ff88] hover:translate-y-[-2px]" onClick={() => onSendMessage('What are the main topics covered in this document?')}>
                                <div className="chat-starter-icon w-7 h-7 bg-[rgba(0,255,136,0.1)] rounded-md flex items-center justify-center mb-2">
                                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#00ff88]"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" /></svg>
                                </div>
                                <div className="chat-starter-text text-sm text-[#ccc] leading-tight">What are the main topics covered?</div>
                            </div>
                            <div className="chat-starter-card bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-left cursor-pointer transition-all hover:bg-[rgba(0,255,136,0.05)] hover:border-[#00ff88] hover:translate-y-[-2px]" onClick={() => onSendMessage('Can you summarize this in simple terms?')}>
                                <div className="chat-starter-icon w-7 h-7 bg-[rgba(0,255,136,0.1)] rounded-md flex items-center justify-center mb-2">
                                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#00ff88]"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                                </div>
                                <div className="chat-starter-text text-sm text-[#ccc] leading-tight">Summarize this document</div>
                            </div>
                            <div className="chat-starter-card bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-left cursor-pointer transition-all hover:bg-[rgba(0,255,136,0.05)] hover:border-[#00ff88] hover:translate-y-[-2px]" onClick={() => onSendMessage('What are the key takeaways?')}>
                                <div className="chat-starter-icon w-7 h-7 bg-[rgba(0,255,136,0.1)] rounded-md flex items-center justify-center mb-2">
                                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#00ff88]"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                </div>
                                <div className="chat-starter-text text-sm text-[#ccc] leading-tight">What are the key takeaways?</div>
                            </div>
                            <div className="chat-starter-card bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-left cursor-pointer transition-all hover:bg-[rgba(0,255,136,0.05)] hover:border-[#00ff88] hover:translate-y-[-2px]" onClick={() => onSendMessage('Explain machine learning to a beginner')}>
                                <div className="chat-starter-icon w-7 h-7 bg-[rgba(0,255,136,0.1)] rounded-md flex items-center justify-center mb-2">
                                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#00ff88]"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                                </div>
                                <div className="chat-starter-text text-sm text-[#ccc] leading-tight">Explain concepts simply</div>
                            </div>
                        </div>
                    </div>
                ) : (


                    // ... inside Chat component

                    history.map((msg, index) => (
                        <div key={index} className={`chat-message flex gap-3 max-w-[95%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                            <div className={`chat-message-avatar w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-sm ${msg.sender === 'user' ? 'bg-gradient-to-br from-[#00ff88] to-[#00cc66] text-black' : 'bg-[#1a1a1a] border-2 border-[#333]'}`}>
                                {msg.sender === 'user' ? 'JD' : <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#00ff88]"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>}
                            </div>
                            <div className="chat-message-content max-w-full overflow-hidden">
                                <div className={`chat-message-bubble p-3 px-4 text-sm leading-relaxed rounded-2xl w-fit max-w-full ${msg.sender === 'user' ? 'bg-[#00ff88] text-black rounded-br-lg ml-auto' : 'bg-[#1a1a1a] text-[#ddd] border border-[#333] rounded-bl-lg'}`}>
                                    {msg.sender === 'ai' ? (
                                        <div className="markdown-content prose prose-invert prose-emerald prose-sm max-w-none">
                                            {/* Render parsed content: markdown + citations */}
                                            {parseCitations(msg.text).map((part, i) =>
                                                part.type === 'citation' ? (
                                                    <button
                                                        key={i}
                                                        onClick={() => onCitationClick?.(part.page, part.quotedText)}
                                                        className="inline-flex items-center gap-1.5 mx-1 px-2 py-0.5 rounded-full bg-[#00ff88]/10 text-[#00ff88] text-xs font-bold border border-[#00ff88]/20 hover:bg-[#00ff88]/20 hover:scale-105 transition-all cursor-pointer select-none align-middle max-w-xs"
                                                        title={part.quotedText ? `Find "${part.quotedText}" on page ${part.page}` : `Jump to Page ${part.page}`}
                                                    >
                                                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                                        {part.quotedText ? (
                                                            <span className="truncate italic">"{part.quotedText.length > 40 ? part.quotedText.substring(0, 40) + '...' : part.quotedText}" <span className="opacity-70 font-normal">[Pg {part.page}]</span></span>
                                                        ) : (
                                                            <span>Page {part.page}</span>
                                                        )}
                                                    </button>
                                                ) : (
                                                    <ReactMarkdown
                                                        key={i}
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            p: ({ children }) => <span className="inline">{children}</span>, // Inline to flow with buttons
                                                            // ... other components
                                                        }}
                                                    >
                                                        {part.content}
                                                    </ReactMarkdown>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <span className="whitespace-pre-wrap">{msg.text}</span>
                                    )}
                                </div>
                                <div className={`chat-message-time text-xs text-[#666] mt-1 px-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>{msg.timestamp}</div>
                            </div>
                        </div>
                    ))
                )}
                {isTyping && (
                    <div className="chat-message flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="chat-message-avatar w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center bg-[#1a1a1a] border-2 border-[#333]">
                            <div className="relative flex items-center justify-center w-full h-full">
                                <div className="absolute w-full h-full bg-[#00ff88] rounded-full opacity-20 animate-ping duration-[2000ms]"></div>
                                <div className="absolute w-3/4 h-3/4 bg-[#00ff88] rounded-full opacity-40 animate-ping duration-[1500ms]"></div>
                                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#00ff88] z-10"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>
                            </div>
                        </div>
                        <div className="chat-message-content max-w-full">
                            <div className="chat-message-bubble p-3 px-4 text-sm leading-relaxed rounded-2xl bg-[#1a1a1a] text-[#aaa] border border-[#333] rounded-bl-lg w-fit">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1 items-center py-1">
                                        <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,136,0.5)]"></div>
                                        <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-pulse [animation-delay:200ms] shadow-[0_0_8px_rgba(0,255,136,0.3)]"></div>
                                    </div>
                                    <span className="text-xs font-medium tracking-wide animate-pulse uppercase">AI is thinking</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area p-4 pt-3 bg-[#0f0f0f] border-t border-[#222]">
                <div className="chat-input-wrapper bg-[#1a1a1a] border-2 border-[#333] rounded-xl flex items-end p-2.5 transition-all gap-2.5 focus-within:border-[#00ff88]">
                    <textarea
                        ref={textareaRef}
                        className="chat-textarea flex-1 bg-transparent border-none text-white text-sm resize-none outline-none max-h-24 overflow-y-auto leading-normal"
                        placeholder="Ask anything about your document..."
                        rows={1}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onInput={(e) => autoResize(e.currentTarget)}
                    />
                    <button className="chat-send-btn w-8 h-8 bg-gradient-to-br from-[#00ff88] to-[#00cc66] border-none rounded-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none" onClick={handleSend} disabled={!inputValue.trim()}>
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-black"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};


export default Chat;
