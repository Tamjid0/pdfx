'use client';
const _jsxFileName = "j:\\antigravity\\pdfx\\src\\components\\Chat.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';












const Chat = ({ history, onSendMessage }) => {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const scrollToBottom = () => {
        _optionalChain([messagesEndRef, 'access', _ => _.current, 'optionalAccess', _2 => _2.scrollIntoView, 'call', _3 => _3({ behavior: "smooth" })]);
    };

    useEffect(() => {
        scrollToBottom();
    }, [history]);

    const handleSend = () => {
        if (inputValue.trim()) {
            onSendMessage(inputValue.trim());
            setInputValue('');
        }
    };
    
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    const autoResize = (textarea) => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    };

    useEffect(() => {
        if (textareaRef.current) {
            autoResize(textareaRef.current);
        }
    }, [inputValue]);


    return (
        React.createElement('div', { className: "chat-container flex flex-col h-full w-full"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 55}}
            , React.createElement('div', { className: "chat-messages-area flex-1 overflow-y-auto p-6 flex flex-col gap-5"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 56}}
                , history.length === 0 ? (
                     React.createElement('div', { className: "chat-empty-state flex-1 flex flex-col items-center justify-center text-center p-8"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 58}}
                        , React.createElement('div', { className: "chat-empty-icon w-20 h-20 bg-gradient-to-br from-[rgba(0,255,136,0.2)] to-[rgba(0,255,136,0.05)] rounded-2xl flex items-center justify-center mb-5"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 59}}
                            , React.createElement('svg', { viewBox: "0 0 24 24"   , className: "w-10 h-10 fill-[#00ff88]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 60}}, React.createElement('path', { d: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 60}}))
                        )
                        , React.createElement('h2', { className: "chat-empty-title text-2xl font-semibold text-white mb-2.5"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 62}}, "Chat with Your Document"   )
                        , React.createElement('p', { className: "chat-empty-subtitle text-sm text-[#666] mb-6 max-w-sm"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 63}}, "Ask me anything about your document. I can summarize, explain concepts, or answer specific questions."              )
                        , React.createElement('div', { className: "chat-starter-grid grid grid-cols-2 gap-2.5 max-w-md w-full"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 64}}
                            , React.createElement('div', { className: "chat-starter-card bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-left cursor-pointer transition-all hover:bg-[rgba(0,255,136,0.05)] hover:border-[#00ff88] hover:translate-y-[-2px]"           , onClick: () => onSendMessage('What are the main topics covered in this document?'), __self: this, __source: {fileName: _jsxFileName, lineNumber: 65}}
                                , React.createElement('div', { className: "chat-starter-icon w-7 h-7 bg-[rgba(0,255,136,0.1)] rounded-md flex items-center justify-center mb-2"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 66}}
                                    , React.createElement('svg', { viewBox: "0 0 24 24"   , className: "w-4 h-4 fill-[#00ff88]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 67}}, React.createElement('path', { d: "M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 67}}))
                                )
                                , React.createElement('div', { className: "chat-starter-text text-sm text-[#ccc] leading-tight"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 69}}, "What are the main topics covered?"     )
                            )
                            , React.createElement('div', { className: "chat-starter-card bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-left cursor-pointer transition-all hover:bg-[rgba(0,255,136,0.05)] hover:border-[#00ff88] hover:translate-y-[-2px]"           , onClick: () => onSendMessage('Can you summarize this in simple terms?'), __self: this, __source: {fileName: _jsxFileName, lineNumber: 71}}
                                , React.createElement('div', { className: "chat-starter-icon w-7 h-7 bg-[rgba(0,255,136,0.1)] rounded-md flex items-center justify-center mb-2"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 72}}
                                    , React.createElement('svg', { viewBox: "0 0 24 24"   , className: "w-4 h-4 fill-[#00ff88]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 73}}, React.createElement('path', { d: "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"             , __self: this, __source: {fileName: _jsxFileName, lineNumber: 73}}))
                                )
                                , React.createElement('div', { className: "chat-starter-text text-sm text-[#ccc] leading-tight"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 75}}, "Summarize this document"  )
                            )
                            , React.createElement('div', { className: "chat-starter-card bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-left cursor-pointer transition-all hover:bg-[rgba(0,255,136,0.05)] hover:border-[#00ff88] hover:translate-y-[-2px]"           , onClick: () => onSendMessage('What are the key takeaways?'), __self: this, __source: {fileName: _jsxFileName, lineNumber: 77}}
                                , React.createElement('div', { className: "chat-starter-icon w-7 h-7 bg-[rgba(0,255,136,0.1)] rounded-md flex items-center justify-center mb-2"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 78}}
                                    , React.createElement('svg', { viewBox: "0 0 24 24"   , className: "w-4 h-4 fill-[#00ff88]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 79}}, React.createElement('path', { d: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 79}}))
                                )
                                , React.createElement('div', { className: "chat-starter-text text-sm text-[#ccc] leading-tight"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 81}}, "What are the key takeaways?"    )
                            )
                            , React.createElement('div', { className: "chat-starter-card bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-left cursor-pointer transition-all hover:bg-[rgba(0,255,136,0.05)] hover:border-[#00ff88] hover:translate-y-[-2px]"           , onClick: () => onSendMessage('Explain machine learning to a beginner'), __self: this, __source: {fileName: _jsxFileName, lineNumber: 83}}
                                , React.createElement('div', { className: "chat-starter-icon w-7 h-7 bg-[rgba(0,255,136,0.1)] rounded-md flex items-center justify-center mb-2"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 84}}
                                    , React.createElement('svg', { viewBox: "0 0 24 24"   , className: "w-4 h-4 fill-[#00ff88]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 85}}, React.createElement('path', { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"               , __self: this, __source: {fileName: _jsxFileName, lineNumber: 85}}))
                                )
                                , React.createElement('div', { className: "chat-starter-text text-sm text-[#ccc] leading-tight"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 87}}, "Explain concepts simply"  )
                            )
                        )
                    )
                ) : (
                    history.map((msg, index) => (
                        React.createElement('div', { key: index, className: `chat-message flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 93}}
                            , React.createElement('div', { className: `chat-message-avatar w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-sm ${msg.sender === 'user' ? 'bg-gradient-to-br from-[#00ff88] to-[#00cc66] text-black' : 'bg-[#1a1a1a] border-2 border-[#333]'}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 94}}
                                , msg.sender === 'user' ? 'JD' : React.createElement('svg', { viewBox: "0 0 24 24"   , className: "w-5 h-5 fill-[#00ff88]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 95}}, React.createElement('path', { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"                        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 95}}))
                            )
                            , React.createElement('div', { className: "chat-message-content flex-1" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 97}}
                                , React.createElement('div', { className: `chat-message-bubble p-3 px-4 text-sm leading-relaxed rounded-2xl ${msg.sender === 'user' ? 'bg-gradient-to-br from-[#00ff88] to-[#00cc66] text-black rounded-br-lg' : 'bg-[#1a1a1a] text-[#ccc] border border-[#333] rounded-bl-lg'}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 98}}
                                    , msg.sender === 'ai' ? (
                                        React.createElement(ReactMarkdown, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 100}}
                                            , msg.text
                                        )
                                    ) : (
                                        msg.text
                                    )
                                )
                                , React.createElement('div', { className: `chat-message-time text-xs text-[#666] mt-1 px-1 ${msg.sender === 'user' ? 'text-right' : ''}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 107}}, msg.timestamp)
                            )
                        )
                    ))
                )
                 , React.createElement('div', { ref: messagesEndRef, __self: this, __source: {fileName: _jsxFileName, lineNumber: 112}} )
            )

            , React.createElement('div', { className: "chat-input-area p-4 pt-3 bg-[#0f0f0f] border-t border-[#222]"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 115}}
                , React.createElement('div', { className: "chat-input-wrapper bg-[#1a1a1a] border-2 border-[#333] rounded-xl flex items-end p-2.5 transition-all gap-2.5 focus-within:border-[#00ff88]"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 116}}
                    , React.createElement('textarea', { 
                        ref: textareaRef,
                        className: "chat-textarea flex-1 bg-transparent border-none text-white text-sm resize-none outline-none max-h-24 overflow-y-auto leading-normal"          , 
                        placeholder: "Ask anything about your document..."    ,
                        rows: 1,
                        value: inputValue,
                        onChange: (e) => setInputValue(e.target.value),
                        onKeyDown: handleKeyDown,
                        onInput: (e) => autoResize(e.currentTarget), __self: this, __source: {fileName: _jsxFileName, lineNumber: 117}}
                    )
                    , React.createElement('button', { className: "chat-send-btn w-8 h-8 bg-gradient-to-br from-[#00ff88] to-[#00cc66] border-none rounded-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"                , onClick: handleSend, disabled: !inputValue.trim(), __self: this, __source: {fileName: _jsxFileName, lineNumber: 127}}
                        , React.createElement('svg', { viewBox: "0 0 24 24"   , className: "w-4 h-4 fill-black"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 128}}, React.createElement('path', { d: "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 128}}))
                    )
                )
            )
        )
    );
};


export default Chat;