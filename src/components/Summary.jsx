'use client';
const _jsxFileName = "j:\\antigravity\\pdfx\\src\\components\\Summary.tsx";import React from 'react';
import { useStore } from '../store/useStore';

import TiptapEditor from './TiptapEditor';





const Summary = ({ onGenerate }) => {
    const {
        summaryData, setSummaryData,
    } = useStore();

    // Removed unused editor state

    const handleSummaryChange = (html) => {
        if (summaryData) {
            setSummaryData({ ...summaryData, summary: html });
        }
    };

    // Changed to HTMLDivElement as it is a div
    const handleKeyPointChange = (e, index) => {
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

    const deleteKeyPoint = (index) => {
        if (summaryData) {
            const newKeyPoints = summaryData.keyPoints.filter((_, i) => i !== index);
            setSummaryData({ ...summaryData, keyPoints: newKeyPoints });
        }
    };

    if (!summaryData) {
        return (
            React.createElement('div', { className: "flex flex-col items-center justify-center h-full text-center p-8 bg-[#0a0a0a] rounded-xl border border-[#222]"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 50}}
                , React.createElement('div', { className: "w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6 border border-[#333] shadow-inner"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 51}}
                    , React.createElement('svg', { className: "w-10 h-10 text-[#00ff88] drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]"   , fill: "none", stroke: "currentColor", viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 52}}
                        , React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"                    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 53}} )
                    )
                )
                , React.createElement('h3', { className: "text-2xl font-bold text-white mb-3"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 56}}, "Intelligent Summary" )
                , React.createElement('p', { className: "text-gray-400 mb-8 max-w-sm leading-relaxed"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 57}}, "Let our AI analyze your document to extract core concepts, main narratives, and actionable insights."

                )
                , React.createElement('button', {
                    onClick: () => onGenerate('summary'),
                    className: "group relative px-8 py-3.5 bg-[#00ff88] text-black rounded-xl text-sm font-black transition-all hover:bg-[#00dd77] active:scale-95 shadow-[0_5px_15px_rgba(0,255,136,0.3)] overflow-hidden"             , __self: this, __source: {fileName: _jsxFileName, lineNumber: 60}}

                    , React.createElement('span', { className: "relative z-10 flex items-center gap-2"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 64}}, "GENERATE SUMMARY"

                        , React.createElement('svg', { className: "w-4 h-4 transition-transform group-hover:translate-x-1"   , fill: "none", stroke: "currentColor", viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 66}}, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 7l5 5m0 0l-5 5m5-5H6"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 66}} ))
                    )
                    , React.createElement('div', { className: "absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 68}})
                )
            )
        );
    }

    return (
        React.createElement('div', { className: "flex flex-col h-full bg-[#0a0a0a] rounded-xl border border-[#222] overflow-hidden shadow-2xl"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 75}}
            , React.createElement('div', { className: "flex items-center justify-between p-5 border-b border-[#222] bg-[#111] backdrop-blur-md"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 76}}
                , React.createElement('div', { className: "flex items-center gap-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 77}}
                    , React.createElement('div', { className: "flex space-x-1" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 78}}
                        , React.createElement('div', { className: "w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-bounce"    , style: { animationDelay: '0ms' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 79}})
                        , React.createElement('div', { className: "w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-bounce"    , style: { animationDelay: '150ms' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 80}})
                        , React.createElement('div', { className: "w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-bounce"    , style: { animationDelay: '300ms' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 81}})
                    )
                    , React.createElement('h3', { className: "text-xs font-black text-white uppercase tracking-[0.3em] font-mono"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 83}}, "Analysis Ready" )
                )
                , React.createElement('div', { className: "flex gap-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 85}}
                    , React.createElement('button', {
                        onClick: () => onGenerate('summary'),
                        className: "px-4 py-2 bg-[#1a1a1a] text-[#00ff88] border border-[#00ff88]/20 rounded-lg text-xs font-bold hover:bg-[#00ff88]/10 transition-all flex items-center gap-2"             , __self: this, __source: {fileName: _jsxFileName, lineNumber: 86}}

                        , React.createElement('svg', { className: "w-3.5 h-3.5" , fill: "none", stroke: "currentColor", viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 90}}, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"             , __self: this, __source: {fileName: _jsxFileName, lineNumber: 90}} )), "REGENERATE"

                    )
                )
            )

            , React.createElement('div', { className: "flex-1 overflow-y-auto custom-scrollbar"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 96}}
                , React.createElement('div', { className: "p-8 space-y-12 max-w-4xl mx-auto"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 97}}
                    , React.createElement('section', { className: "animate-in fade-in slide-in-from-bottom-4 duration-700"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 98}}
                        , React.createElement('div', { className: "flex items-center gap-4 mb-6"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 99}}
                            , React.createElement('h4', { className: "flex-shrink-0 text-[10px] font-black text-[#444] uppercase tracking-[0.4em]"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 100}}, "EXECUTIVE SUMMARY" )
                            , React.createElement('div', { className: "h-px w-full bg-[#222]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 101}})
                        )
                        , React.createElement('div', { className: "relative group" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 103}}
                            , React.createElement('div', { className: "absolute -inset-1 bg-gradient-to-r from-[#00ff88]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 104}})
                            , React.createElement('div', { className: "relative bg-[#111]/50 border border-[#222] rounded-2xl p-6 min-h-[150px] transition-all group-hover:border-[#00ff88]/20"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 105}}
                                , React.createElement(TiptapEditor, {
                                    htmlContent: summaryData.summary,
                                    onEditorChange: handleSummaryChange, __self: this, __source: {fileName: _jsxFileName, lineNumber: 106}}
                                )
                            )
                        )
                    )

                    , React.createElement('section', { className: "animate-in fade-in slide-in-from-bottom-4 delay-200 duration-700"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 114}}
                        , React.createElement('div', { className: "flex items-center gap-4 mb-6"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 115}}
                            , React.createElement('h4', { className: "flex-shrink-0 text-[10px] font-black text-[#444] uppercase tracking-[0.4em]"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 116}}, "CORE TAKEAWAYS" )
                            , React.createElement('div', { className: "h-px w-full bg-[#222]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 117}})
                        )
                        , React.createElement('div', { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 119}}
                            , summaryData.keyPoints.map((point, index) => (
                                React.createElement('div', { key: index, className: "group relative bg-[#111]/30 border border-[#222] rounded-xl p-5 transition-all hover:bg-[#111] hover:border-[#00ff88]/30 hover:translate-x-1 flex items-start gap-4"             , __self: this, __source: {fileName: _jsxFileName, lineNumber: 121}}
                                    , React.createElement('div', { className: "absolute left-0 top-0 bottom-0 w-1 bg-[#00ff88] rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 122}})
                                    , React.createElement('span', { className: "text-xs font-mono text-[#00ff88] opacity-50 font-bold mt-1"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 123}}, (index + 1).toString().padStart(2, '0'))
                                    , React.createElement('div', {
                                        className: "flex-1 text-sm text-[#ddd] leading-relaxed outline-none focus:text-white"     ,
                                        contentEditable: true,
                                        suppressContentEditableWarning: true,
                                        onBlur: (e) => handleKeyPointChange(e, index), __self: this, __source: {fileName: _jsxFileName, lineNumber: 124}}

                                        , point
                                    )
                                    , React.createElement('button', {
                                        onClick: () => deleteKeyPoint(index),
                                        className: "opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-all p-1"     ,
                                        title: "Delete point" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 132}}

                                        , React.createElement('svg', { className: "w-4 h-4" , fill: "none", stroke: "currentColor", viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 137}}, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"                   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 137}} ))
                                    )
                                )
                            ))
                            , React.createElement('button', {
                                onClick: addKeyPoint,
                                className: "w-full py-4 border-2 border-[#1a1a1a] border-dashed rounded-xl text-[10px] font-black text-[#444] uppercase tracking-widest hover:text-[#00ff88] hover:border-[#00ff88]/30 hover:bg-[#00ff88]/5 transition-all"              , __self: this, __source: {fileName: _jsxFileName, lineNumber: 141}}
, "+ Append New Insight"

                            )
                        )
                    )
                )
            )

            , React.createElement('div', { className: "p-6 bg-[#0f0f0f] border-t border-[#222] flex justify-between items-center"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 152}}
                , React.createElement('p', { className: "text-[10px] font-bold text-[#444] uppercase tracking-widest"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 153}}, "Last updated: "
                      , new Date().toLocaleTimeString()
                )
                , React.createElement('div', { className: "flex gap-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 156}}
                    , React.createElement('button', { className: "px-5 py-2.5 text-[#00ff88] text-xs font-black uppercase tracking-widest hover:underline transition-all"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 157}}, "Download .PDF" )
                    , React.createElement('button', {
                        className: "px-6 py-2.5 bg-[#00ff88] text-black rounded-xl text-xs font-bold hover:bg-[#00dd77] transition-all shadow-[0_0_20px_rgba(0,255,136,0.15)] active:scale-95"          ,
                        onClick: () => alert('Summary exported to main editor!'), __self: this, __source: {fileName: _jsxFileName, lineNumber: 158}}
, "PUSH TO MAIN EDITOR"

                    )
                )
            )
        )
    );
};

export default Summary;
