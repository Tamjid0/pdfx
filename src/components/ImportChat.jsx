'use client';
const _jsxFileName = "j:\\antigravity\\pdfx\\src\\components\\ImportChat.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import React, { useState, useRef } from 'react';







const ImportChat = ({ onImportUrl, onPasteContent, onFileUpload }) => {
  const [url, setUrl] = useState('');
  const [pastedContent, setPastedContent] = useState('');
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleImportUrl = () => {
    if (url) {
      onImportUrl(url);
      setIsUrlModalOpen(false);
    }
  };

  const handlePaste = () => {
    if (pastedContent) {
      onPasteContent(pastedContent);
      setIsPasteModalOpen(false);
    }
  };

  const handleFileSelect = (file) => {
    if (file) {
      onFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e) => {
    const file = _optionalChain([e, 'access', _ => _.target, 'access', _2 => _2.files, 'optionalAccess', _3 => _3[0]]);
    if (file) {
      handleFileSelect(file);
    }
  };
  
  const openFilePicker = () => {
    _optionalChain([fileInputRef, 'access', _4 => _4.current, 'optionalAccess', _5 => _5.click, 'call', _6 => _6()]);
  };

  return (
    React.createElement('div', { className: "w-full max-w-5xl flex flex-col gap-6"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 69}}
      , React.createElement('div', { className: "text-center mb-6" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 70}}
        , React.createElement('h2', { className: "text-3xl font-bold mb-2 text-white"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 71}}, "Start Your Project"  )
        , React.createElement('p', { className: "text-base text-gemini-gray" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 72}}, "Choose how you want to import your content"       )
      )

      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 75}}
        , React.createElement('div', { className: "bg-gemini-dark-200 border-2 border-gemini-dark-400 rounded-2xl p-10 cursor-pointer transition-all text-center hover:border-gemini-green hover:bg-gemini-dark-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-gemini-green/20"            , onClick: () => setIsUrlModalOpen(true), __self: this, __source: {fileName: _jsxFileName, lineNumber: 76}}
          , React.createElement('div', { className: "w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-gemini-green/10 to-gemini-green/5 rounded-2xl flex items-center justify-center"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 77}}
            , React.createElement('svg', { className: "w-8 h-8 fill-gemini-green"  , viewBox: "0 0 24 24"   , xmlns: "http://www.w3.org/2000/svg", __self: this, __source: {fileName: _jsxFileName, lineNumber: 78}}
              , React.createElement('path', { d: "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"                     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 79}} )
            )
          )
          , React.createElement('h3', { className: "text-2xl font-semibold mb-3 text-white"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 82}}, "Import from URL"  )
          , React.createElement('p', { className: "text-sm text-gemini-gray leading-relaxed"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 83}}, "Paste a chat URL or conversation link to automatically import and format your content"             )
        )

        , React.createElement('div', { className: "bg-gemini-dark-200 border-2 border-gemini-dark-400 rounded-2xl p-10 cursor-pointer transition-all text-center hover:border-gemini-green hover:bg-gemini-dark-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-gemini-green/20"            , onClick: () => onPasteContent(''), __self: this, __source: {fileName: _jsxFileName, lineNumber: 86}}
          , React.createElement('div', { className: "w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-gemini-green/10 to-gemini-green/5 rounded-2xl flex items-center justify-center"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 87}}
            , React.createElement('svg', { className: "w-8 h-8 fill-gemini-green"  , viewBox: "0 0 24 24"   , xmlns: "http://www.w3.org/2000/svg", __self: this, __source: {fileName: _jsxFileName, lineNumber: 88}}
              , React.createElement('path', { d: "M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z"                            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 89}} )
            )
          )
          , React.createElement('h3', { className: "text-2xl font-semibold mb-3 text-white"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 92}}, "Paste Content" )
          , React.createElement('p', { className: "text-sm text-gemini-gray leading-relaxed"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 93}}, "Directly paste your chat content, code snippets, or text to format and convert to PDF"              )
        )

        , React.createElement('div', {
          className: `bg-gemini-dark-200 border-2 rounded-2xl p-10 cursor-pointer transition-all text-center hover:border-gemini-green hover:bg-gemini-dark-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-gemini-green/20 ${isDragOver ? 'border-gemini-green bg-gemini-dark-300' : 'border-gemini-dark-400'}`,
          onDragOver: handleDragOver,
          onDragLeave: handleDragLeave,
          onDrop: handleDrop,
          onClick: openFilePicker, __self: this, __source: {fileName: _jsxFileName, lineNumber: 96}}

          , React.createElement('div', { className: "w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-gemini-green/10 to-gemini-green/5 rounded-2xl flex items-center justify-center"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 103}}
            , React.createElement('svg', { className: "w-8 h-8 fill-gemini-green"  , viewBox: "0 0 24 24"   , xmlns: "http://www.w3.org/2000/svg", __self: this, __source: {fileName: _jsxFileName, lineNumber: 104}}
              , React.createElement('path', { d: "M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 105}} )
            )
          )
          , React.createElement('h3', { className: "text-2xl font-semibold mb-3 text-white"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 108}}, "Upload File" )
          , React.createElement('p', { className: "text-sm text-gemini-gray leading-relaxed"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 109}}, "Drag and drop your file here, or click to browse. Supports PDF, TXT, and MD files."               )
          , React.createElement('input', {
            type: "file",
            ref: fileInputRef,
            className: "hidden",
            onChange: handleFileInputChange,
            accept: ".pdf,.txt,.md", __self: this, __source: {fileName: _jsxFileName, lineNumber: 110}}
          )
        )
      )

      , isUrlModalOpen && (
        React.createElement('div', { className: "fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[1000]"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 121}}
          , React.createElement('div', { className: "bg-gemini-dark-200 border border-gemini-dark-500 rounded-2xl p-8 w-[90%] max-w-xl shadow-2xl"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 122}}
            , React.createElement('div', { className: "flex justify-between items-center mb-6"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 123}}
              , React.createElement('h3', { className: "text-2xl font-semibold text-white"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 124}}, "Import from URL"  )
              , React.createElement('button', { className: "bg-transparent border-none text-gemini-gray cursor-pointer p-1 transition-colors hover:text-gemini-green"      , onClick: () => setIsUrlModalOpen(false), __self: this, __source: {fileName: _jsxFileName, lineNumber: 125}}
                , React.createElement('svg', { className: "w-6 h-6 fill-current"  , viewBox: "0 0 24 24"   , xmlns: "http://www.w3.org/2000/svg", __self: this, __source: {fileName: _jsxFileName, lineNumber: 126}}
                  , React.createElement('path', { d: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"                      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 127}} )
                )
              )
            )
            , React.createElement('div', { className: "mb-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 131}}
              , React.createElement('div', { className: "mb-5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 132}}
                , React.createElement('label', { className: "block text-sm font-medium text-gray-300 mb-2"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 133}}, "Chat URL or Conversation Link"    )
                , React.createElement('input', { type: "url", className: "w-full px-4 py-3.5 bg-gemini-dark-300 border border-gemini-dark-500 rounded-lg text-sm text-white transition-all focus:outline-none focus:border-gemini-green focus:bg-[#1f1f1f] focus:ring-3 focus:ring-gemini-green/10"              , id: "chatUrl", placeholder: "https://chat.example.com/conversation/123", value: url, onChange: (e) => setUrl(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 134}} )
              )
              , React.createElement('div', { className: "mb-5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 136}}
                , React.createElement('label', { className: "block text-sm font-medium text-gray-300 mb-2"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 137}}, "Import Options" )
                , React.createElement('select', { className: "w-full px-4 py-3.5 bg-gemini-dark-300 border border-gemini-dark-500 rounded-lg text-sm text-white transition-all focus:outline-none focus:border-gemini-green focus:bg-[#1f1f1f] focus:ring-3 focus:ring-gemini-green/10"              , __self: this, __source: {fileName: _jsxFileName, lineNumber: 138}}
                  , React.createElement('option', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 139}}, "Full conversation" )
                  , React.createElement('option', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 140}}, "Code blocks only"  )
                  , React.createElement('option', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 141}}, "Text only" )
                  , React.createElement('option', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 142}}, "Custom selection" )
                )
              )
            )
            , React.createElement('div', { className: "flex gap-3 justify-end"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 146}}
              , React.createElement('button', { className: "bg-gemini-dark-300 text-white border border-gemini-dark-500 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all flex items-center gap-2 hover:bg-[#252525]"              , onClick: () => setIsUrlModalOpen(false), __self: this, __source: {fileName: _jsxFileName, lineNumber: 147}}, "Cancel")
              , React.createElement('button', { className: "bg-gemini-green text-black border-none px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all shadow-md shadow-gemini-green/30 flex items-center gap-2 hover:bg-gemini-green-300 hover:shadow-lg hover:shadow-gemini-green/40 hover:-translate-y-px"                  , onClick: handleImportUrl, __self: this, __source: {fileName: _jsxFileName, lineNumber: 148}}, "Import Chat" )
            )
          )
        )
      )

      , isPasteModalOpen && (
        React.createElement('div', { className: "fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[1000]"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 155}}
          , React.createElement('div', { className: "bg-gemini-dark-200 border border-gemini-dark-500 rounded-2xl p-8 w-[90%] max-w-xl shadow-2xl"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 156}}
            , React.createElement('div', { className: "flex justify-between items-center mb-6"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 157}}
              , React.createElement('h3', { className: "text-2xl font-semibold text-white"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 158}}, "Paste Content to Format"   )
              , React.createElement('button', { className: "bg-transparent border-none text-gemini-gray cursor-pointer p-1 transition-colors hover:text-gemini-green"      , onClick: () => setIsPasteModalOpen(false), __self: this, __source: {fileName: _jsxFileName, lineNumber: 159}}
                , React.createElement('svg', { className: "w-6 h-6 fill-current"  , viewBox: "0 0 24 24"   , xmlns: "http://www.w3.org/2000/svg", __self: this, __source: {fileName: _jsxFileName, lineNumber: 160}}
                  , React.createElement('path', { d: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"                      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 161}} )
                )
              )
            )
            , React.createElement('div', { className: "mb-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 165}}
              , React.createElement('div', { className: "mb-5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 166}}
                , React.createElement('label', { className: "block text-sm font-medium text-gray-300 mb-2"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 167}}, "Paste Your Content Here"   )
                , React.createElement('textarea', { className: "w-full px-4 py-3.5 bg-gemini-dark-300 border border-gemini-dark-500 rounded-lg text-sm text-white transition-all focus:outline-none focus:border-gemini-green focus:bg-[#1f1f1f] focus:ring-3 focus:ring-gemini-green/10 min-h-[200px] resize-y font-sans"                 , id: "pastedContent", placeholder: "Paste your chat content, code snippets, or any text here..."         , value: pastedContent, onChange: (e) => setPastedContent(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 168}})
              )
              , React.createElement('div', { className: "mb-5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 170}}
                , React.createElement('label', { className: "block text-sm font-medium text-gray-300 mb-2"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 171}}, "Auto-detect Format" )
                , React.createElement('select', { className: "w-full px-4 py-3.5 bg-gemini-dark-300 border border-gemini-dark-500 rounded-lg text-sm text-white transition-all focus:outline-none focus:border-gemini-green focus:bg-[#1f1f1f] focus:ring-3 focus:ring-gemini-green/10"              , __self: this, __source: {fileName: _jsxFileName, lineNumber: 172}}
                  , React.createElement('option', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 173}}, "Automatic detection" )
                  , React.createElement('option', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 174}}, "Plain text" )
                  , React.createElement('option', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 175}}, "Markdown")
                  , React.createElement('option', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 176}}, "Code")
                  , React.createElement('option', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 177}}, "Mixed content" )
                )
              )
            )
            , React.createElement('div', { className: "flex gap-3 justify-end"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 181}}
              , React.createElement('button', { className: "bg-gemini-dark-300 text-white border border-gemini-dark-500 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all flex items-center gap-2 hover:bg-[#252525]"              , onClick: () => setIsPasteModalOpen(false), __self: this, __source: {fileName: _jsxFileName, lineNumber: 182}}, "Cancel")
              , React.createElement('button', { className: "bg-gemini-green text-black border-none px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all shadow-md shadow-gemini-green/30 flex items-center gap-2 hover:bg-gemini-green-300 hover:shadow-lg hover:shadow-gemini-green/40 hover:-translate-y-px"                  , onClick: handlePaste, __self: this, __source: {fileName: _jsxFileName, lineNumber: 183}}, "Format Content" )
            )
          )
        )
      )
    )
  );
};

export default ImportChat;
