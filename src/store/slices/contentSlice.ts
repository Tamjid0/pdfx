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
}

const saveDraftToLocalStorage = (get: any, module: Mode, data: any) => {
    const state = get();
    const activeId = state.activeRevisionIds[module];
    if (activeId?.startsWith('draft-')) {
        const drafts = state.localDrafts[module] || [];
        const newDrafts = drafts.map((d: any) => d.id === activeId ? { ...d, data } : d);
        const allDrafts = { ...state.localDrafts, [module]: newDrafts };
        const fileId = state.fileId;
        if (fileId) {
            localStorage.setItem(`pdfx_drafts_${fileId}`, JSON.stringify(allDrafts));
        }
    }
};

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

    setSummaryData: (data) => {
        set({ summaryData: data });
        saveDraftToLocalStorage(get, 'summary', data);
    },
    setNotesData: (data) => {
        set({ notesData: data });
        saveDraftToLocalStorage(get, 'notes', data);
    },
    setInsightsData: (data) => {
        set({ insightsData: data });
        saveDraftToLocalStorage(get, 'insights', data);
    },
    setFlashcardsData: (data) => {
        set({ flashcardsData: data });
        saveDraftToLocalStorage(get, 'flashcards', data);
    },
    setQuizData: (data) => {
        set({ quizData: data });
        saveDraftToLocalStorage(get, 'quiz', data);
    },
    setMindmapData: (data) => {
        set({ mindmapData: data });
        saveDraftToLocalStorage(get, 'mindmap', data);
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
});
