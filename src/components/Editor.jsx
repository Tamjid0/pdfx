'use client';
const _jsxFileName = "j:\\antigravity\\pdfx\\src\\components\\Editor.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React, { useState } from 'react';
import TiptapEditor from './TiptapEditor';







const Editor = ({ htmlContent, onEditorChange }) => {
  const [editor, setEditor] = useState(null);

  return (
    React.createElement('div', { className: "editor-container flex flex-col flex-1 bg-white rounded-xl shadow-lg h-full"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 14}}
        , React.createElement('div', { className: "editor-toolbar bg-gray-100 px-4 py-3 border-b border-gray-200 flex gap-1 flex-wrap"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 15}}
            , React.createElement('button', { className: "toolbar-btn w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center cursor-pointer transition-all font-semibold text-sm text-gray-700 hover:bg-gray-200 hover:border-[#00ff88]"                , title: "Bold", onClick: () => _optionalChain([editor, 'optionalAccess', _ => _.chain, 'call', _2 => _2(), 'access', _3 => _3.focus, 'call', _4 => _4(), 'access', _5 => _5.toggleBold, 'call', _6 => _6(), 'access', _7 => _7.run, 'call', _8 => _8()]), __self: this, __source: {fileName: _jsxFileName, lineNumber: 16}}, React.createElement('strong', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 16}}, "B"))
            , React.createElement('button', { className: "toolbar-btn w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center cursor-pointer transition-all font-semibold text-sm text-gray-700 hover:bg-gray-200 hover:border-[#00ff88]"                , title: "Italic", onClick: () => _optionalChain([editor, 'optionalAccess', _9 => _9.chain, 'call', _10 => _10(), 'access', _11 => _11.focus, 'call', _12 => _12(), 'access', _13 => _13.toggleItalic, 'call', _14 => _14(), 'access', _15 => _15.run, 'call', _16 => _16()]), __self: this, __source: {fileName: _jsxFileName, lineNumber: 17}}, React.createElement('em', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 17}}, "I"))
            , React.createElement('button', { className: "toolbar-btn w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center cursor-pointer transition-all font-semibold text-sm text-gray-700 hover:bg-gray-200 hover:border-[#00ff88]"                , title: "Strikethrough", onClick: () => _optionalChain([editor, 'optionalAccess', _17 => _17.chain, 'call', _18 => _18(), 'access', _19 => _19.focus, 'call', _20 => _20(), 'access', _21 => _21.toggleStrike, 'call', _22 => _22(), 'access', _23 => _23.run, 'call', _24 => _24()]), __self: this, __source: {fileName: _jsxFileName, lineNumber: 18}}, React.createElement('s', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 18}}, "S"))
            , React.createElement('button', { className: "toolbar-btn w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center cursor-pointer transition-all font-semibold text-sm text-gray-700 hover:bg-gray-200 hover:border-[#00ff88]"                , title: "Heading 2" , onClick: () => _optionalChain([editor, 'optionalAccess', _25 => _25.chain, 'call', _26 => _26(), 'access', _27 => _27.focus, 'call', _28 => _28(), 'access', _29 => _29.toggleHeading, 'call', _30 => _30({ level: 2 }), 'access', _31 => _31.run, 'call', _32 => _32()]), __self: this, __source: {fileName: _jsxFileName, lineNumber: 19}}, "H2")
            , React.createElement('button', { className: "toolbar-btn w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center cursor-pointer transition-all font-semibold text-sm text-gray-700 hover:bg-gray-200 hover:border-[#00ff88]"                , title: "Heading 3" , onClick: () => _optionalChain([editor, 'optionalAccess', _33 => _33.chain, 'call', _34 => _34(), 'access', _35 => _35.focus, 'call', _36 => _36(), 'access', _37 => _37.toggleHeading, 'call', _38 => _38({ level: 3 }), 'access', _39 => _39.run, 'call', _40 => _40()]), __self: this, __source: {fileName: _jsxFileName, lineNumber: 20}}, "H3")
            , React.createElement('div', { className: "toolbar-separator w-px h-8 bg-gray-300 mx-1"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 21}})
            , React.createElement('button', { className: "toolbar-btn w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center cursor-pointer transition-all font-semibold text-sm text-gray-700 hover:bg-gray-200 hover:border-[#00ff88]"                , title: "Bullet List" , onClick: () => _optionalChain([editor, 'optionalAccess', _41 => _41.chain, 'call', _42 => _42(), 'access', _43 => _43.focus, 'call', _44 => _44(), 'access', _45 => _45.toggleBulletList, 'call', _46 => _46(), 'access', _47 => _47.run, 'call', _48 => _48()]), __self: this, __source: {fileName: _jsxFileName, lineNumber: 22}}
                , React.createElement('svg', { width: "16", height: "16", viewBox: "0 0 24 24"   , fill: "currentColor", __self: this, __source: {fileName: _jsxFileName, lineNumber: 23}}
                    , React.createElement('path', { d: "M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"                              , __self: this, __source: {fileName: _jsxFileName, lineNumber: 24}})
                )
            )
            , React.createElement('button', { className: "toolbar-btn w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center cursor-pointer transition-all font-semibold text-sm text-gray-700 hover:bg-gray-200 hover:border-[#00ff88]"                , title: "Numbered List" , onClick: () => _optionalChain([editor, 'optionalAccess', _49 => _49.chain, 'call', _50 => _50(), 'access', _51 => _51.focus, 'call', _52 => _52(), 'access', _53 => _53.toggleOrderedList, 'call', _54 => _54(), 'access', _55 => _55.run, 'call', _56 => _56()]), __self: this, __source: {fileName: _jsxFileName, lineNumber: 27}}
                , React.createElement('svg', { width: "16", height: "16", viewBox: "0 0 24 24"   , fill: "currentColor", __self: this, __source: {fileName: _jsxFileName, lineNumber: 28}}
                    , React.createElement('path', { d: "M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 29}})
                )
            )
            , React.createElement('div', { className: "toolbar-separator w-px h-8 bg-gray-300 mx-1"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 32}})
            , React.createElement('button', { className: "toolbar-btn w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center cursor-pointer transition-all font-semibold text-sm text-gray-700 hover:bg-gray-200 hover:border-[#00ff88]"                , title: "Align Left" , onClick: () => _optionalChain([editor, 'optionalAccess', _57 => _57.chain, 'call', _58 => _58(), 'access', _59 => _59.focus, 'call', _60 => _60(), 'access', _61 => _61.setTextAlign, 'call', _62 => _62('left'), 'access', _63 => _63.run, 'call', _64 => _64()]), __self: this, __source: {fileName: _jsxFileName, lineNumber: 33}}
                , React.createElement('svg', { width: "16", height: "16", viewBox: "0 0 24 24"   , fill: "currentColor", __self: this, __source: {fileName: _jsxFileName, lineNumber: 34}}
                    , React.createElement('path', { d: "M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 35}})
                )
            )
            , React.createElement('button', { className: "toolbar-btn w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center cursor-pointer transition-all font-semibold text-sm text-gray-700 hover:bg-gray-200 hover:border-[#00ff88]"                , title: "Align Center" , onClick: () => _optionalChain([editor, 'optionalAccess', _65 => _65.chain, 'call', _66 => _66(), 'access', _67 => _67.focus, 'call', _68 => _68(), 'access', _69 => _69.setTextAlign, 'call', _70 => _70('center'), 'access', _71 => _71.run, 'call', _72 => _72()]), __self: this, __source: {fileName: _jsxFileName, lineNumber: 38}}
                , React.createElement('svg', { width: "16", height: "16", viewBox: "0 0 24 24"   , fill: "currentColor", __self: this, __source: {fileName: _jsxFileName, lineNumber: 39}}
                    , React.createElement('path', { d: "M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 40}})
                )
            )
            , React.createElement('button', { className: "toolbar-btn w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center cursor-pointer transition-all font-semibold text-sm text-gray-700 hover:bg-gray-200 hover:border-[#00ff88]"                , title: "Align Right" , onClick: () => _optionalChain([editor, 'optionalAccess', _73 => _73.chain, 'call', _74 => _74(), 'access', _75 => _75.focus, 'call', _76 => _76(), 'access', _77 => _77.setTextAlign, 'call', _78 => _78('right'), 'access', _79 => _79.run, 'call', _80 => _80()]), __self: this, __source: {fileName: _jsxFileName, lineNumber: 43}}
                , React.createElement('svg', { width: "16", height: "16", viewBox: "0 0 24 24"   , fill: "currentColor", __self: this, __source: {fileName: _jsxFileName, lineNumber: 44}}
                    , React.createElement('path', { d: "M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 45}})
                )
            )
        )
        , React.createElement('div', { className: "editor-content p-8 text-base leading-relaxed text-gray-700 outline-none flex-1 overflow-y-auto"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 49}}
            , React.createElement(TiptapEditor, {
                htmlContent: htmlContent,
                onEditorChange: onEditorChange,
                onEditorCreated: setEditor, __self: this, __source: {fileName: _jsxFileName, lineNumber: 50}}
            )
        )
    )
  );
};

export default Editor;