'use client';
const _jsxFileName = "j:\\antigravity\\pdfx\\src\\components\\Flashcards.tsx";import React, { useState } from 'react';
import { useStore } from '../store/useStore';











const Flashcards = ({ onGenerate }) => {
    const {
        flashcardsData, setFlashcardsData,
    } = useStore();

    const [flippedCards, setFlippedCards] = useState([]);

    const handleCardClick = (e, index) => {
        // Only flip if not clicking on an editable element
        if ((e.target ).isContentEditable) return;

        setFlippedCards(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const handleContentChange = (e, index, field) => {
        if (flashcardsData) {
            const newCards = [...flashcardsData.flashcards];
            newCards[index] = { ...newCards[index], [field]: e.currentTarget.innerText };
            setFlashcardsData({ ...flashcardsData, flashcards: newCards });
        }
    };

    const addCard = () => {
        if (flashcardsData) {
            setFlashcardsData({
                ...flashcardsData,
                flashcards: [...flashcardsData.flashcards, { question: 'New Question', answer: 'New Answer' }]
            });
        }
    };

    const deleteCard = (index) => {
        if (flashcardsData) {
            const newCards = flashcardsData.flashcards.filter((_, i) => i !== index);
            setFlashcardsData({ ...flashcardsData, flashcards: newCards });
        }
    };

    if (!flashcardsData || !flashcardsData.flashcards || flashcardsData.flashcards.length === 0) {
        return (
            React.createElement('div', { className: "flex flex-col items-center justify-center h-full text-center p-8 bg-[#0a0a0a] rounded-xl border border-[#222]"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 56}}
                , React.createElement('div', { className: "w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6 border border-[#333] shadow-inner text-[#00ff88]"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 57}}
                    , React.createElement('svg', { className: "w-10 h-10" , fill: "none", stroke: "currentColor", viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 58}}
                        , React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"                   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 59}} )
                    )
                )
                , React.createElement('h3', { className: "text-2xl font-bold text-white mb-3"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 62}}, "Self-Quizzing Flashcards" )
                , React.createElement('p', { className: "text-gray-400 mb-8 max-w-sm leading-relaxed"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 63}}, "Generate interactive flashcards to test your knowledge. Flip to reveal answers and edit them to match your learning style."

                )
                , React.createElement('button', {
                    onClick: () => onGenerate('flashcards'),
                    className: "px-8 py-3.5 bg-[#00ff88] text-black rounded-xl text-sm font-black transition-all hover:bg-[#00dd77] active:scale-95 shadow-[0_5px_15px_rgba(0,255,136,0.3)]"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 66}}
, "GENERATE CARDS"

                )
            )
        );
    }

    return (
        React.createElement('div', { className: "flex flex-col h-full bg-[#0a0a0a] rounded-xl border border-[#222] overflow-hidden shadow-2xl"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 77}}
            , React.createElement('div', { className: "flex items-center justify-between p-5 border-b border-[#222] bg-[#111]"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 78}}
                , React.createElement('div', { className: "flex items-center gap-3 text-[#00ff88]"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 79}}
                    , React.createElement('svg', { className: "w-5 h-5" , fill: "none", stroke: "currentColor", viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 80}}, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"                                 , __self: this, __source: {fileName: _jsxFileName, lineNumber: 80}} ))
                    , React.createElement('h3', { className: "text-xs font-black text-white uppercase tracking-[0.3em]"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 81}}, "Knowledge Deck" )
                )
                , React.createElement('button', {
                    onClick: () => onGenerate('flashcards'),
                    className: "px-4 py-2 bg-[#1a1a1a] text-[#00ff88] border border-[#00ff88]/20 rounded-lg text-xs font-bold hover:bg-[#00ff88]/10 transition-all flex items-center gap-2"             , __self: this, __source: {fileName: _jsxFileName, lineNumber: 83}}
, "REGENERATE"

                )
            )

            , React.createElement('div', { className: "flex-1 overflow-y-auto custom-scrollbar p-8"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 91}}
                , React.createElement('p', { className: "text-[#666] text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-center"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 92}}, "Interactive Sessions • Click to reveal"     )
                , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 93}}
                    , flashcardsData.flashcards.map((card, index) => (
                        React.createElement('div', { key: index, className: "relative group" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 95}}
                            , React.createElement('div', { className: "absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 96}}
                                , React.createElement('button', {
                                    onClick: (e) => {
                                        e.stopPropagation();
                                        deleteCard(index);
                                    },
                                    className: "p-2 bg-[#111]/80 rounded-full text-gray-400 hover:text-red-500 hover:bg-[#111] border border-[#222] transition-colors shadow-lg backdrop-blur-sm"          ,
                                    title: "Delete Card" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 97}}

                                    , React.createElement('svg', { className: "w-4 h-4" , fill: "none", stroke: "currentColor", viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 105}}, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"                   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 105}} ))
                                )
                            )
                            , React.createElement('div', {
                                className: "perspective-1000 h-64 cursor-pointer"  ,
                                onClick: (e) => handleCardClick(e, index), __self: this, __source: {fileName: _jsxFileName, lineNumber: 108}}

                                , React.createElement('div', { className: `relative w-full h-full transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] transform-style-preserve-3d ${flippedCards.includes(index) ? 'rotate-y-180' : ''}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 112}}
                                    /* Front */
                                    , React.createElement('div', { className: "absolute w-full h-full backface-hidden rounded-xl flex flex-col p-6 bg-[#111] border border-[#222] group-hover:border-[#00ff88]/30 transition-colors shadow-xl"             , __self: this, __source: {fileName: _jsxFileName, lineNumber: 114}}
                                        , React.createElement('div', { className: "flex justify-between items-start mb-4"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 115}}
                                            , React.createElement('span', { className: "text-[10px] font-black text-[#444] uppercase tracking-widest"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 116}}, "Question " , index + 1)
                                            , React.createElement('div', { className: "w-1.5 h-1.5 rounded-full bg-[#00ff88]/20"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 117}})
                                        )
                                        , React.createElement('p', {
                                            className: "flex-1 text-sm font-bold text-center text-white flex items-center justify-center outline-none focus:text-[#00ff88]"         ,
                                            contentEditable: true,
                                            suppressContentEditableWarning: true,
                                            onBlur: (e) => handleContentChange(e, index, 'question'), __self: this, __source: {fileName: _jsxFileName, lineNumber: 119}}

                                            , card.question
                                        )
                                    )
                                    /* Back */
                                    , React.createElement('div', { className: "absolute w-full h-full backface-hidden rounded-xl flex flex-col p-6 bg-gradient-to-br from-[#00ff88] to-[#00cc66] text-black transform rotate-y-180 shadow-[0_0_30px_rgba(0,255,136,0.2)]"              , __self: this, __source: {fileName: _jsxFileName, lineNumber: 129}}
                                        , React.createElement('div', { className: "flex justify-between items-start mb-4"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 130}}
                                            , React.createElement('span', { className: "text-[10px] font-black text-black/40 uppercase tracking-widest"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 131}}, "The Truth" )
                                            , React.createElement('svg', { className: "w-4 h-4 text-black/20"  , fill: "currentColor", viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 132}}, React.createElement('path', { d: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 132}} ))
                                        )
                                        , React.createElement('p', {
                                            className: "flex-1 text-sm font-black text-center flex items-center justify-center outline-none"       ,
                                            contentEditable: true,
                                            suppressContentEditableWarning: true,
                                            onBlur: (e) => handleContentChange(e, index, 'answer'), __self: this, __source: {fileName: _jsxFileName, lineNumber: 134}}

                                            , card.answer
                                        )
                                    )
                                )
                            )
                        )
                    ))

                    , React.createElement('button', {
                        onClick: addCard,
                        className: "h-64 border-2 border-[#1a1a1a] border-dashed rounded-2xl flex flex-col items-center justify-center text-[#444] hover:text-[#00ff88] hover:border-[#00ff88]/30 hover:bg-[#00ff88]/5 transition-all group"              , __self: this, __source: {fileName: _jsxFileName, lineNumber: 148}}

                        , React.createElement('svg', { className: "w-8 h-8 mb-4 opacity-20 group-hover:opacity-100 transition-opacity"     , fill: "none", stroke: "currentColor", viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 152}}, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6v6m0 0v6m0-6h6m-6 0H6"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 152}} ))
                        , React.createElement('span', { className: "text-[10px] font-black uppercase tracking-widest"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 153}}, "Append New Card"  )
                    )
                )
            )

            , React.createElement('div', { className: "p-6 bg-[#0f0f0f] border-t border-[#222] flex justify-between items-center"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 158}}
                , React.createElement('button', { className: "text-[10px] font-black text-[#444] uppercase tracking-widest hover:text-white transition-all"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 159}}, "Clear Session" )
                , React.createElement('button', { className: "px-8 py-2.5 bg-[#00ff88] text-black rounded-xl text-xs font-bold hover:bg-[#00dd77] transition-all shadow-xl active:scale-95"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 160}}, "START QUARTERLY REVIEW"  )
            )
        )
    );
};

export default Flashcards;