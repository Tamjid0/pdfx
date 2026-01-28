
import React, { useState, useEffect } from 'react';
import { useStore, type Mode, type QuizItem } from '../store/useStore';
import LocalizedShimmer from './LocalizedShimmer';

// Local types removed, using QuizItem from store

interface QuizProps {
    onGenerate: (mode: Mode) => void;
}

const Quiz: React.FC<QuizProps> = ({ onGenerate }) => {
    const {
        quizData, setQuizData, openExportModal, isGeneratingQuiz,
        switchRevision, deleteRevision, renameRevision, quizRevisions
    } = useStore();

    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>({});
    const [showResults, setShowResults] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);

    useEffect(() => {
        setSelectedAnswers({});
        setShowResults(false);
        setScore(0);
    }, [quizData]);

    const handleQuestionChange = (e: React.FocusEvent<HTMLHeadingElement>, index: number) => {
        if (quizData) {
            const newQuiz = [...quizData.quiz];
            // We need to assert question property exists, which it does on all QuizQuestion variants
            // But TS might complain if it infers specific union members.
            // Using a cast or just direct assignment if TS is smart enough.
            // Simplified update:
            const updatedQuestion = { ...newQuiz[index], question: e.currentTarget.innerText } as QuizItem;
            newQuiz[index] = updatedQuestion;
            setQuizData({ ...quizData, quiz: newQuiz });
        }
    };

    const handleAnswerChange = (questionIndex: number, value: any) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [`q${questionIndex}`]: value,
        }));
    };

    const checkQuiz = () => {
        if (!quizData) return;
        let currentScore = 0;
        quizData.quiz.forEach((q: QuizItem, index: number) => {
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
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[#0a0a0a] rounded-xl border border-[#222]">
                {isGeneratingQuiz ? (
                    <div className="w-full max-w-md">
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-12 h-12 bg-gemini-green/5 rounded-2xl flex items-center justify-center mb-4 border border-gemini-green/10">
                                <div className="w-6 h-6 border-2 border-gemini-green border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.3em]">Drafting Questions...</h3>
                        </div>
                        <LocalizedShimmer blocks={3} />
                    </div>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6 border border-[#333] shadow-inner text-[#00ff88]">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Adaptive Quiz Engine</h3>
                        <p className="text-gray-400 mb-8 max-w-sm leading-relaxed">
                            Challenge yourself with dynamically generated questions. We support Multiple Choice, True/False, and Fill-in-the-blank formats.
                        </p>
                        <button
                            onClick={() => onGenerate('quiz')}
                            className="px-8 py-3.5 bg-[#00ff88] text-black rounded-xl text-sm font-black transition-all hover:bg-[#00dd77] active:scale-95 shadow-[0_5px_15px_rgba(0,255,136,0.3)]"
                        >
                            INITIALIZE ASSESSMENT
                        </button>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] rounded-xl border border-[#222] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-[#222] bg-[#111]">
                <div className="flex items-center gap-3">
                    <div className="px-2 py-0.5 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded text-[9px] font-black text-[#00ff88] uppercase tracking-tighter">Live Session</div>
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Mastery Test</h3>
                </div>
                <button
                    onClick={() => onGenerate('quiz')}
                    disabled={isGeneratingQuiz}
                    className="px-4 py-2 bg-[#1a1a1a] text-[#00ff88] border border-[#00ff88]/20 rounded-lg text-xs font-bold hover:bg-[#00ff88]/10 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {isGeneratingQuiz ? (
                        <div className="w-3 h-3 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    )}
                    {isGeneratingQuiz ? 'DRAFTING...' : 'RESET & REGENERATE'}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    {quizData.quiz.map((q: QuizItem, qIndex: number) => (
                        <div key={qIndex} className={`group relative bg-[#111] border border-[#222] rounded-2xl p-6 transition-all ${showResults ? 'opacity-80' : 'hover:border-[#333]'}`}>
                            <div className="flex items-start gap-4 mb-6">
                                <span className="text-xs font-black text-[#444] mt-1 font-mono">{(qIndex + 1).toString().padStart(2, '0')}</span>
                                <h4
                                    className="text-base font-bold text-white outline-none focus:text-[#00ff88] transition-colors"
                                    contentEditable={!showResults}
                                    suppressContentEditableWarning={true}
                                    onBlur={(e) => handleQuestionChange(e, qIndex)}
                                >
                                    {q.question}
                                </h4>
                            </div>

                            <div className="space-y-2 ml-8">
                                {q.type === 'mc' && q.options.map((opt, oIdx) => (
                                    <button
                                        key={oIdx}
                                        disabled={showResults}
                                        onClick={() => handleAnswerChange(qIndex, opt.value)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-start justify-between group/opt 
                                            ${selectedAnswers[`q${qIndex}`] === opt.value ? 'bg-[#00ff88]/10 border-[#00ff88] text-white' : 'bg-[#1a1a1a] border-[#222] text-[#888] hover:border-[#333] hover:text-[#ccc]'}
                                            ${showResults && opt.value === q.correctAnswer ? '!bg-[#00ff88]/20 !border-[#00ff88] !text-[#00ff88]' : ''}
                                            ${showResults && selectedAnswers[`q${qIndex}`] === opt.value && opt.value !== q.correctAnswer ? '!bg-[#ff4444]/10 !border-[#ff4444] !text-[#ff4444]' : ''}
                                        `}
                                    >
                                        <div className="flex gap-3 items-start flex-1">
                                            <span className="text-xs font-black opacity-50">{opt.label}.</span>
                                            <span className="text-sm font-semibold flex-1">{opt.value}</span>
                                        </div>
                                        {showResults && opt.value === q.correctAnswer && <svg className="w-5 h-5 text-[#00ff88] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
                                    </button>
                                ))}

                                {q.type === 'tf' && [true, false].map((opt, oIdx) => (
                                    <button
                                        key={oIdx}
                                        disabled={showResults}
                                        onClick={() => handleAnswerChange(qIndex, opt)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between 
                                            ${selectedAnswers[`q${qIndex}`] === opt ? 'bg-[#00ff88]/10 border-[#00ff88] text-white' : 'bg-[#1a1a1a] border-[#222] text-[#888] hover:border-[#333] hover:text-[#ccc]'}
                                            ${showResults && String(opt) === String(q.correctAnswer) ? '!bg-[#00ff88]/20 !border-[#00ff88] !text-[#00ff88]' : ''}
                                            ${showResults && selectedAnswers[`q${qIndex}`] === opt && String(opt) !== String(q.correctAnswer) ? '!bg-[#ff4444]/10 !border-[#ff4444] !text-[#ff4444]' : ''}
                                        `}
                                    >
                                        <span className="text-sm font-semibold">{opt ? 'True' : 'False'}</span>
                                    </button>
                                ))}

                                {q.type === 'fib' && (
                                    <input
                                        type="text"
                                        disabled={showResults}
                                        placeholder="Type your answer..."
                                        value={selectedAnswers[`q${qIndex}`] || ''}
                                        onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
                                        className={`w-full p-4 bg-[#1a1a1a] border rounded-xl text-sm font-bold transition-all outline-none
                                            ${showResults ? (selectedAnswers[`q${qIndex}`]?.toLowerCase() === q.correctAnswer.toLowerCase() ? 'border-[#00ff88] text-[#00ff88]' : 'border-[#ff4444] text-[#ff4444]') : 'border-[#222] text-white focus:border-[#00ff88]/50'}
                                        `}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-8 bg-[#0f0f0f] border-t border-[#222] flex flex-col gap-6">
                {!showResults ? (
                    <button
                        className="w-full py-4 bg-[#00ff88] text-black rounded-2xl text-sm font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(0,255,136,0.2)] hover:bg-[#00dd77] hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={checkQuiz}
                        disabled={Object.keys(selectedAnswers).length < quizData.quiz.length}
                    >
                        Submit Assessment
                    </button>
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-[#444] uppercase tracking-widest mb-1">Final Result</span>
                            <div className="text-2xl font-black text-white">{score} <span className="text-[#444] text-lg">/ {quizData.quiz.length}</span></div>
                        </div>
                        <div className="flex-1 px-8">
                            <div className="h-2 w-full bg-[#111] rounded-full overflow-hidden">
                                <div className="h-full bg-[#00ff88] transition-all duration-1000" style={{ width: `${(score / quizData.quiz.length) * 100}%` }}></div>
                            </div>
                        </div>
                        <button
                            className="px-6 py-3 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all mr-2 disabled:opacity-50"
                            onClick={() => onGenerate('quiz')}
                            disabled={isGeneratingQuiz}
                        >
                            {isGeneratingQuiz ? 'DRAFTING...' : 'Try Again'}
                        </button>
                        <button
                            className="px-6 py-3 bg-[#00ff88] text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#00dd77] transition-all shadow-xl"
                            onClick={() => openExportModal('quiz', quizData)}
                        >
                            Export Quiz
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Quiz;
