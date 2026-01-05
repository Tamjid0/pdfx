'use client';
const _jsxFileName = "j:\\antigravity\\pdfx\\src\\components\\RightSidebar.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';





const IconCircle = (props) => React.createElement('svg', { ...props, viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 8}}, React.createElement('path', { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"                       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 8}} ));
const IconCheck = (props) => React.createElement('svg', { ...props, viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 9}}, React.createElement('path', { d: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 9}} ));
const IconFileText = (props) => React.createElement('svg', { ...props, viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 10}}, React.createElement('path', { d: "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 10}} ));
const IconBarChart = (props) => React.createElement('svg', { ...props, viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 11}}, React.createElement('path', { d: "M4 22H2V2h2v20zm4 0H6V10h2v12zm4 0h-2V6h2v16zm4 0h-2V14h2v8zm4 0h-2V2h2v20z"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 11}} ));
const IconPlusCircle = (props) => React.createElement('svg', { ...props, viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 12}}, React.createElement('path', { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v4h4v2h-4v4h-2v-4H7v-2h4z"                       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 12}} ));
const IconSearch = (props) => React.createElement('svg', { ...props, viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 13}}, React.createElement('path', { d: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"                                         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 13}} ));
const IconType = (props) => React.createElement('svg', { ...props, viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 14}}, React.createElement('path', { d: "M4 7V4h16v3M9 20h6M12 4v16M11 17h2"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 14}} ));
const IconUserCheck = (props) => React.createElement('svg', { ...props, viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 15}}, React.createElement('path', { d: "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 15}} ), React.createElement('circle', { cx: "8.5", cy: "7", r: "4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 15}} ), React.createElement('polyline', { points: "17 11 19 13 23 9"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 15}} ));
const IconLayoutList = (props) => React.createElement('svg', { ...props, viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 16}}, React.createElement('path', { d: "M14 10H3" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 16}} ), React.createElement('path', { d: "M14 6H3" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 16}} ), React.createElement('path', { d: "M14 14H3" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 16}} ), React.createElement('path', { d: "M14 18H3" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 16}} ), React.createElement('rect', { width: "3", height: "3", x: "21", y: "21", rx: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 16}} ), React.createElement('rect', { width: "3", height: "3", x: "21", y: "10", rx: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 16}} ), React.createElement('rect', { width: "3", height: "3", x: "21", y: "6", rx: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 16}} ), React.createElement('rect', { width: "3", height: "3", x: "21", y: "14", rx: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 16}} ));
const IconListOrdered = (props) => React.createElement('svg', { ...props, viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 17}}, React.createElement('path', { d: "M10 6H3" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 17}} ), React.createElement('path', { d: "M10 12H3" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 17}} ), React.createElement('path', { d: "M10 18H3" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 17}} ), React.createElement('rect', { width: "3", height: "3", x: "21", y: "21", rx: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 17}} ), React.createElement('rect', { width: "3", height: "3", x: "21", y: "10", rx: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 17}} ), React.createElement('rect', { width: "3", height: "3", x: "21", y: "6", rx: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 17}} ), React.createElement('rect', { width: "3", height: "3", x: "21", y: "14", rx: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 17}} ));
const IconCheckSquare = (props) => React.createElement('svg', { ...props, viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 18}}, React.createElement('path', { d: "M9 11L12 14L22 4"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 18}} ), React.createElement('path', { d: "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"               , __self: this, __source: {fileName: _jsxFileName, lineNumber: 18}} ));
const IconBox = (props) => React.createElement('svg', { ...props, viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 19}}, React.createElement('path', { d: "M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"                                    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 19}} ), React.createElement('polyline', { points: "3.29 7 12 12 20.71 7"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 19}} ), React.createElement('line', { x1: "12", y1: "22", x2: "12", y2: "12", __self: this, __source: {fileName: _jsxFileName, lineNumber: 19}} ));
const IconFlaskConical = (props) => React.createElement('svg', { ...props, viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 20}}, React.createElement('path', { d: "M4 22h16" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 20}} ), React.createElement('path', { d: "M12 4v14" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 20}} ), React.createElement('path', { d: "M4.5 4h15" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 20}} ), React.createElement('path', { d: "M6 22L12 12 18 22"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 20}} ));







const RightSidebar = ({
    onApplyTools,
    hasGenerated
}) => {
    const {
        mode,
        summarySettings, setSummarySettings,
        quizSettings, setQuizSettings,
        notesSettings, setNotesSettings,
        insightsSettings, setInsightsSettings,
        mindmapSettings, setMindmapSettings,
        flashcardsData,
        openExportModal: openGlobalExportModal,
        insightsData, notesData, quizData, summaryData, mindmapData, htmlPreview
    } = useStore();
    const [settingsChanged, setSettingsChanged] = useState(false);

    useEffect(() => {
        setSettingsChanged(false);
    }, [mode]);

    const handleSettingChange = (setter, currentSettings, key, value) => {
        setter({ ...currentSettings, [key]: value });
        setSettingsChanged(true);
    };

    const handleQuizSettingChange = (key, value) => handleSettingChange(setQuizSettings, quizSettings, key, value);
    const handleSummarySettingChange = (key, value) => handleSettingChange(setSummarySettings, summarySettings, key, value);
    const handleMindmapSettingChange = (key, value) => handleSettingChange(setMindmapSettings, mindmapSettings, key, value);
    const handleNotesSettingChange = (key, value) => handleSettingChange(setNotesSettings, notesSettings, key, value);
    const handleInsightsSettingChange = (key, value) => handleSettingChange(setInsightsSettings, insightsSettings, key, value);

    const applyTools = () => {
        onApplyTools(mode);
        setSettingsChanged(false);
    };

    const buttonText = hasGenerated ? 'Apply' : 'Generate';
    const isApplyDisabled = hasGenerated && !settingsChanged;

    const renderToolSection = () => {
        switch (mode) {
            case 'editor':
                return (
                    React.createElement('div', { className: "tool-section bg-[#1a1a1a] border border-[#333] rounded-xl p-4 mb-5"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 72}}
                        , React.createElement('div', { className: "tool-section-title text-xs font-semibold text-[#00ff88] uppercase tracking-wider mb-3.5 flex items-center gap-1.5"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 73}}
                            , React.createElement(IconCircle, { className: "w-3.5 h-3.5 fill-current"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 74}} ), "Document Analysis"

                        )
                        , React.createElement('div', { className: "tool-options grid gap-2.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 77}}
                            , React.createElement('button', { className: "tool-option flex items-center gap-2.5 p-2.5 bg-[#252525] border border-[#333] rounded-lg cursor-pointer transition-all hover:bg-[rgba(0,255,136,0.1)] hover:border-[#00ff88]"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 78}}
                                , React.createElement(IconFileText, { className: "w-4 h-4 fill-[#999] shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 79}} )
                                , React.createElement('span', { className: "tool-option-label text-sm text-[#ccc]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 80}}, "Word Count" )
                            )
                            , React.createElement('button', { className: "tool-option flex items-center gap-2.5 p-2.5 bg-[#252525] border border-[#333] rounded-lg cursor-pointer transition-all hover:bg-[rgba(0,255,136,0.1)] hover:border-[#00ff88]"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 82}}
                                , React.createElement(IconBarChart, { className: "w-4 h-4 fill-[#999] shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 83}} )
                                , React.createElement('span', { className: "tool-option-label text-sm text-[#ccc]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 84}}, "Readability Score" )
                            )
                        )
                    )
                );
            case 'notes':
                return (
                    React.createElement('div', { className: "tool-section bg-[#1a1a1a] border border-[#333] rounded-xl p-4 mb-5"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 91}}
                        , React.createElement('div', { className: "tool-section-title text-xs font-semibold text-[#00ff88] uppercase tracking-wider mb-3.5 flex items-center gap-1.5"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 92}}, "Note Tools" )
                        , React.createElement('div', { className: "tool-options grid gap-2.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 93}}
                            , React.createElement('label', { className: "flex items-center gap-2.5 p-2.5 bg-[#252525] border border-[#333] rounded-lg cursor-pointer transition-all hover:bg-[rgba(0,255,136,0.1)] hover:border-[#00ff88]"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 94}}
                                , React.createElement('input', { type: "checkbox", className: "accent-[#00ff88]", checked: notesSettings.keyConcepts, onChange: () => handleNotesSettingChange('keyConcepts', !notesSettings.keyConcepts), __self: this, __source: {fileName: _jsxFileName, lineNumber: 95}} )
                                , React.createElement('span', { className: "tool-option-label text-sm text-[#ccc]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 96}}, "Key Concepts" )
                            )
                            , React.createElement('label', { className: "flex items-center gap-2.5 p-2.5 bg-[#252525] border border-[#333] rounded-lg cursor-pointer transition-all hover:bg-[rgba(0,255,136,0.1)] hover:border-[#00ff88]"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 98}}
                                , React.createElement('input', { type: "checkbox", className: "accent-[#00ff88]", checked: notesSettings.actionItems, onChange: () => handleNotesSettingChange('actionItems', !notesSettings.actionItems), __self: this, __source: {fileName: _jsxFileName, lineNumber: 99}} )
                                , React.createElement('span', { className: "tool-option-label text-sm text-[#ccc]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 100}}, "Action Items" )
                            )
                            , React.createElement('label', { className: "flex items-center gap-2.5 p-2.5 bg-[#252525] border border-[#333] rounded-lg cursor-pointer transition-all hover:bg-[rgba(0,255,136,0.1)] hover:border-[#00ff88]"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 102}}
                                , React.createElement('input', { type: "checkbox", className: "accent-[#00ff88]", checked: notesSettings.aiSummary, onChange: () => handleNotesSettingChange('aiSummary', !notesSettings.aiSummary), __self: this, __source: {fileName: _jsxFileName, lineNumber: 103}} )
                                , React.createElement('span', { className: "tool-option-label text-sm text-[#ccc]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 104}}, "AI Summary" )
                            )
                        )
                    )
                );
            case 'quiz':
                return (
                    React.createElement(React.Fragment, null
                        , React.createElement('div', { className: "tool-section bg-[#1a1a1a] border border-[#333] rounded-xl p-4 mb-5"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 112}}
                            , React.createElement('div', { className: "tool-section-title text-xs font-semibold text-[#00ff88] uppercase tracking-wider mb-3.5 flex items-center gap-1.5"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 113}}, "Question Types" )
                            , React.createElement('div', { className: "tool-options grid gap-2.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 114}}
                                , React.createElement('label', { className: "flex items-center gap-2.5 p-2.5 bg-[#252525] border border-[#333] rounded-lg cursor-pointer transition-all hover:bg-[rgba(0,255,136,0.1)] hover:border-[#00ff88]"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 115}}
                                    , React.createElement(IconCheckSquare, { className: "w-4 h-4 fill-[#999] shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 116}} )
                                    , React.createElement('input', { type: "checkbox", className: "accent-[#00ff88]", checked: quizSettings.questionTypes.includes('multiple-choice'), onChange: () => {
                                        const newTypes = quizSettings.questionTypes.includes('multiple-choice')
                                            ? quizSettings.questionTypes.filter((t) => t !== 'multiple-choice')
                                            : [...quizSettings.questionTypes, 'multiple-choice'];
                                        handleQuizSettingChange('questionTypes', newTypes);
                                    }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 117}} )
                                    , React.createElement('span', { className: "tool-option-label text-sm text-[#ccc]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 123}}, "Multiple Choice" )
                                )
                                , React.createElement('label', { className: "flex items-center gap-2.5 p-2.5 bg-[#252525] border border-[#333] rounded-lg cursor-pointer transition-all hover:bg-[rgba(0,255,136,0.1)] hover:border-[#00ff88]"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 125}}
                                    , React.createElement(IconCheckSquare, { className: "w-4 h-4 fill-[#999] shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 126}} )
                                    , React.createElement('input', { type: "checkbox", className: "accent-[#00ff88]", checked: quizSettings.questionTypes.includes('true-false'), onChange: () => {
                                        const newTypes = quizSettings.questionTypes.includes('true-false')
                                            ? quizSettings.questionTypes.filter((t) => t !== 'true-false')
                                            : [...quizSettings.questionTypes, 'true-false'];
                                        handleQuizSettingChange('questionTypes', newTypes);
                                    }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 127}} )
                                    , React.createElement('span', { className: "tool-option-label text-sm text-[#ccc]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 133}}, "True/False")
                                )
                                , React.createElement('label', { className: "flex items-center gap-2.5 p-2.5 bg-[#252525] border border-[#333] rounded-lg cursor-pointer transition-all hover:bg-[rgba(0,255,136,0.1)] hover:border-[#00ff88]"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 135}}
                                    , React.createElement(IconCheckSquare, { className: "w-4 h-4 fill-[#999] shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 136}} )
                                    , React.createElement('input', { type: "checkbox", className: "accent-[#00ff88]", checked: quizSettings.questionTypes.includes('fill-in-the-blank'), onChange: () => {
                                        const newTypes = quizSettings.questionTypes.includes('fill-in-the-blank')
                                            ? quizSettings.questionTypes.filter((t) => t !== 'fill-in-the-blank')
                                            : [...quizSettings.questionTypes, 'fill-in-the-blank'];
                                        handleQuizSettingChange('questionTypes', newTypes);
                                    }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 137}} )
                                    , React.createElement('span', { className: "tool-option-label text-sm text-[#ccc]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 143}}, "Fill in the Blank"   )
                                )
                            )
                        )
                        , React.createElement('div', { className: "tool-section bg-[#1a1a1a] border border-[#333] rounded-xl p-4 mb-5"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 147}}
                            , React.createElement('div', { className: "tool-section-title text-xs font-semibold text-[#00ff88] uppercase tracking-wider mb-3.5 flex items-center gap-1.5"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 148}}, "Quiz Settings" )
                            , React.createElement('div', { className: "tool-options grid gap-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 149}}
                                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 150}}
                                    , React.createElement('label', { className: "tool-option-label text-sm text-[#ccc] mb-2 block"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 151}}, "Difficulty")
                                    , React.createElement('input', { type: "range", min: "0", max: "2", step: "1", value: quizSettings.difficulty === 'easy' ? 0 : quizSettings.difficulty === 'medium' ? 1 : 2, onChange: (e) => handleQuizSettingChange('difficulty', e.target.value === '0' ? 'easy' : e.target.value === '1' ? 'medium' : 'hard'), className: "w-full accent-[#00ff88]" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 152}} )
                                    , React.createElement('div', { className: "flex justify-between text-xs text-[#999]"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 153}}
                                        , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 154}}, "Easy")
                                        , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 155}}, "Medium")
                                        , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 156}}, "Hard")
                                    )
                                )
                                , React.createElement('div', { className: "flex items-center justify-between"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 159}}
                                    , React.createElement('span', { className: "tool-option-label text-sm text-[#ccc]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 160}}, "Timed Quiz" )
                                    , React.createElement('label', { className: "relative inline-flex items-center cursor-pointer"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 161}}
                                        , React.createElement('input', { type: "checkbox", checked: quizSettings.timed, onChange: () => handleQuizSettingChange('timed', !quizSettings.timed), className: "sr-only peer" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 162}} )
                                        , React.createElement('div', { className: "w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"                    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 163}})
                                    )
                                )
                                , quizSettings.timed && (
                                    React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 167}}
                                        , React.createElement('label', { className: "tool-option-label text-sm text-[#ccc] mb-2 block"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 168}}, "Time Limit (minutes)"  )
                                        , React.createElement('input', { type: "number", value: quizSettings.timeLimit, onChange: (e) => handleQuizSettingChange('timeLimit', Number(e.target.value)), className: "w-full p-2 bg-[#252525] border border-[#333] rounded-lg text-white"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 169}} )
                                    )
                                )
                            )
                        )
                        , React.createElement('div', { className: "tool-section bg-[#1a1a1a] border border-[#333] rounded-xl p-4 mb-5"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 174}}
                            , React.createElement('div', { className: "tool-section-title text-xs font-semibold text-[#00ff88] uppercase tracking-wider mb-3.5 flex items-center gap-1.5"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 175}}, "Evaluation")
                            , React.createElement('div', { className: "tool-options grid gap-2.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 176}}
                                , React.createElement('button', { className: "tool-option flex items-center gap-2.5 p-2.5 bg-[#252525] border border-[#333] rounded-lg cursor-pointer transition-all hover:bg-[rgba(0,255,136,0.1)] hover:border-[#00ff88]"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 177}}
                                    , React.createElement(IconCheck, { className: "w-4 h-4 fill-[#999] shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 178}} )
                                    , React.createElement('span', { className: "tool-option-label text-sm text-[#ccc]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 179}}, "Auto-Grading")
                                )
                                , React.createElement('button', { className: "tool-option flex items-center gap-2.5 p-2.5 bg-[#252525] border border-[#333] rounded-lg cursor-pointer transition-all hover:bg-[rgba(0,255,136,0.1)] hover:border-[#00ff88]"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 181}}
                                    , React.createElement(IconUserCheck, { className: "w-4 h-4 fill-[#999] shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 182}} )
                                    , React.createElement('span', { className: "tool-option-label text-sm text-[#ccc]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 183}}, "Performance Review" )
                                )
                            )
                        )
                    )
                );
            case 'mindmap':
                return (
                    React.createElement(React.Fragment, null
                        , React.createElement('div', { className: "tool-section bg-[#1a1a1a] border border-[#333] rounded-xl p-4 mb-5"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 192}}
                            , React.createElement('div', { className: "tool-section-title text-xs font-semibold text-[#00ff88] uppercase tracking-wider mb-3.5 flex items-center gap-1.5"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 193}}, "Layouts")
                            , React.createElement('div', { className: "tool-options grid gap-2.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 194}}
                                , React.createElement('div', { className: "flex gap-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 195}}
                                    , React.createElement('label', { className: "flex items-center gap-2 text-sm text-[#ccc]"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 196}}

                                        , React.createElement('input', { type: "radio", name: "layout", value: "organic", checked: mindmapSettings.layout === 'organic', onChange: () => handleMindmapSettingChange('layout', 'organic'), className: "accent-[#00ff88]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 198}} ), "Organic"

                                    )
                                    , React.createElement('label', { className: "flex items-center gap-2 text-sm text-[#ccc]"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 201}}

                                        , React.createElement('input', { type: "radio", name: "layout", value: "radial", checked: mindmapSettings.layout === 'radial', onChange: () => handleMindmapSettingChange('layout', 'radial'), className: "accent-[#00ff88]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 203}} ), "Radial"

                                    )
                                    , React.createElement('label', { className: "flex items-center gap-2 text-sm text-[#ccc]"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 206}}
                                        , React.createElement('input', { type: "radio", name: "layout", value: "linear", checked: mindmapSettings.layout === 'linear', onChange: () => handleMindmapSettingChange('layout', 'linear'), className: "accent-[#00ff88]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 207}} ), "Linear"

                                    )
                                )
                            )
                        )
                        , React.createElement('div', { className: "tool-section bg-[#1a1a1a] border border-[#333] rounded-xl p-4 mb-5"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 213}}
                            , React.createElement('div', { className: "tool-section-title text-xs font-semibold text-[#00ff88] uppercase tracking-wider mb-3.5 flex items-center gap-1.5"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 214}}, "Customization")
                            , React.createElement('div', { className: "tool-options grid gap-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 215}}
                                , React.createElement('button', { className: "tool-option flex items-center gap-2.5 p-2.5 bg-[#252525] border border-[#333] rounded-lg cursor-pointer transition-all hover:bg-[rgba(0,255,136,0.1)] hover:border-[#00ff88]"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 216}}
                                    , React.createElement(IconPlusCircle, { className: "w-4 h-4 fill-[#999] shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 217}} )
                                    , React.createElement('span', { className: "tool-option-label text-sm text-[#ccc]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 218}}, "Add Relationship" )
                                )
                                , React.createElement('button', { className: "tool-option flex items-center gap-2.5 p-2.5 bg-[#252525] border border-[#333] rounded-lg cursor-pointer transition-all hover:bg-[rgba(0,255,136,0.1)] hover:border-[#00ff88]"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 220}}
                                    , React.createElement(IconType, { className: "w-4 h-4 fill-[#999] shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 221}} )
                                    , React.createElement('span', { className: "tool-option-label text-sm text-[#ccc]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 222}}, "Styling")
                                )
                                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 224}}
                                    , React.createElement('label', { className: "tool-option-label text-sm text-[#ccc] mb-2 block"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 225}}, "Theme")
                                    , React.createElement('select', { value: mindmapSettings.theme, onChange: (e) => handleMindmapSettingChange('theme', e.target.value), className: "w-full p-2 bg-[#252525] border border-[#333] rounded-lg text-white"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 226}}
                                        , React.createElement('option', { value: "default", __self: this, __source: {fileName: _jsxFileName, lineNumber: 227}}, "Default")
                                        , React.createElement('option', { value: "dark", __self: this, __source: {fileName: _jsxFileName, lineNumber: 228}}, "Dark")
                                        , React.createElement('option', { value: "light", __self: this, __source: {fileName: _jsxFileName, lineNumber: 229}}, "Light")
                                    )
                                )
                            )
                        )
                        , React.createElement('div', { className: "tool-section bg-[#1a1a1a] border border-[#333] rounded-xl p-4 mb-5"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 234}}
                            , React.createElement('div', { className: "tool-section-title text-xs font-semibold text-[#00ff88] uppercase tracking-wider mb-3.5 flex items-center gap-1.5"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 235}}, "View")
                            , React.createElement('div', { className: "tool-options grid gap-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 236}}
                                , React.createElement('div', { className: "flex items-center justify-between"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 237}}
                                    , React.createElement('span', { className: "tool-option-label text-sm text-[#ccc]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 238}}, "Focus Mode" )
                                    , React.createElement('label', { className: "relative inline-flex items-center cursor-pointer"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 239}}
                                        , React.createElement('input', { type: "checkbox", checked: mindmapSettings.focusMode, onChange: () => handleMindmapSettingChange('focusMode', !mindmapSettings.focusMode), className: "sr-only peer" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 240}} )
                                        , React.createElement('div', { className: "w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"                    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 241}})
                                    )
                                )
                                , React.createElement('div', { className: "flex items-center justify-between"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 244}}
                                    , React.createElement('span', { className: "tool-option-label text-sm text-[#ccc]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 245}}, "Presentation Mode" )
                                    , React.createElement('label', { className: "relative inline-flex items-center cursor-pointer"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 246}}
                                        , React.createElement('input', { type: "checkbox", checked: mindmapSettings.presentationMode, onChange: () => handleMindmapSettingChange('presentationMode', !mindmapSettings.presentationMode), className: "sr-only peer" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 247}} )
                                        , React.createElement('div', { className: "w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"                    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 248}})
                                    )
                                )
                                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 251}}
                                    , React.createElement('label', { className: "tool-option-label text-sm text-[#ccc] mb-2 block"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 252}}, "Search")
                                    , React.createElement('input', { type: "text", value: mindmapSettings.searchTerm, onChange: (e) => handleMindmapSettingChange('searchTerm', e.target.value), className: "w-full p-2 bg-[#252525] border border-[#333] rounded-lg text-white"      , placeholder: "Search nodes..." , __self: this, __source: {fileName: _jsxFileName, lineNumber: 253}} )
                                )
                                , React.createElement('button', { className: "tool-option flex items-center gap-2.5 p-2.5 bg-[#252525] border border-[#333] rounded-lg cursor-pointer transition-all hover:bg-[rgba(0,255,136,0.1)] hover:border-[#00ff88]"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 255}}
                                    , React.createElement(IconSearch, { className: "w-4 h-4 fill-[#999] shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 256}} )
                                    , React.createElement('span', { className: "tool-option-label text-sm text-[#ccc]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 257}}, "Filter")
                                )
                            )
                        )
                    )
                );
            case 'summary':
                return (
                    React.createElement(React.Fragment, null
                        , React.createElement('div', { className: "tool-section bg-[#1a1a1a] border border-[#333] rounded-xl p-4 mb-5"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 266}}
                            , React.createElement('div', { className: "tool-section-title text-xs font-semibold text-[#00ff88] uppercase tracking-wider mb-3.5 flex items-center gap-1.5"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 267}}, "Content")
                            , React.createElement('div', { className: "tool-options grid gap-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 268}}
                                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 269}}
                                    , React.createElement('label', { className: "tool-option-label text-sm text-[#ccc] mb-2 block"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 270}}, "Summary Length: "  , summarySettings.summaryLength, "%")
                                    , React.createElement('input', { type: "range", min: "10", max: "100", step: "10", value: summarySettings.summaryLength, onChange: (e) => handleSummarySettingChange('summaryLength', Number(e.target.value)), className: "w-full accent-[#00ff88]" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 271}} )
                                )
                                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 273}}
                                    , React.createElement('label', { className: "tool-option-label text-sm text-[#ccc] mb-2 block"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 274}}, "Format")
                                    , React.createElement('div', { className: "flex gap-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 275}}
                                        , React.createElement('label', { className: "flex items-center gap-2 text-sm text-[#ccc]"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 276}}
                                            , React.createElement(IconLayoutList, { className: "w-4 h-4 fill-[#999] shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 277}} )
                                            , React.createElement('input', { type: "radio", name: "summary-format", value: "paragraph", checked: summarySettings.summaryFormat === 'paragraph', onChange: () => handleSummarySettingChange('summaryFormat', 'paragraph'), className: "accent-[#00ff88]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 278}} ), "Paragraph"

                                        )
                                        , React.createElement('label', { className: "flex items-center gap-2 text-sm text-[#ccc]"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 281}}
                                            , React.createElement(IconListOrdered, { className: "w-4 h-4 fill-[#999] shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 282}} )
                                            , React.createElement('input', { type: "radio", name: "summary-format", value: "bullets", checked: summarySettings.summaryFormat === 'bullets', onChange: () => handleSummarySettingChange('summaryFormat', 'bullets'), className: "accent-[#00ff88]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 283}} ), "Bullets"

                                        )
                                    )
                                )
                                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 288}}
                                    , React.createElement('label', { className: "tool-option-label text-sm text-[#ccc] mb-2 block"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 289}}, "Keywords")
                                    , React.createElement('input', { type: "text", value: summarySettings.keywords, onChange: (e) => handleSummarySettingChange('keywords', e.target.value), className: "w-full p-2 bg-[#252525] border border-[#333] rounded-lg text-white"      , placeholder: "e.g., AI, machine learning"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 290}} )
                                )
                            )
                        )
                        , React.createElement('div', { className: "tool-section bg-[#1a1a1a] border border-[#333] rounded-xl p-4 mb-5"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 294}}
                            , React.createElement('div', { className: "tool-section-title text-xs font-semibold text-[#00ff88] uppercase tracking-wider mb-3.5 flex items-center gap-1.5"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 295}}, "Style")
                            , React.createElement('div', { className: "tool-options grid gap-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 296}}
                                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 297}}
                                    , React.createElement('label', { className: "tool-option-label text-sm text-[#ccc] mb-2 block"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 298}}, "Tone")
                                    , React.createElement('select', { value: summarySettings.tone, onChange: (e) => handleSummarySettingChange('tone', e.target.value), className: "w-full p-2 bg-[#252525] border border-[#333] rounded-lg text-white"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 299}}
                                        , React.createElement('option', { value: "professional", __self: this, __source: {fileName: _jsxFileName, lineNumber: 300}}, "Professional")
                                        , React.createElement('option', { value: "casual", __self: this, __source: {fileName: _jsxFileName, lineNumber: 301}}, "Casual")
                                        , React.createElement('option', { value: "academic", __self: this, __source: {fileName: _jsxFileName, lineNumber: 302}}, "Academic")
                                    )
                                )
                                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 305}}
                                    , React.createElement('label', { className: "tool-option-label text-sm text-[#ccc] mb-2 block"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 306}}, "Language")
                                    , React.createElement('input', { type: "text", value: summarySettings.language, onChange: (e) => handleSummarySettingChange('language', e.target.value), className: "w-full p-2 bg-[#252525] border border-[#333] rounded-lg text-white"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 307}} )
                                )
                            )
                        )
                        , React.createElement('div', { className: "tool-section bg-[#1a1a1a] border border-[#333] rounded-xl p-4 mb-5"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 311}}
                            , React.createElement('div', { className: "tool-section-title text-xs font-semibold text-[#00ff88] uppercase tracking-wider mb-3.5 flex items-center gap-1.5"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 312}}, "Advanced")
                            , React.createElement('div', { className: "tool-options grid gap-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 313}}
                                , React.createElement('div', { className: "flex items-center justify-between"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 314}}
                                    , React.createElement('span', { className: "tool-option-label text-sm text-[#ccc]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 315}}, "Key Sentences" )
                                    , React.createElement('label', { className: "relative inline-flex items-center cursor-pointer"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 316}}
                                        , React.createElement('input', { type: "checkbox", checked: summarySettings.keySentences, onChange: () => handleSummarySettingChange('keySentences', !summarySettings.keySentences), className: "sr-only peer" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 317}} )
                                        , React.createElement('div', { className: "w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"                    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 318}})
                                    )
                                )
                                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 321}}
                                    , React.createElement('label', { className: "tool-option-label text-sm text-[#ccc] mb-2 block"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 322}}, "Summary Type" )
                                    , React.createElement('div', { className: "flex gap-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 323}}
                                        , React.createElement('label', { className: "flex items-center gap-2 text-sm text-[#ccc]"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 324}}
                                            , React.createElement(IconFlaskConical, { className: "w-4 h-4 fill-[#999] shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 325}} )
                                            , React.createElement('input', { type: "radio", name: "summary-type", value: "abstractive", checked: summarySettings.summaryType === 'abstractive', onChange: () => handleSummarySettingChange('summaryType', 'abstractive'), className: "accent-[#00ff88]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 326}} ), "Abstractive"

                                        )
                                        , React.createElement('label', { className: "flex items-center gap-2 text-sm text-[#ccc]"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 329}}
                                            , React.createElement(IconBox, { className: "w-4 h-4 fill-[#999] shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 330}} )
                                            , React.createElement('input', { type: "radio", name: "summary-type", value: "extractive", checked: summarySettings.summaryType === 'extractive', onChange: () => handleSummarySettingChange('summaryType', 'extractive'), className: "accent-[#00ff88]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 331}} ), "Extractive"

                                        )
                                    )
                                )
                            )
                        )
                    )
                );
            case 'insights':
                return (
                    React.createElement(React.Fragment, null
                        , React.createElement('div', { className: "tool-section bg-[#1a1a1a] border border-[#333] rounded-xl p-4 mb-5"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 343}}
                            , React.createElement('div', { className: "tool-section-title text-xs font-semibold text-[#00ff88] uppercase tracking-wider mb-3.5 flex items-center gap-1.5"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 344}}, "Extraction Type" )
                            , React.createElement('div', { className: "tool-options grid gap-2.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 345}}
                                , React.createElement('label', { className: "flex items-center gap-2.5 p-2.5 bg-[#252525] border border-[#333] rounded-lg cursor-pointer transition-all hover:bg-[rgba(0,255,136,0.1)] hover:border-[#00ff88]"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 346}}
                                    , React.createElement('input', { type: "checkbox", className: "accent-[#00ff88]", checked: insightsSettings.keyEntities, onChange: () => handleInsightsSettingChange('keyEntities', !insightsSettings.keyEntities), __self: this, __source: {fileName: _jsxFileName, lineNumber: 347}} )
                                    , React.createElement('span', { className: "tool-option-label text-sm text-[#ccc]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 348}}, "Key Entities" )
                                )
                                , React.createElement('label', { className: "flex items-center gap-2.5 p-2.5 bg-[#252525] border border-[#333] rounded-lg cursor-pointer transition-all hover:bg-[rgba(0,255,136,0.1)] hover:border-[#00ff88]"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 350}}
                                    , React.createElement('input', { type: "checkbox", className: "accent-[#00ff88]", checked: insightsSettings.topics, onChange: () => handleInsightsSettingChange('topics', !insightsSettings.topics), __self: this, __source: {fileName: _jsxFileName, lineNumber: 351}} )
                                    , React.createElement('span', { className: "tool-option-label text-sm text-[#ccc]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 352}}, "Topics")
                                )
                            )
                        )
                        , React.createElement('div', { className: "tool-section bg-[#1a1a1a] border border-[#333] rounded-xl p-4 mb-5"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 356}}
                            , React.createElement('div', { className: "tool-section-title text-xs font-semibold text-[#00ff88] uppercase tracking-wider mb-3.5 flex items-center gap-1.5"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 357}}, "Custom")
                            , React.createElement('div', { className: "tool-options grid gap-2.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 358}}
                                , React.createElement('input', { type: "text", value: insightsSettings.customExtraction, onChange: (e) => handleInsightsSettingChange('customExtraction', e.target.value), className: "w-full p-2 bg-[#252525] border border-[#333] rounded-lg text-white"      , placeholder: "Custom extraction query..."  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 359}} )
                            )
                        )
                    )
                );
            case 'flashcards':
                return (
                    React.createElement('div', { className: "tool-section bg-[#1a1a1a] border border-[#333] rounded-xl p-4 mb-5"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 366}}
                        , React.createElement('div', { className: "tool-section-title text-xs font-semibold text-[#00ff88] uppercase tracking-wider mb-3.5 flex items-center gap-1.5"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 367}}, "Deck Settings" )
                        , React.createElement('div', { className: "tool-options grid gap-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 368}}
                            , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 369}}
                                , React.createElement('label', { className: "tool-option-label text-sm text-[#ccc] mb-2 block"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 370}}, "Number of Cards"  )
                                , React.createElement('input', { type: "number", min: "5", max: "50", step: "5", value: _optionalChain([flashcardsData, 'optionalAccess', _ => _.flashcards, 'optionalAccess', _2 => _2.length]) || 10, readOnly: true, className: "w-full p-2 bg-[#252525] border border-[#333] rounded-lg text-white opacity-50 cursor-not-allowed"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 371}} )
                            )
                            , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 373}}
                                , React.createElement('label', { className: "tool-option-label text-sm text-[#ccc] mb-2 block"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 374}}, "Difficulty")
                                , React.createElement('select', { className: "w-full p-2 bg-[#252525] border border-[#333] rounded-lg text-white"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 375}}
                                    , React.createElement('option', { value: "mixed", __self: this, __source: {fileName: _jsxFileName, lineNumber: 376}}, "Mixed")
                                    , React.createElement('option', { value: "easy", __self: this, __source: {fileName: _jsxFileName, lineNumber: 377}}, "Easy")
                                    , React.createElement('option', { value: "hard", __self: this, __source: {fileName: _jsxFileName, lineNumber: 378}}, "Hard")
                                )
                            )
                        )
                    )
                );
            default:
                return (
                    React.createElement('p', { className: "text-[#666] text-sm text-center p-4"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 386}}, "Select a mode to see available tools."

                    )
                );
        }
    };

    return (
        React.createElement('aside', { className: "sidebar-right w-[320px] bg-[#111] border-l border-[#222] flex flex-col overflow-hidden h-[100vh]"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 394}}
            , React.createElement('div', { className: "right-sidebar-header p-4 border-b border-[#222] bg-[#1a1a1a] flex justify-between items-center"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 395}}
                , React.createElement('h3', { className: "right-sidebar-title text-base font-semibold text-white flex items-center gap-2"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 396}}
                    , React.createElement(IconCircle, { className: "w-5 h-5 fill-[#00ff88]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 397}} ), "Tools"

                )
                , React.createElement('button', {
                    className: `apply-btn px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${isApplyDisabled ? 'bg-[#333] text-[#666] cursor-not-allowed' : 'bg-[#00ff88] text-black hover:bg-[#00dd77]'}`,
                    onClick: applyTools,
                    disabled: isApplyDisabled, __self: this, __source: {fileName: _jsxFileName, lineNumber: 400}}

                    , React.createElement(IconCheck, { className: "w-3.5 h-3.5 fill-current"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 405}} )
                    , buttonText
                )
            )
            , React.createElement('div', { className: "right-sidebar-content flex-1 overflow-y-auto p-5"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 409}}
                , renderToolSection()
            )
            , React.createElement('div', { className: "action-buttons p-5 border-t border-[#333] flex flex-col gap-3 flex-shrink-0"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 412}}
                , React.createElement('button', {
                    className: "action-btn action-btn-export w-full p-3 rounded-lg text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 border-none bg-[#00ff88] text-black hover:bg-[#00dd77]"                ,
                    onClick: () => {
                        let data = null;
                        if (mode === 'editor') {
                            data = htmlPreview;
                        } else {
                            switch (mode) {
                                case 'summary': data = summaryData; break;
                                case 'insights': data = insightsData; break;
                                case 'notes': data = notesData; break;
                                case 'quiz': data = quizData; break;
                                case 'flashcards': data = flashcardsData; break;
                                case 'mindmap': data = mindmapData; break;
                                default: data = null;
                            }
                        }
                        if (data) openGlobalExportModal(mode, data);
                        else alert("No content to export.");
                    }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 413}}

                    , React.createElement('svg', {
                        viewBox: "0 0 24 24"   ,
                        xmlns: "http://www.w3.org/2000/svg",
                        className: "w-4 h-4 fill-current"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 434}}

                        , React.createElement('path', { d: "M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"             , __self: this, __source: {fileName: _jsxFileName, lineNumber: 439}} )
                    ), "Export"

                )
            )

        )
    );
};

export default RightSidebar;
