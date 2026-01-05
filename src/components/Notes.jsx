'use client';
const _jsxFileName = "j:\\antigravity\\pdfx\\src\\components\\Notes.tsx";import React from 'react';
import { useStore } from '../store/useStore';











const Notes = ({ onGenerate }) => {
    const {
        notesData, setNotesData,
    } = useStore();

    const handleSectionTitleChange = (e, sectionIndex) => {
        if (notesData) {
            const newNotes = [...notesData.notes];
            newNotes[sectionIndex] = { ...newNotes[sectionIndex], section: e.currentTarget.innerText };
            setNotesData({ ...notesData, notes: newNotes });
        }
    };

    // Changed to HTMLDivElement as it is attached to a div
    const handlePointChange = (e, sectionIndex, pointIndex) => {
        if (notesData) {
            const newNotes = [...notesData.notes];
            const newPoints = [...newNotes[sectionIndex].points];
            newPoints[pointIndex] = e.currentTarget.innerText;
            newNotes[sectionIndex] = { ...newNotes[sectionIndex], points: newPoints };
            setNotesData({ ...notesData, notes: newNotes });
        }
    };

    const addSection = () => {
        if (notesData) {
            setNotesData({
                ...notesData,
                notes: [...notesData.notes, { section: 'New Section', points: ['New insights here...'] }]
            });
        }
    };

    const addPoint = (sectionIndex) => {
        if (notesData) {
            const newNotes = [...notesData.notes];
            const newPoints = [...newNotes[sectionIndex].points, 'New point...'];
            newNotes[sectionIndex] = { ...newNotes[sectionIndex], points: newPoints };
            setNotesData({ ...notesData, notes: newNotes });
        }
    };

    const deleteSection = (sectionIndex) => {
        if (notesData) {
            const newNotes = notesData.notes.filter((_, i) => i !== sectionIndex);
            setNotesData({ ...notesData, notes: newNotes });
        }
    };

    const deletePoint = (sectionIndex, pointIndex) => {
        if (notesData) {
            const newNotes = [...notesData.notes];
            const newPoints = newNotes[sectionIndex].points.filter((_, i) => i !== pointIndex);
            newNotes[sectionIndex] = { ...newNotes[sectionIndex], points: newPoints };
            setNotesData({ ...notesData, notes: newNotes });
        }
    };

    if (!notesData || !notesData.notes || notesData.notes.length === 0) {
        return (
            React.createElement('div', { className: "flex flex-col items-center justify-center h-full text-center p-8 bg-[#0a0a0a] rounded-xl border border-[#222]"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 74}}
                , React.createElement('div', { className: "w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6 border border-[#333] shadow-inner"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 75}}
                    , React.createElement('svg', { className: "w-10 h-10 text-[#00ff88]"  , fill: "none", stroke: "currentColor", viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 76}}
                        , React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"                 , __self: this, __source: {fileName: _jsxFileName, lineNumber: 77}} )
                    )
                )
                , React.createElement('h3', { className: "text-2xl font-bold text-white mb-3"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 80}}, "Structured Study Notes"  )
                , React.createElement('p', { className: "text-gray-400 mb-8 max-w-sm leading-relaxed"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 81}}, "Transform your document into a highly organized set of study notes, categorized by domain and level of importance."

                )
                , React.createElement('button', {
                    onClick: () => onGenerate('notes'),
                    className: "group relative px-8 py-3.5 bg-[#00ff88] text-black rounded-xl text-sm font-black transition-all hover:bg-[#00dd77] active:scale-95 shadow-[0_5px_15px_rgba(0,255,136,0.3)]"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 84}}

                    , React.createElement('span', { className: "relative z-10 flex items-center gap-2"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 88}}, "GENERATE STUDY NOTES"

                        , React.createElement('svg', { className: "w-4 h-4 transition-transform group-hover:translate-x-1"   , fill: "none", stroke: "currentColor", viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 90}}, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 7l5 5m0 0l-5 5m5-5H6"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 90}} ))
                    )
                )
            )
        );
    }

    return (
        React.createElement('div', { className: "flex flex-col h-full bg-[#0a0a0a] rounded-xl border border-[#222] overflow-hidden shadow-2xl"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 98}}
            , React.createElement('div', { className: "flex items-center justify-between p-5 border-b border-[#222] bg-[#111]"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 99}}
                , React.createElement('div', { className: "flex items-center gap-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 100}}
                    , React.createElement('svg', { className: "w-5 h-5 text-[#00ff88]"  , fill: "none", stroke: "currentColor", viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 101}}, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"                                 , __self: this, __source: {fileName: _jsxFileName, lineNumber: 101}} ))
                    , React.createElement('h3', { className: "text-xs font-black text-white uppercase tracking-[0.3em]"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 102}}, "Module Overview" )
                )
                , React.createElement('button', {
                    onClick: () => onGenerate('notes'),
                    className: "px-4 py-2 bg-[#1a1a1a] text-[#00ff88] border border-[#00ff88]/20 rounded-lg text-xs font-bold hover:bg-[#00ff88]/10 transition-all flex items-center gap-2"             , __self: this, __source: {fileName: _jsxFileName, lineNumber: 104}}

                    , React.createElement('svg', { className: "w-3.5 h-3.5" , fill: "none", stroke: "currentColor", viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 108}}, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"             , __self: this, __source: {fileName: _jsxFileName, lineNumber: 108}} )), "REGENERATE"

                )
            )

            , React.createElement('div', { className: "flex-1 overflow-y-auto custom-scrollbar p-8"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 113}}
                , React.createElement('div', { className: "max-w-4xl mx-auto space-y-12"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 114}}
                    , React.createElement('div', { className: "flex flex-col gap-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 115}}
                        , React.createElement('h1', { className: "text-4xl font-black text-white tracking-tight"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 116}}, "Structured Notes" )
                        , React.createElement('p', { className: "text-[#666] text-sm uppercase tracking-widest font-mono"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 117}}, "Curated Knowledge Base"  )
                    )

                    , notesData.notes.map((noteSection, sectionIndex) => (
                        React.createElement('div', { key: sectionIndex, className: "group relative" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 121}}
                            , React.createElement('div', { className: "flex items-center gap-4 mb-6"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 122}}
                                , React.createElement('h3', {
                                    className: "text-lg font-bold text-[#00ff88] outline-none hover:text-white transition-colors flex-1"      ,
                                    contentEditable: true,
                                    suppressContentEditableWarning: true,
                                    onBlur: (e) => handleSectionTitleChange(e, sectionIndex), __self: this, __source: {fileName: _jsxFileName, lineNumber: 123}}

                                    , noteSection.section
                                )
                                , React.createElement('div', { className: "h-px flex-1 bg-gradient-to-r from-[#00ff88]/30 to-transparent"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 131}})
                                , React.createElement('button', {
                                    onClick: () => deleteSection(sectionIndex),
                                    className: "text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2"     ,
                                    title: "Delete Section" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 132}}

                                    , React.createElement('svg', { className: "w-4 h-4" , fill: "none", stroke: "currentColor", viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 137}}, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"                   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 137}} ))
                                )
                            )

                            , React.createElement('ul', { className: "space-y-4 ml-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 141}}
                                , noteSection.points.map((point, pointIndex) => (
                                    React.createElement('li', { key: pointIndex, className: "flex gap-4 group/item items-start"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 143}}
                                        , React.createElement('div', { className: "mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00ff88]/40 group-hover/item:bg-[#00ff88] transition-colors flex-shrink-0"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 144}})
                                        , React.createElement('div', {
                                            className: "flex-1 text-[#ccc] text-sm leading-relaxed outline-none focus:text-white group-hover/item:text-[#eee]"      ,
                                            contentEditable: true,
                                            suppressContentEditableWarning: true,
                                            onBlur: (e) => handlePointChange(e, sectionIndex, pointIndex), __self: this, __source: {fileName: _jsxFileName, lineNumber: 145}}

                                            , point
                                        )
                                        , React.createElement('button', {
                                            onClick: () => deletePoint(sectionIndex, pointIndex),
                                            className: "text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover/item:opacity-100 p-1"     ,
                                            title: "Delete Point" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 153}}

                                            , React.createElement('svg', { className: "w-3.5 h-3.5" , fill: "none", stroke: "currentColor", viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 158}}, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 158}} ))
                                        )
                                    )
                                ))
                            )

                            , React.createElement('button', {
                                onClick: () => addPoint(sectionIndex),
                                className: "mt-6 ml-6 text-[10px] font-black text-[#444] uppercase tracking-widest hover:text-[#00ff88] transition-all"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 164}}
, "+ Add Point to "
                                    , noteSection.section
                            )
                        )
                    ))

                    , React.createElement('button', {
                        onClick: addSection,
                        className: "w-full py-6 border-2 border-[#1a1a1a] border-dashed rounded-2xl text-xs font-black text-[#444] uppercase tracking-widest hover:text-[#00ff88] hover:border-[#00ff88]/30 hover:bg-[#00ff88]/5 transition-all"              , __self: this, __source: {fileName: _jsxFileName, lineNumber: 173}}
, "+ Create Functional Category"

                    )
                )
            )

            , React.createElement('div', { className: "p-6 bg-[#0f0f0f] border-t border-[#222] flex justify-end gap-4"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 182}}
                , React.createElement('button', { className: "px-5 py-2.5 text-[#00ff88] text-xs font-black uppercase tracking-widest hover:bg-[#00ff88]/5 rounded-xl transition-all"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 183}}, "Archive")
                , React.createElement('button', { className: "px-6 py-2.5 bg-white text-black rounded-xl text-xs font-bold hover:bg-gray-200 transition-all shadow-xl active:scale-95"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 184}}, "EXPORT TO MD"  )
            )
        )
    );
};

export default Notes;