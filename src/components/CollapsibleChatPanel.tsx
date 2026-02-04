import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useStore } from '../store/useStore';

interface CollapsibleChatPanelProps {
    itemId: string;
    itemType: 'quiz' | 'flashcard';
    itemData: any;
    onClose: () => void;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

const CollapsibleChatPanel: React.FC<CollapsibleChatPanelProps> = ({
    itemId,
    itemType,
    itemData,
    onClose
}) => {
    const { fileId, setActiveNodeIds, setCurrentSlideIndex } = useStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    // Load chat history from sessionStorage
    useEffect(() => {
        const storageKey = `chat_${itemType}_${itemId}`;
        const saved = sessionStorage.getItem(storageKey);
        if (saved) {
            try {
                setMessages(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load chat history:', e);
            }
        }
    }, [itemId, itemType]);

    // Save chat history to sessionStorage
    useEffect(() => {
        if (messages.length > 0) {
            const storageKey = `chat_${itemType}_${itemId}`;
            sessionStorage.setItem(storageKey, JSON.stringify(messages));
        }
    }, [messages, itemId, itemType]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/v1/chat/item-context', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileId,
                    itemType,
                    itemData,
                    message: input,
                    chatHistory: messages
                })
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.text,
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Handle citations/node highlighting
            if (data.nodeIds && data.nodeIds.length > 0) {
                setActiveNodeIds(data.nodeIds);
                if (data.pageIndex !== undefined) {
                    setCurrentSlideIndex(data.pageIndex);
                }
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (isMinimized) {
        return (
            <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
                <button
                    onClick={() => setIsMinimized(false)}
                    className="flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] border border-[#00ff88]/30 rounded-2xl shadow-2xl hover:bg-[#222] transition-all group"
                >
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></div>
                    <span className="text-xs font-black text-white uppercase tracking-widest">
                        {itemType === 'quiz' ? 'Quiz' : 'Flashcard'} Chat
                    </span>
                    <div className="px-2 py-0.5 bg-[#00ff88]/20 rounded-full text-[10px] font-black text-[#00ff88]">
                        {messages.length}
                    </div>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-[#0a0a0a] border-l border-[#222] shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b border-[#222] bg-[#111] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">
                            {itemType === 'quiz' ? 'Quiz' : 'Flashcard'} Discussion
                        </h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                            Item #{itemId.slice(0, 6)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        title="Minimize"
                    >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
                        title="Close"
                    >
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Item Context Display */}
            <div className="p-4 bg-white/[0.02] border-b border-[#222]">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                    {itemType === 'quiz' ? 'Question' : 'Flashcard'}
                </div>
                <div className="p-3 bg-[#111] rounded-xl border border-white/5">
                    <p className="text-xs text-white font-medium line-clamp-3">
                        {itemType === 'quiz' ? itemData.question : itemData.question}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <p className="text-xs text-gray-500 max-w-xs">
                            Ask questions about this {itemType} to get detailed explanations from the document.
                        </p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[90%] rounded-2xl p-3 ${msg.role === 'user'
                                ? 'bg-[#00ff88]/10 border border-[#00ff88]/20 text-white'
                                : 'bg-white/5 border border-white/10 text-gray-300'
                                }`}
                        >
                            <div className="prose prose-invert prose-xs max-w-none text-[12px] leading-relaxed">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#222] bg-[#111]">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask a question..."
                        className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:border-[#00ff88]/50 outline-none transition-all"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="px-4 py-3 bg-[#00ff88] text-black rounded-xl hover:bg-[#00dd77] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
                <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-wider">
                    Press Enter to send • Shift+Enter for new line
                </p>
            </div>
        </div>
    );
};

export default CollapsibleChatPanel;
