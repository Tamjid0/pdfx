import { StateCreator } from 'zustand';
import { AppState, SummaryData, NotesData, FlashcardsData, QuizData, MindmapData, InsightsData, Mode } from '../types';

export interface ContentSlice {
    summaryData: SummaryData | null;
    notesData: NotesData | null;
    insightsData: InsightsData | null;
    flashcardsData: FlashcardsData | null;
    quizData: QuizData | null;
    mindmapData: MindmapData | null;
    chatHistory: { role: 'user' | 'assistant' | 'ai'; content: string; timestamp?: string }[];

    isSummaryGenerated: boolean;
    isNotesGenerated: boolean;
    isInsightsGenerated: boolean;
    isFlashcardsGenerated: boolean;
    isQuizGenerated: boolean;
    isMindmapGenerated: boolean;

    isGeneratingSummary: boolean;
    isGeneratingNotes: boolean;
    isGeneratingInsights: boolean;
    isGeneratingFlashcards: boolean;
    isGeneratingQuiz: boolean;
    isGeneratingMindmap: boolean;

    setSummaryData: (data: SummaryData | null) => void;
    setNotesData: (data: NotesData | null) => void;
    setInsightsData: (data: InsightsData | null) => void;
    setFlashcardsData: (data: FlashcardsData | null) => void;
    setQuizData: (data: QuizData | null) => void;
    setMindmapData: (data: MindmapData | null) => void;
    setChatHistory: (history: any) => void;

    setIsSummaryGenerated: (val: boolean) => void;
    setIsNotesGenerated: (val: boolean) => void;
    setIsInsightsGenerated: (val: boolean) => void;
    setIsFlashcardsGenerated: (val: boolean) => void;
    setIsQuizGenerated: (val: boolean) => void;
    setIsMindmapGenerated: (val: boolean) => void;

    setIsGeneratingSummary: (val: boolean) => void;
    setIsGeneratingNotes: (val: boolean) => void;
    setIsGeneratingInsights: (val: boolean) => void;
    setIsGeneratingFlashcards: (val: boolean) => void;
    setIsGeneratingQuiz: (val: boolean) => void;
    setIsGeneratingMindmap: (val: boolean) => void;
}

export const createContentSlice: StateCreator<AppState, [], [], ContentSlice> = (set, get) => ({
    summaryData: null,
    notesData: null,
    insightsData: null,
    flashcardsData: null,
    quizData: null,
    mindmapData: null,
    chatHistory: [],

    isSummaryGenerated: false,
    isNotesGenerated: false,
    isInsightsGenerated: false,
    isFlashcardsGenerated: false,
    isQuizGenerated: false,
    isMindmapGenerated: false,

    isGeneratingSummary: false,
    isGeneratingNotes: false,
    isGeneratingInsights: false,
    isGeneratingFlashcards: false,
    isGeneratingQuiz: false,
    isGeneratingMindmap: false,

    setSummaryData: (data) => {
        set((state) => {
            const activeId = state.activeRevisionIds.summary;
            let nextLocalDrafts = state.localDrafts;
            if (activeId?.startsWith('draft-')) {
                const drafts = state.localDrafts.summary || [];
                const newDrafts = drafts.map(d => d.id === activeId ? { ...d, data } : d);
                nextLocalDrafts = { ...state.localDrafts, summary: newDrafts };
            }
            return { summaryData: data, localDrafts: nextLocalDrafts };
        });
    },
    setNotesData: (data) => {
        set((state) => {
            const activeId = state.activeRevisionIds.notes;
            let nextLocalDrafts = state.localDrafts;
            if (activeId?.startsWith('draft-')) {
                const drafts = state.localDrafts.notes || [];
                const newDrafts = drafts.map(d => d.id === activeId ? { ...d, data } : d);
                nextLocalDrafts = { ...state.localDrafts, notes: newDrafts };
            }
            return { notesData: data, localDrafts: nextLocalDrafts };
        });
    },
    setInsightsData: (data) => {
        set((state) => {
            const activeId = state.activeRevisionIds.insights;
            let nextLocalDrafts = state.localDrafts;
            if (activeId?.startsWith('draft-')) {
                const drafts = state.localDrafts.insights || [];
                const newDrafts = drafts.map(d => d.id === activeId ? { ...d, data } : d);
                nextLocalDrafts = { ...state.localDrafts, insights: newDrafts };
            }
            return { insightsData: data, localDrafts: nextLocalDrafts };
        });
    },
    setFlashcardsData: (data) => {
        set((state) => {
            const activeId = state.activeRevisionIds.flashcards;
            let nextLocalDrafts = state.localDrafts;
            if (activeId?.startsWith('draft-')) {
                const drafts = state.localDrafts.flashcards || [];
                const newDrafts = drafts.map(d => d.id === activeId ? { ...d, data } : d);
                nextLocalDrafts = { ...state.localDrafts, flashcards: newDrafts };
            }
            return { flashcardsData: data, localDrafts: nextLocalDrafts };
        });
    },
    setQuizData: (data) => {
        set((state) => {
            const activeId = state.activeRevisionIds.quiz;
            let nextLocalDrafts = state.localDrafts;
            if (activeId?.startsWith('draft-')) {
                const drafts = state.localDrafts.quiz || [];
                const newDrafts = drafts.map(d => d.id === activeId ? { ...d, data } : d);
                nextLocalDrafts = { ...state.localDrafts, quiz: newDrafts };
            }
            return { quizData: data, localDrafts: nextLocalDrafts };
        });
    },
    setMindmapData: (data) => {
        set((state) => {
            const activeId = state.activeRevisionIds.mindmap;
            let nextLocalDrafts = state.localDrafts;
            if (activeId?.startsWith('draft-')) {
                const drafts = state.localDrafts.mindmap || [];
                const newDrafts = drafts.map(d => d.id === activeId ? { ...d, data } : d);
                nextLocalDrafts = { ...state.localDrafts, mindmap: newDrafts };
            }
            return { mindmapData: data, localDrafts: nextLocalDrafts };
        });
    },
    setChatHistory: (history) => {
        if (typeof history === 'function') {
            set((state) => ({ chatHistory: history(state.chatHistory) }));
        } else {
            set({ chatHistory: history });
        }
    },

    setIsSummaryGenerated: (val) => set({ isSummaryGenerated: val }),
    setIsNotesGenerated: (val) => set({ isNotesGenerated: val }),
    setIsInsightsGenerated: (val) => set({ isInsightsGenerated: val }),
    setIsFlashcardsGenerated: (val) => set({ isFlashcardsGenerated: val }),
    setIsQuizGenerated: (val) => set({ isQuizGenerated: val }),
    setIsMindmapGenerated: (val) => set({ isMindmapGenerated: val }),

    setIsGeneratingSummary: (val) => set({ isGeneratingSummary: val }),
    setIsGeneratingNotes: (val) => set({ isGeneratingNotes: val }),
    setIsGeneratingInsights: (val) => set({ isGeneratingInsights: val }),
    setIsGeneratingFlashcards: (val) => set({ isGeneratingFlashcards: val }),
    setIsGeneratingQuiz: (val) => set({ isGeneratingQuiz: val }),
    setIsGeneratingMindmap: (val) => set({ isGeneratingMindmap: val }),
});
