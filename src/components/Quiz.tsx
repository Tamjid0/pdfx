import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useStore, type Mode, type QuizItem, type QuizData } from '../store/useStore';
import LocalizedShimmer from './LocalizedShimmer';
import { VersionTabs } from './dashboard/VersionTabs';
import { toast } from 'react-hot-toast';
import GenerationScopeSelector from './dashboard/GenerationScopeSelector';

interface QuizProps {
    onGenerate: (mode: Mode) => void;
}

type QuizPhase = 'setup' | 'exam' | 'results';

const Quiz: React.FC<QuizProps> = ({ onGenerate }) => {
    const {
        quizData, setQuizData, openExportModal, isGeneratingQuiz,
        switchRevision, deleteRevision, renameRevision, quizRevisions, loadProjectModule,
        activeRevisionIds, stats, quizSettings, setQuizSettings, generationScope
    } = useStore();

    const activeRevisionId = activeRevisionIds['quiz'];

    // --- Phase and State Management ---
    const [phase, setPhase] = useState<QuizPhase>('setup');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [examResults, setExamResults] = useState<{ score: number; timeTaken: number } | null>(null);
    const [showRegenerateScope, setShowRegenerateScope] = useState(false);
    const [sessionStartTime, setSessionStartTime] = useState(0);

    // --- Dynamic Estimation ---
    const estimatedQuestions = useMemo(() => {
        const words = stats.wordCount || 0;
        return Math.min(30, Math.max(5, Math.floor(words / 150)));
    }, [stats.wordCount]);

    // Reset local state when data changes (e.g., switches revisions or generates new)
    useEffect(() => {
        if (quizData?.quiz?.length) {
            setPhase('setup');
            setCurrentIndex(0);
            setSelectedAnswers({});
            setExamResults(null);
            setShowRegenerateScope(false);
        }
    }, [quizData]);

    // --- Timer Logic ---
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (phase === 'exam' && quizSettings.quizMode === 'exam' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setPhase('results');
                        finishExam();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [phase, timeLeft, quizSettings.quizMode]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // --- Actions ---
    const startExam = () => {
        if (!quizData?.quiz?.length) return;
        const isExamMode = quizSettings.quizMode === 'exam';
        const totalTime = isExamMode ? (quizSettings.timeLimit || 10) * 60 : 0;

        setTimeLeft(totalTime);
        setSessionStartTime(Date.now());
        setPhase('exam');
        setCurrentIndex(0);
        setSelectedAnswers({});
    };

    const finishExam = useCallback(() => {
        if (!quizData?.quiz) return;
        let currentScore = 0;
        quizData.quiz.forEach((q, index) => {
            const userAnswer = selectedAnswers[`q${index}`];
            if (q.type === 'tf' || q.type === 'mc') {
                if (userAnswer === q.correctAnswer) currentScore++;
            } else if (q.type === 'fib') {
                if (typeof userAnswer === 'string' && typeof q.correctAnswer === 'string' &&
                    userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
                    currentScore++;
                }
            }
        });

        const timeTaken = Math.floor((Date.now() - sessionStartTime) / 1000);
        setExamResults({
            score: currentScore,
            timeTaken
        });
        setPhase('results');
    }, [quizData, selectedAnswers, sessionStartTime]);

    const handleAnswerChange = (questionIndex: number, value: any) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [`q${questionIndex}`]: value,
        }));
    };

    // --- Renderers ---

    if (isGeneratingQuiz) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[#0a0a0a] rounded-xl border border-[#222]">
                <div className="w-full max-w-md">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-[#00ff88]/5 rounded-3xl flex items-center justify-center mb-4 border border-[#00ff88]/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#00ff88]/20 to-transparent animate-pulse"></div>
                            <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.4em] animate-pulse">Synthesis in Progress</h3>
                        <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest leading-loose">Engineering unique challenges based on your document content...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!quizData || !quizData.quiz || quizData.quiz.length === 0) {
        return (
            <div className="flex flex-col h-full bg-[#0a0a0a] rounded-xl border border-[#222] overflow-y-auto custom-scrollbar">
                <div className="p-10 max-w-4xl mx-auto w-full space-y-12">
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-[#00ff88]/5 rounded-[2.5rem] flex items-center justify-center mx-auto border border-[#00ff88]/10 shadow-2xl">
                            <svg className="w-10 h-10 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h3 className="text-3xl font-black text-white tracking-tight">Document Intelligence</h3>
                        <p className="text-gray-500 max-w-md mx-auto leading-relaxed text-sm">
                            Analyze your material to engineer a custom assessment grid.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Analysis Column */}
                        <div className="space-y-6">
                            <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 space-y-6">
                                <div className="flex items-center gap-3">
                                    <span className="w-1 h-4 bg-[#00ff88] rounded-full"></span>
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Material Analysis</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 rounded-2xl p-4">
                                        <div className="text-2xl font-black text-white">{stats.pageCount || 1}</div>
                                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Pages</div>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4">
                                        <div className="text-2xl font-black text-white">{stats.wordCount.toLocaleString()}</div>
                                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Words</div>
                                    </div>
                                </div>
                                <div className="p-4 bg-[#00ff88]/5 border border-[#00ff88]/10 rounded-2xl">
                                    <p className="text-[11px] text-[#00ff88]/80 leading-relaxed italic">
                                        "Recommended density detected at <strong>{estimatedQuestions} items</strong> based on content volume."
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 space-y-6">
                                <div className="flex items-center gap-3">
                                    <span className="w-1 h-4 bg-[#00ff88] rounded-full"></span>
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Target Context</h4>
                                </div>
                                <GenerationScopeSelector />
                            </div>
                        </div>

                        {/* Configuration Column */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-10">
                            <div className="flex items-center gap-3">
                                <span className="w-1 h-4 bg-[#00ff88] rounded-full"></span>
                                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Parameters</h4>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Question Payload</span>
                                    <span className="text-2xl font-black text-[#00ff88]">{quizSettings.questionCount || estimatedQuestions}</span>
                                </div>
                                <input
                                    type="range" min="5" max="50" step="5"
                                    value={quizSettings.questionCount || estimatedQuestions}
                                    onChange={(e) => setQuizSettings({ ...quizSettings, questionCount: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#00ff88]"
                                />
                            </div>

                            <div className="space-y-4">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Complexity Level</span>
                                <div className="flex gap-2">
                                    {['easy', 'medium', 'hard'].map((lvl) => (
                                        <button
                                            key={lvl}
                                            onClick={() => setQuizSettings({ ...quizSettings, difficulty: lvl })}
                                            className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${quizSettings.difficulty === lvl
                                                ? 'bg-[#00ff88] text-black border-transparent'
                                                : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'
                                                }`}
                                        >
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => onGenerate('quiz')}
                                className="w-full py-5 bg-[#ffffff] text-black rounded-[2rem] text-xs font-black transition-all hover:bg-[#00ff88] active:scale-95 shadow-2xl flex items-center justify-center gap-3 uppercase tracking-[0.2em]"
                            >
                                Generate Assessment
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- PHASE: SETUP ---
    if (phase === 'setup') {
        return (
            <div className="flex flex-col h-full bg-[#0a0a0a] rounded-xl border border-[#222] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-[#222]">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse"></div>
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Configure Assessment</h3>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowRegenerateScope(!showRegenerateScope)}
                            className="px-4 py-2 bg-[#1a1a1a] text-[#00ff88] border border-[#00ff88]/20 rounded-lg text-xs font-bold hover:bg-[#00ff88]/10 transition-all flex items-center gap-2"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            {generationScope.type === 'all' ? 'FULL SCOPE' : 'CUSTOM SCOPE'}
                        </button>

                        {showRegenerateScope && (
                            <div className="absolute top-full right-0 mt-3 w-80 bg-[#111] border border-[#222] rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] animate-in fade-in zoom-in-95 duration-200 text-left">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Adjust Context</h4>
                                    <button onClick={() => setShowRegenerateScope(false)} className="text-white/20 hover:text-white transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                                <GenerationScopeSelector className="!space-y-4" />
                                <button
                                    onClick={() => onGenerate('quiz')}
                                    className="w-full mt-6 py-3 bg-[#00ff88] text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#00dd77] transition-all shadow-[0_10px_20px_rgba(0,255,136,0.2)]"
                                >
                                    Confirm & Regenerate
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <VersionTabs
                    module="quiz"
                    revisions={quizRevisions}
                    activeRevisionId={activeRevisionId}
                    onSwitch={(revId) => switchRevision('quiz', revId)}
                    onNew={() => onGenerate('quiz')}
                    onRename={async (revId, name) => renameRevision('quiz', revId, name)}
                    onDelete={async (revId) => deleteRevision('quiz', revId)}
                />

                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    <div className="max-w-2xl mx-auto space-y-12">
                        {/* Mode Selection */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Session Profile</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setQuizSettings({ ...quizSettings, quizMode: 'normal' })}
                                    className={`p-6 rounded-3xl border transition-all flex flex-col gap-2 ${quizSettings.quizMode === 'normal'
                                        ? 'bg-[#00ff88]/10 border-[#00ff88]/50'
                                        : 'bg-white/[0.03] border-white/5'
                                        }`}
                                >
                                    <span className={`text-xs font-black uppercase tracking-widest ${quizSettings.quizMode === 'normal' ? 'text-[#00ff88]' : 'text-white'}`}>Normal Mode</span>
                                    <span className="text-[10px] text-gray-500">Traditional scrollable list of questions.</span>
                                </button>
                                <button
                                    onClick={() => setQuizSettings({ ...quizSettings, quizMode: 'exam' })}
                                    className={`p-6 rounded-3xl border transition-all flex flex-col gap-2 ${quizSettings.quizMode === 'exam'
                                        ? 'bg-[#00ff88]/10 border-[#00ff88]/50'
                                        : 'bg-white/[0.03] border-white/5'
                                        }`}
                                >
                                    <span className={`text-xs font-black uppercase tracking-widest ${quizSettings.quizMode === 'exam' ? 'text-[#00ff88]' : 'text-white'}`}>Exam Mode</span>
                                    <span className="text-[10px] text-gray-500">Timed, focused one-by-one assessment.</span>
                                </button>
                            </div>
                        </div>

                        {quizSettings.quizMode === 'exam' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Temporal Constraint</h4>
                                    <div className="text-xl font-black text-[#00ff88]">{quizSettings.timeLimit || 10} <span className="text-[10px] text-gray-600 ml-1">MINUTES</span></div>
                                </div>
                                <input
                                    type="range" min="5" max="60" step="5"
                                    value={quizSettings.timeLimit || 10}
                                    onChange={(e) => setQuizSettings({ ...quizSettings, timeLimit: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#00ff88]"
                                />
                            </div>
                        )}

                        <div className="pt-8 flex gap-4">
                            <button
                                onClick={startExam}
                                className="flex-1 py-5 bg-[#00ff88] text-black rounded-3xl text-xs font-black uppercase tracking-widest transition-all hover:bg-[#00dd77] hover:scale-[1.02] shadow-2xl active:scale-95"
                            >
                                Start Assessment
                            </button>
                            <button
                                onClick={() => setQuizData(null)}
                                className="px-8 py-5 border border-white/10 text-white rounded-3xl text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                            >
                                Back to Analysis
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- PHASE: SESSION ---
    if (phase === 'exam') {
        const isExamMode = quizSettings.quizMode === 'exam';

        if (!isExamMode) {
            // NORMAL MODE: List Rendering
            return (
                <div className="flex flex-col h-full bg-[#0a0a0a] rounded-xl border border-[#222] overflow-hidden">
                    <div className="p-6 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]"></div>
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Knowledge Audit: {quizData.quiz.length} Items</h3>
                        </div>
                        <button
                            onClick={finishExam}
                            className="px-6 py-2.5 bg-[#00ff88] text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#00dd77] transition-all"
                        >
                            Submit Assessment
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                        <div className="max-w-3xl mx-auto space-y-12">
                            {quizData.quiz.map((q, qIdx) => (
                                <div key={qIdx} className="space-y-6 p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/10 transition-all">
                                    <div className="flex items-start gap-6">
                                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-[10px] font-black text-gray-500 border border-white/10">{qIdx + 1}</div>
                                        <h2 className="text-lg font-bold text-white leading-snug pt-1">{q.question}</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-16">
                                        {q.type === 'mc' && q.options.map((opt, oIdx) => (
                                            <button
                                                key={oIdx}
                                                onClick={() => handleAnswerChange(qIdx, opt.value)}
                                                className={`text-left p-4 rounded-2xl border transition-all flex items-center gap-4 ${selectedAnswers[`q${qIdx}`] === opt.value
                                                    ? 'bg-[#00ff88]/10 border-[#00ff88]/40'
                                                    : 'bg-black/20 border-white/5 hover:border-white/10'
                                                    }`}
                                            >
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black border ${selectedAnswers[`q${qIdx}`] === opt.value ? 'bg-[#00ff88] text-black border-transparent' : 'bg-white/5 border-white/10 text-gray-500'}`}>{opt.label}</div>
                                                <span className="text-[13px] font-medium text-gray-300">{opt.value}</span>
                                            </button>
                                        ))}

                                        {q.type === 'tf' && ['true', 'false'].map((val) => (
                                            <button
                                                key={val}
                                                onClick={() => handleAnswerChange(qIdx, val)}
                                                className={`text-left p-4 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-widest ${selectedAnswers[`q${qIdx}`] === val
                                                    ? 'bg-[#00ff88]/10 border-[#00ff88]/40 text-white'
                                                    : 'bg-black/20 border-white/5 text-gray-500 hover:text-white'
                                                    }`}
                                            >
                                                {val}
                                            </button>
                                        ))}
                                    </div>

                                    {q.type === 'fib' && (
                                        <div className="pl-16">
                                            <input
                                                type="text"
                                                placeholder="Enter response..."
                                                value={selectedAnswers[`q${qIdx}`] || ''}
                                                onChange={(e) => handleAnswerChange(qIdx, e.target.value)}
                                                className="w-full p-4 bg-white/[0.03] border border-white/10 rounded-2xl text-[13px] font-bold text-[#00ff88] focus:border-[#00ff88]/50 outline-none transition-all"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="py-10 text-center">
                                <button
                                    onClick={finishExam}
                                    className="px-12 py-5 bg-white text-black rounded-[2.5rem] text-xs font-black uppercase tracking-widest hover:bg-[#00ff88] transition-all shadow-2xl"
                                >
                                    End Session & View Metrics
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // EXAM MODE: Step Rendering
        const q = quizData.quiz[currentIndex];
        const progress = ((currentIndex + 1) / quizData.quiz.length) * 100;

        return (
            <div className="flex flex-col h-full bg-[#0a0a0a] rounded-xl border border-[#222] overflow-hidden">
                <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-full text-[9px] font-black text-[#00ff88] uppercase tracking-widest">
                            Question {currentIndex + 1} of {quizData.quiz.length}
                        </div>
                        <div className="h-1 w-32 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[#00ff88] transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                    <div className={`text-sm font-mono font-black tabular-nums transition-colors duration-300 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-white/60'}`}>
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="flex-1 flex flex-col p-12 custom-scrollbar">
                    <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center">
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
                                {q.question}
                            </h2>

                            <div className="space-y-3">
                                {q.type === 'mc' && q.options.map((opt, oIdx) => (
                                    <button
                                        key={oIdx}
                                        onClick={() => handleAnswerChange(currentIndex, opt.value)}
                                        className={`w-full text-left p-5 rounded-[1.5rem] border transition-all group flex items-center justify-between
                                            ${selectedAnswers[`q${currentIndex}`] === opt.value
                                                ? 'bg-[#00ff88]/10 border-[#00ff88]/40 ring-1 ring-[#00ff88]/20'
                                                : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
                                            }`}
                                    >
                                        <div className="flex gap-5 items-center">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black border transition-colors
                                                ${selectedAnswers[`q${currentIndex}`] === opt.value
                                                    ? 'bg-[#00ff88] border-transparent text-black'
                                                    : 'bg-white/5 border-white/10 text-gray-500 group-hover:text-white'
                                                }`}>
                                                {opt.label}
                                            </div>
                                            <span className={`text-sm font-semibold tracking-tight transition-colors ${selectedAnswers[`q${currentIndex}`] === opt.value ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                                {opt.value}
                                            </span>
                                        </div>
                                    </button>
                                ))}

                                {q.type === 'tf' && ['true', 'false'].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => handleAnswerChange(currentIndex, val)}
                                        className={`w-full text-left p-5 rounded-[1.5rem] border transition-all flex items-center justify-between
                                            ${selectedAnswers[`q${currentIndex}`] === val
                                                ? 'bg-[#00ff88]/10 border-[#00ff88]/40 ring-1 ring-[#00ff88]/20'
                                                : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
                                            }`}
                                    >
                                        <span className={`text-sm font-black uppercase tracking-widest ${selectedAnswers[`q${currentIndex}`] === val ? 'text-white' : 'text-gray-500'}`}>{val}</span>
                                    </button>
                                ))}

                                {q.type === 'fib' && (
                                    <input
                                        type="text"
                                        placeholder="Type your answer here..."
                                        value={selectedAnswers[`q${currentIndex}`] || ''}
                                        onChange={(e) => handleAnswerChange(currentIndex, e.target.value)}
                                        className="w-full p-6 bg-white/[0.03] border border-white/10 rounded-3xl text-sm font-bold text-[#00ff88] focus:border-[#00ff88]/50 outline-none transition-all placeholder:text-gray-700"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                    <button
                        disabled={currentIndex === 0}
                        onClick={() => setCurrentIndex(prev => prev - 1)}
                        className="px-6 py-3 text-xs font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors disabled:opacity-0"
                    >
                        Back
                    </button>
                    {currentIndex === quizData.quiz.length - 1 ? (
                        <button
                            onClick={finishExam}
                            className="px-8 py-3 bg-[#00ff88] text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#00dd77] transition-all shadow-xl"
                        >
                            Complete Audit
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentIndex(prev => prev + 1)}
                            className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                            Next Question
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // --- PHASE: RESULTS ---
    if (phase === 'results' && examResults) {
        const accuracy = Math.round((examResults.score / quizData.quiz.length) * 100);

        return (
            <div className="flex flex-col h-full bg-[#0a0a0a] rounded-xl border border-[#222] overflow-hidden">
                <div className="p-12 md:p-20 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-16">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-6">
                                <h1 className="text-4xl md:text-6xl font-black text-white leading-none tracking-tighter uppercase whitespace-nowrap">
                                    Assessment <br /><span className="text-[#00ff88]">Analytics</span>
                                </h1>
                                <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                                    Your audit cycle is complete. Mastery of this document is currently rated at <span className="text-white font-bold">{accuracy}%</span>.
                                </p>
                            </div>
                            <div className="flex flex-col items-center justify-center bg-white/[0.02] p-8 rounded-[3rem] border border-white/5">
                                <div className="text-6xl font-black text-white mb-2">{accuracy}%</div>
                                <div className="text-[10px] font-black tracking-[0.4em] text-gray-500 uppercase">Proficiency Level</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { label: 'Scored Items', value: `${examResults.score} / ${quizData.quiz.length}`, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                                { label: 'Time Spent', value: formatTime(examResults.timeTaken), icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                                { label: 'Avg Speed', value: `${Math.round(examResults.timeTaken / quizData.quiz.length)}s / item`, icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                                { label: 'Proficiency', value: accuracy > 80 ? 'Elite' : accuracy > 50 ? 'Stable' : 'Unstable', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white/[0.02] p-6 rounded-3xl border border-white/5 space-y-4">
                                    <svg className="w-5 h-5 text-[#00ff88] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
                                    <div>
                                        <div className="text-sm font-black text-white">{stat.value}</div>
                                        <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-8">
                            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Detailed Review</h3>
                            <div className="space-y-4">
                                {quizData.quiz.map((q, i) => {
                                    const userAnswer = selectedAnswers[`q${i}`];
                                    const isCorrect = q.type === 'fib'
                                        ? userAnswer?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
                                        : userAnswer === q.correctAnswer;

                                    return (
                                        <div key={i} className={`p-6 rounded-3xl border transition-all ${isCorrect ? 'bg-white/[0.01] border-white/5 opacity-50' : 'bg-red-500/5 border-red-500/20'}`}>
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${isCorrect ? 'bg-gray-700' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
                                                <div className="space-y-3 flex-1">
                                                    <div className="text-sm font-bold text-white/90">{q.question}</div>
                                                    {!isCorrect && (
                                                        <div className="flex gap-4 items-center">
                                                            <div className="text-[10px] uppercase font-black tracking-widest text-[#00ff88]">Correct: {String(q.correctAnswer)}</div>
                                                            <div className="text-[10px] uppercase font-black tracking-widest text-red-500">Yours: {String(userAnswer || 'Skipped')}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-10">
                            <button
                                onClick={() => setPhase('setup')}
                                className="flex-1 py-5 bg-white text-black rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                            >
                                New Session
                            </button>
                            <button
                                onClick={() => openExportModal('quiz', quizData)}
                                className="flex-1 py-5 border border-white/10 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                            >
                                Export Results
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default Quiz;
