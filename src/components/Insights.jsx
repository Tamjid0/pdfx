'use client';
const _jsxFileName = "j:\\antigravity\\pdfx\\src\\components\\Insights.tsx";import React from 'react';
import { useStore } from '../store/useStore';











const Insights = ({ onGenerate }) => {
    const {
        insightsData, setInsightsData,
    } = useStore();

    const handleContentChange = (e, index, field) => {
        if (insightsData) {
            const newInsights = [...insightsData.insights];
            newInsights[index] = { ...newInsights[index], [field]: e.currentTarget.innerText };
            setInsightsData({ ...insightsData, insights: newInsights });
        }
    };

    const addInsight = () => {
        if (insightsData) {
            setInsightsData({
                ...insightsData,
                insights: [...insightsData.insights, { title: 'New Insight Title', description: 'New insight description...' }]
            });
        }
    };

    const deleteInsight = (index) => {
        if (insightsData) {
            const newInsights = insightsData.insights.filter((_, i) => i !== index);
            setInsightsData({ ...insightsData, insights: newInsights });
        }
    };

    if (!insightsData || !insightsData.insights || insightsData.insights.length === 0) {
        return (
            React.createElement('div', { className: "flex flex-col items-center justify-center h-full text-center p-8 bg-[#0a0a0a] rounded-xl border border-[#222]"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 45}}
                , React.createElement('div', { className: "w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6 border border-[#333] shadow-inner text-[#00ff88]"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 46}}
                    , React.createElement('svg', { className: "w-10 h-10" , fill: "none", stroke: "currentColor", viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 47}}
                        , React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M13 10V3L4 14h7v7l9-11h-7z"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 48}} )
                    )
                )
                , React.createElement('h3', { className: "text-2xl font-bold text-white mb-3"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 51}}, "Core Insights" )
                , React.createElement('p', { className: "text-gray-400 mb-8 max-w-sm leading-relaxed"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 52}}, "Extract deep patterns, hidden connections, and high-value conclusions from your reading material."

                )
                , React.createElement('button', {
                    onClick: () => onGenerate('insights'),
                    className: "px-8 py-3.5 bg-[#00ff88] text-black rounded-xl text-sm font-black transition-all hover:bg-[#00dd77] active:scale-95 shadow-[0_5px_15px_rgba(0,255,136,0.3)]"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 55}}
, "EXTRACT INSIGHTS"

                )
            )
        );
    }

    return (
        React.createElement('div', { className: "flex flex-col h-full bg-[#0a0a0a] rounded-xl border border-[#222] overflow-hidden shadow-2xl"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 66}}
            , React.createElement('div', { className: "flex items-center justify-between p-5 border-b border-[#222] bg-[#111]"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 67}}
                , React.createElement('div', { className: "flex items-center gap-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 68}}
                    , React.createElement('div', { className: "w-2 h-2 bg-[#00ff88] rounded-full shadow-[0_0_8px_rgba(0,255,136,1)]"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 69}})
                    , React.createElement('h3', { className: "text-xs font-black text-white uppercase tracking-[0.3em]"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 70}}, "Neural Extraction" )
                )
                , React.createElement('button', {
                    onClick: () => onGenerate('insights'),
                    className: "px-4 py-2 bg-[#1a1a1a] text-[#00ff88] border border-[#00ff88]/20 rounded-lg text-xs font-bold hover:bg-[#00ff88]/10 transition-all flex items-center gap-2"             , __self: this, __source: {fileName: _jsxFileName, lineNumber: 72}}
, "REGENERATE"

                )
            )

            , React.createElement('div', { className: "flex-1 overflow-y-auto custom-scrollbar p-8"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 80}}
                , React.createElement('div', { className: "max-w-4xl mx-auto grid grid-cols-1 gap-4"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 81}}
                    , insightsData.insights.map((insight, index) => (
                        React.createElement('div', { key: index, className: "group relative bg-[#111]/50 border border-[#222] rounded-xl p-5 transition-all hover:bg-[#111] hover:border-[#00ff88]/30 hover:-translate-y-1"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 83}}
                            , React.createElement('div', { className: "absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 84}}
                                , React.createElement('button', {
                                    onClick: () => deleteInsight(index),
                                    className: "p-1 text-gray-500 hover:text-red-500 transition-colors"   ,
                                    title: "Delete Insight" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 85}}

                                    , React.createElement('svg', { className: "w-4 h-4" , fill: "none", stroke: "currentColor", viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 90}}, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"                   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 90}} ))
                                )
                                , React.createElement('div', { className: "p-1 opacity-50" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 92}}
                                    , React.createElement('svg', { className: "w-5 h-5 text-[#00ff88]"  , fill: "none", stroke: "currentColor", viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 93}}, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 93}} ))
                                )
                            )
                            , React.createElement('h4', {
                                className: "text-base font-bold text-white mb-2 outline-none mr-8"     ,
                                contentEditable: true,
                                suppressContentEditableWarning: true,
                                onBlur: (e) => handleContentChange(e, index, 'title'), __self: this, __source: {fileName: _jsxFileName, lineNumber: 96}}

                                , insight.title
                            )
                            , React.createElement('p', {
                                className: "text-sm text-[#999] leading-relaxed outline-none focus:text-[#ccc]"    ,
                                contentEditable: true,
                                suppressContentEditableWarning: true,
                                onBlur: (e) => handleContentChange(e, index, 'description'), __self: this, __source: {fileName: _jsxFileName, lineNumber: 104}}

                                , insight.description
                            )
                        )
                    ))

                    , React.createElement('button', {
                        onClick: addInsight,
                        className: "w-full py-6 border-2 border-[#1a1a1a] border-dashed rounded-2xl text-xs font-black text-[#444] uppercase tracking-widest hover:text-[#00ff88] hover:border-[#00ff88]/30 hover:bg-[#00ff88]/5 transition-all"              , __self: this, __source: {fileName: _jsxFileName, lineNumber: 115}}
, "+ Register New Insight"

                    )
                )
            )

            , React.createElement('div', { className: "p-6 bg-[#0f0f0f] border-t border-[#222] flex justify-between items-center"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 124}}
                , React.createElement('div', { className: "flex gap-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 125}}
                    , React.createElement('span', { className: "w-2 h-2 bg-[#00ff88]/20 rounded-full"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 126}})
                    , React.createElement('span', { className: "w-2 h-2 bg-[#00ff88]/20 rounded-full"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 127}})
                    , React.createElement('span', { className: "w-2 h-2 bg-[#00ff88]/20 rounded-full"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 128}})
                )
                , React.createElement('button', { className: "px-6 py-2.5 bg-[#00ff88] text-black rounded-xl text-xs font-bold hover:bg-[#00dd77] transition-all shadow-xl active:scale-95"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 130}}, "PUSH TO EDITOR"  )
            )
        )
    );
};

export default Insights;