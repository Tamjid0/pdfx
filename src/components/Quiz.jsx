'use client';
const _jsxFileName = "j:\\antigravity\\pdfx\\src\\components\\Quiz.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';





















const Quiz = ({ onGenerate }) => {
    const {
        quizData, setQuizData,
    } = useStore();

    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        setSelectedAnswers({});
        setShowResults(false);
        setScore(0);
    }, [quizData]);

    const handleQuestionChange = (e, index) => {
        if (quizData) {
            const newQuiz = [...quizData.quiz];
            newQuiz[index] = { ...newQuiz[index], question: e.currentTarget.innerText };
            setQuizData({ ...quizData, quiz: newQuiz });
        }
    };

    const handleAnswerChange = (questionIndex, value) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [`q${questionIndex}`]: value,
        }));
    };

    const checkQuiz = () => {
        if (!quizData) return;
        let currentScore = 0;
        quizData.quiz.forEach((q, index) => {
            const userAnswer = selectedAnswers[`q${index}`];
            if (q.type === 'tf' || q.type === 'mc') {
                if (userAnswer === q.correctAnswer) {
                    currentScore++;
                }
            } else if (q.type === 'fib') {
                if (typeof userAnswer === 'string' && typeof q.correctAnswer === 'string' && userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
                    currentScore++;
                }
            }
        });
        setScore(currentScore);
        setShowResults(true);
    };

    if (!quizData || !quizData.quiz || quizData.quiz.length === 0) {
        return (
            React.createElement('div', { className: "flex flex-col items-center justify-center h-full text-center p-8 bg-[#0a0a0a] rounded-xl border border-[#222]"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 75}}
                , React.createElement('div', { className: "w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6 border border-[#333] shadow-inner text-[#00ff88]"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 76}}
                    , React.createElement('svg', { className: "w-10 h-10" , fill: "none", stroke: "currentColor", viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 77}}
                        , React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"                         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 78}} )
                    )
                )
                , React.createElement('h3', { className: "text-2xl font-bold text-white mb-3"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 81}}, "Adaptive Quiz Engine"  )
                , React.createElement('p', { className: "text-gray-400 mb-8 max-w-sm leading-relaxed"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 82}}, "Challenge yourself with dynamically generated questions. We support Multiple Choice, True/False, and Fill-in-the-blank formats."

                )
                , React.createElement('button', {
                    onClick: () => onGenerate('quiz'),
                    className: "px-8 py-3.5 bg-[#00ff88] text-black rounded-xl text-sm font-black transition-all hover:bg-[#00dd77] active:scale-95 shadow-[0_5px_15px_rgba(0,255,136,0.3)]"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 85}}
, "INITIALIZE ASSESSMENT"

                )
            )
        );
    }

    return (
        React.createElement('div', { className: "flex flex-col h-full bg-[#0a0a0a] rounded-xl border border-[#222] overflow-hidden shadow-2xl"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 96}}
            , React.createElement('div', { className: "flex items-center justify-between p-5 border-b border-[#222] bg-[#111]"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 97}}
                , React.createElement('div', { className: "flex items-center gap-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 98}}
                    , React.createElement('div', { className: "px-2 py-0.5 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded text-[9px] font-black text-[#00ff88] uppercase tracking-tighter"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 99}}, "Live Session" )
                    , React.createElement('h3', { className: "text-xs font-black text-white uppercase tracking-[0.3em]"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 100}}, "Mastery Test" )
                )
                , React.createElement('button', {
                    onClick: () => onGenerate('quiz'),
                    className: "px-4 py-2 bg-[#1a1a1a] text-[#00ff88] border border-[#00ff88]/20 rounded-lg text-xs font-bold hover:bg-[#00ff88]/10 transition-all"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 102}}
, "RESET & REGENERATE"

                )
            )

            , React.createElement('div', { className: "flex-1 overflow-y-auto custom-scrollbar p-8"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 110}}
                , React.createElement('div', { className: "max-w-3xl mx-auto space-y-8"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 111}}
                    , quizData.quiz.map((q, qIndex) => (
                        React.createElement('div', { key: qIndex, className: `group relative bg-[#111] border border-[#222] rounded-2xl p-6 transition-all ${showResults ? 'opacity-80' : 'hover:border-[#333]'}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 113}}
                            , React.createElement('div', { className: "flex items-start gap-4 mb-6"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 114}}
                                , React.createElement('span', { className: "text-xs font-black text-[#444] mt-1 font-mono"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 115}}, (qIndex + 1).toString().padStart(2, '0'))
                                , React.createElement('h4', {
                                    className: "text-base font-bold text-white outline-none focus:text-[#00ff88] transition-colors"     ,
                                    contentEditable: !showResults,
                                    suppressContentEditableWarning: true,
                                    onBlur: (e) => handleQuestionChange(e, qIndex), __self: this, __source: {fileName: _jsxFileName, lineNumber: 116}}

                                    , q.question
                                )
                            )

                            , React.createElement('div', { className: "space-y-2 ml-8" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 126}}
                                , q.type === 'mc' && q.options.map((opt, oIdx) => (
                                    React.createElement('button', {
                                        key: oIdx,
                                        disabled: showResults,
                                        onClick: () => handleAnswerChange(qIndex, opt.value),
                                        className: `w-full text-left p-4 rounded-xl border transition-all flex items-start justify-between group/opt 
                                            ${selectedAnswers[`q${qIndex}`] === opt.value ? 'bg-[#00ff88]/10 border-[#00ff88] text-white' : 'bg-[#1a1a1a] border-[#222] text-[#888] hover:border-[#333] hover:text-[#ccc]'}
                                            ${showResults && opt.value === q.correctAnswer ? '!bg-[#00ff88]/20 !border-[#00ff88] !text-[#00ff88]' : ''}
                                            ${showResults && selectedAnswers[`q${qIndex}`] === opt.value && opt.value !== q.correctAnswer ? '!bg-[#ff4444]/10 !border-[#ff4444] !text-[#ff4444]' : ''}
                                        `, __self: this, __source: {fileName: _jsxFileName, lineNumber: 128}}

                                        , React.createElement('div', { className: "flex gap-3 items-start flex-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 138}}
                                            , React.createElement('span', { className: "text-xs font-black opacity-50"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 139}}, opt.label, ".")
                                            , React.createElement('span', { className: "text-sm font-semibold flex-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 140}}, opt.value)
                                        )
                                        , showResults && opt.value === q.correctAnswer && React.createElement('svg', { className: "w-5 h-5 text-[#00ff88] flex-shrink-0"   , fill: "currentColor", viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 142}}, React.createElement('path', { d: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 142}} ))
                                    )
                                ))

                                , q.type === 'tf' && [true, false].map((opt, oIdx) => (
                                    React.createElement('button', {
                                        key: oIdx,
                                        disabled: showResults,
                                        onClick: () => handleAnswerChange(qIndex, opt),
                                        className: `w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between 
                                            ${selectedAnswers[`q${qIndex}`] === opt ? 'bg-[#00ff88]/10 border-[#00ff88] text-white' : 'bg-[#1a1a1a] border-[#222] text-[#888] hover:border-[#333] hover:text-[#ccc]'}
                                            ${showResults && opt === q.correctAnswer ? '!bg-[#00ff88]/20 !border-[#00ff88] !text-[#00ff88]' : ''}
                                            ${showResults && selectedAnswers[`q${qIndex}`] === opt && opt !== q.correctAnswer ? '!bg-[#ff4444]/10 !border-[#ff4444] !text-[#ff4444]' : ''}
                                        `, __self: this, __source: {fileName: _jsxFileName, lineNumber: 147}}

                                        , React.createElement('span', { className: "text-sm font-semibold" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 157}}, opt ? 'True' : 'False')
                                    )
                                ))

                                , q.type === 'fib' && (
                                    React.createElement('input', {
                                        type: "text",
                                        disabled: showResults,
                                        placeholder: "Type your answer..."  ,
                                        value: selectedAnswers[`q${qIndex}`] || '',
                                        onChange: (e) => handleAnswerChange(qIndex, e.target.value),
                                        className: `w-full p-4 bg-[#1a1a1a] border rounded-xl text-sm font-bold transition-all outline-none
                                            ${showResults ? (_optionalChain([selectedAnswers, 'access', _ => _[`q${qIndex}`], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]) === q.correctAnswer.toLowerCase() ? 'border-[#00ff88] text-[#00ff88]' : 'border-[#ff4444] text-[#ff4444]') : 'border-[#222] text-white focus:border-[#00ff88]/50'}
                                        `, __self: this, __source: {fileName: _jsxFileName, lineNumber: 162}}
                                    )
                                )
                            )
                        )
                    ))
                )
            )

            , React.createElement('div', { className: "p-8 bg-[#0f0f0f] border-t border-[#222] flex flex-col gap-6"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 179}}
                , !showResults ? (
                    React.createElement('button', {
                        className: "w-full py-4 bg-[#00ff88] text-black rounded-2xl text-sm font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(0,255,136,0.2)] hover:bg-[#00dd77] hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed"              ,
                        onClick: checkQuiz,
                        disabled: Object.keys(selectedAnswers).length < quizData.quiz.length, __self: this, __source: {fileName: _jsxFileName, lineNumber: 181}}
, "Submit Assessment"

                    )
                ) : (
                    React.createElement('div', { className: "flex items-center justify-between"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 189}}
                        , React.createElement('div', { className: "flex flex-col" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 190}}
                            , React.createElement('span', { className: "text-[10px] font-black text-[#444] uppercase tracking-widest mb-1"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 191}}, "Final Result" )
                            , React.createElement('div', { className: "text-2xl font-black text-white"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 192}}, score, " " , React.createElement('span', { className: "text-[#444] text-lg" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 192}}, "/ " , quizData.quiz.length))
                        )
                        , React.createElement('div', { className: "flex-1 px-8" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 194}}
                            , React.createElement('div', { className: "h-2 w-full bg-[#111] rounded-full overflow-hidden"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 195}}
                                , React.createElement('div', { className: "h-full bg-[#00ff88] transition-all duration-1000"   , style: { width: `${(score / quizData.quiz.length) * 100}%` }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 196}})
                            )
                        )
                        , React.createElement('button', {
                            className: "px-6 py-3 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all"          ,
                            onClick: () => onGenerate('quiz'), __self: this, __source: {fileName: _jsxFileName, lineNumber: 199}}
, "Try Again"

                        )
                    )
                )
            )
        )
    );
};

export default Quiz;