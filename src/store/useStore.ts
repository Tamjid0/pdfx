import { create } from 'zustand';

export type Mode = 'editor' | 'summary' | 'insights' | 'notes' | 'flashcards' | 'quiz' | 'mindmap' | 'chat';

export type PreviewPreset = 'professional' | 'academic' | 'minimal' | 'creative';

export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
}

interface Stats {
    wordCount: number;
    charCount: number;
    lineCount: number;
    readTime: number;
}

interface AppState {
    // Document & Navigation State
    view: 'import' | 'editor';
    mode: Mode;
    htmlPreview: string | null;
    fileId: string | null;
    isLoading: boolean;
    isTyping: boolean;
    prompt: string;
    leftPanelView: 'editor' | 'artboard';
    stats: Stats;

    // Feature Data
    insightsData: any;
    notesData: any;
    quizData: any;
    flashcardsData: any;
    mindmapData: any;
    summaryData: any;
    chatHistory: ChatMessage[];

    // Generation Flags
    isSummaryGenerated: boolean;
    isInsightsGenerated: boolean;
    isNotesGenerated: boolean;
    isFlashcardsGenerated: boolean;
    isQuizGenerated: boolean;
    isMindmapGenerated: boolean;

    // Settings
    summarySettings: any;
    insightsSettings: any;
    notesSettings: any;
    quizSettings: any;
    mindmapSettings: any;
    flashcardsSettings: any;
    activeNotesToggles: any;
    activeInsightsToggles: any;

    // Document Preview State
    isPreviewMode: boolean;
    previewPreset: PreviewPreset;

    // Export Modal State
    isExportModalOpen: boolean;
    exportContext: {
        mode: Mode | 'preview';
        data: any;
    } | null;

    // Actions
    setView: (view: 'import' | 'editor') => void;
    setMode: (mode: Mode) => void;
    setHtmlPreview: (html: string | null) => void;
    setFileId: (fileId: string | null) => void;
    setIsLoading: (isLoading: boolean) => void;
    setPrompt: (prompt: string) => void;
    setLeftPanelView: (view: 'editor' | 'artboard') => void;
    setStats: (stats: Stats) => void;

    // Data Setters
    setInsightsData: (data: any) => void;
    setNotesData: (data: any) => void;
    setQuizData: (data: any) => void;
    setFlashcardsData: (data: any) => void;
    setMindmapData: (data: any) => void;
    setSummaryData: (data: any) => void;
    setChatHistory: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void;

    // Settings Setters
    setSummarySettings: (settings: any) => void;
    setInsightsSettings: (settings: any) => void;
    setNotesSettings: (settings: any) => void;
    setQuizSettings: (settings: any) => void;
    setMindmapSettings: (settings: any) => void;
    setFlashcardsSettings: (settings: any) => void;
    setActiveNotesToggles: (toggles: any) => void;
    setActiveInsightsToggles: (toggles: any) => void;

    // Preview Actions
    setPreviewMode: (enabled: boolean) => void;
    setPreviewPreset: (preset: PreviewPreset) => void;

    // Chat Actions
    setIsTyping: (val: boolean) => void;

    // Export Actions
    setExportModalOpen: (open: boolean) => void;
    openExportModal: (mode: Mode | 'preview', data: any) => void;

    // Generation Flag Setters
    setIsSummaryGenerated: (val: boolean) => void;
    setIsInsightsGenerated: (val: boolean) => void;
    setIsNotesGenerated: (val: boolean) => void;
    setIsFlashcardsGenerated: (val: boolean) => void;
    setIsQuizGenerated: (val: boolean) => void;
    setIsMindmapGenerated: (val: boolean) => void;

    // Reset function
    resetAll: () => void;
}

const initialState = {
    view: 'editor' as const,
    mode: 'editor' as const,
    htmlPreview: null,
    fileId: null,
    isLoading: false,
    isTyping: false,
    prompt: '',
    leftPanelView: 'editor' as const,
    stats: {
        wordCount: 0,
        charCount: 0,
        lineCount: 0,
        readTime: 0,
    },
    insightsData: null,
    notesData: null,
    quizData: null,
    flashcardsData: null,
    mindmapData: null,
    summaryData: null,
    chatHistory: [],
    isSummaryGenerated: false,
    isInsightsGenerated: false,
    isNotesGenerated: false,
    isFlashcardsGenerated: false,
    isQuizGenerated: false,
    isMindmapGenerated: false,
    summarySettings: {
        summaryLength: 100,
        summaryFormat: 'paragraph',
        keywords: '',
        tone: 'professional',
        language: 'English',
        keySentences: true,
        summaryType: 'abstractive',
    },
    insightsSettings: {
        keyEntities: true,
        topics: true,
        customExtraction: '',
    },
    notesSettings: {
        keyConcepts: true,
        actionItems: true,
        aiSummary: false,
    },
    quizSettings: {
        questionTypes: ['multiple-choice'],
        difficulty: 'medium',
        timed: false,
        timeLimit: 10,
    },
    mindmapSettings: {
        layout: 'organic',
        theme: 'default',
        focusMode: false,
        presentationMode: false,
        searchTerm: '',
    },
    flashcardsSettings: {
        cardsCount: 10,
        difficulty: 'mixed',
    },
    activeNotesToggles: {
        highlight: false, markdown: false, autoOutline: false, comments: false,
        tagging: false, aiSummary: false, versioning: false,
    },
    activeInsightsToggles: {
        'key-entities': false, 'topics': false, 'keywords': false,
        'questions': false, 'action-items': false, 'dates-events': false,
    },
    isPreviewMode: false,
    previewPreset: 'professional' as const,
    isExportModalOpen: false,
    exportContext: null,
};

export const useStore = create<AppState>((set) => ({
    ...initialState,

    setView: (view) => set({ view }),
    setMode: (mode) => set({ mode, isPreviewMode: false }),
    setHtmlPreview: (htmlPreview) => set({ htmlPreview }),
    setFileId: (fileId) => set({ fileId }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setPrompt: (prompt) => set({ prompt }),
    setLeftPanelView: (leftPanelView) => set({ leftPanelView }),
    setStats: (stats) => set({ stats }),

    setInsightsData: (insightsData) => set({ insightsData }),
    setNotesData: (notesData) => set({ notesData }),
    setQuizData: (quizData) => set({ quizData }),
    setFlashcardsData: (flashcardsData) => set({ flashcardsData }),
    setMindmapData: (mindmapData) => set({ mindmapData }),
    setSummaryData: (summaryData) => set({ summaryData }),
    setChatHistory: (updater) => set((state) => ({ chatHistory: updater(state.chatHistory) })),

    setSummarySettings: (summarySettings) => set({ summarySettings }),
    setInsightsSettings: (insightsSettings) => set({ insightsSettings }),
    setNotesSettings: (notesSettings) => set({ notesSettings }),
    setQuizSettings: (quizSettings) => set({ quizSettings }),
    setMindmapSettings: (mindmapSettings) => set({ mindmapSettings }),
    setFlashcardsSettings: (flashcardsSettings: any) => set({ flashcardsSettings }),
    setActiveNotesToggles: (activeNotesToggles) => set({ activeNotesToggles }),
    setActiveInsightsToggles: (activeInsightsToggles) => set({ activeInsightsToggles }),

    setIsSummaryGenerated: (isSummaryGenerated) => set({ isSummaryGenerated }),
    setIsInsightsGenerated: (isInsightsGenerated) => set({ isInsightsGenerated }),
    setIsNotesGenerated: (isNotesGenerated) => set({ isNotesGenerated }),
    setIsFlashcardsGenerated: (isFlashcardsGenerated) => set({ isFlashcardsGenerated }),
    setIsQuizGenerated: (isQuizGenerated) => set({ isQuizGenerated }),
    setIsMindmapGenerated: (isMindmapGenerated) => set({ isMindmapGenerated }),

    setPreviewMode: (isPreviewMode) => set({ isPreviewMode }),
    setPreviewPreset: (previewPreset) => set({ previewPreset }),

    setIsTyping: (isTyping) => set({ isTyping }),

    setExportModalOpen: (isExportModalOpen) => set({ isExportModalOpen }),
    openExportModal: (mode, data) => set({ isExportModalOpen: true, exportContext: { mode, data } }),

    resetAll: () => set(initialState),
}));
