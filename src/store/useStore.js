import { create } from 'zustand';

 


















































































































const initialState = {
    view: 'import' ,
    mode: 'editor' ,
    htmlPreview: null,
    fileId: null,
    isLoading: false,
    prompt: '',
    leftPanelView: 'editor' ,
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
    previewPreset: 'professional' ,
    isExportModalOpen: false,
    exportContext: null,
};

export const useStore = create((set) => ({
    ...initialState,

    setView: (view) => set({ view }),
    setMode: (mode) => set({ mode }),
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
    setFlashcardsSettings: (flashcardsSettings) => set({ flashcardsSettings }),
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

    setExportModalOpen: (isExportModalOpen) => set({ isExportModalOpen }),
    openExportModal: (mode, data) => set({ isExportModalOpen: true, exportContext: { mode, data } }),

    resetAll: () => set(initialState),
}));
