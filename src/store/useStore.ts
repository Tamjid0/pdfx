import { create } from 'zustand';

export type PreviewPreset = 'professional' | 'academic' | 'minimal' | 'creative';

interface AppState {
    htmlPreview: string | null;
    isLoading: boolean;
    view: 'import' | 'editor' | 'viewer';
    mode: 'summary' | 'insights' | 'notes' | 'quiz' | 'flashcards' | 'mindmap' | 'editor' | 'chat' | 'slides';
    leftPanelView: 'editor' | 'artboard' | 'slides';
    mindmapData: any | null;
    insightsData: any | null;
    notesData: any | null;
    quizData: any | null;
    flashcardsData: any | null;
    summaryData: any | null;
    chatHistory: any[];
    fileId: string | null;
    fileType: 'pdf' | 'pptx' | 'text' | null;
    stats: {
        wordCount: number;
        charCount: number;
        lineCount: number;
        readTime: number;
    };
    isPreviewMode: boolean;
    isTyping: boolean;
    showExportModal: boolean;
    exportMode: string;
    exportContent: any;

    // Slide State
    isSlideMode: boolean;
    isProcessingSlides: boolean;
    renderingProgress: number;
    slides: any[];
    currentSlideIndex: number;

    // Settings (expanded as needed)
    summarySettings: any;
    insightsSettings: any;
    notesSettings: any;
    quizSettings: any;
    mindmapSettings: any;

    // Generation Status
    isSummaryGenerated: boolean;
    isInsightsGenerated: boolean;
    isNotesGenerated: boolean;
    isFlashcardsGenerated: boolean;
    isQuizGenerated: boolean;
    isMindmapGenerated: boolean;

    // Toggles
    activeNotesToggles: any;
    activeInsightsToggles: any;

    // Preview Settings
    previewPreset: PreviewPreset;

    // Actions
    setHtmlPreview: (html: string | null) => void;
    setIsLoading: (loading: boolean) => void;
    setView: (view: 'import' | 'editor' | 'viewer') => void;
    setMode: (mode: any) => void;
    setLeftPanelView: (view: 'editor' | 'artboard' | 'slides') => void;
    setMindmapData: (data: any) => void;
    setInsightsData: (data: any) => void;
    setNotesData: (data: any) => void;
    setQuizData: (data: any) => void;
    setFlashcardsData: (data: any) => void;
    setSummaryData: (data: any) => void;
    setChatHistory: (history: any[] | ((prev: any[]) => any[])) => void;
    setFileType: (type: 'pdf' | 'pptx' | 'text' | null) => void;
    setPreviewMode: (preview: boolean) => void;
    setIsTyping: (typing: boolean) => void;
    setIsSummaryGenerated: (val: boolean) => void;
    setIsInsightsGenerated: (val: boolean) => void;
    setIsNotesGenerated: (val: boolean) => void;
    setIsFlashcardsGenerated: (val: boolean) => void;
    setIsQuizGenerated: (val: boolean) => void;
    setIsMindmapGenerated: (val: boolean) => void;
    setSummarySettings: (settings: any) => void;
    setQuizSettings: (settings: any) => void;
    setNotesSettings: (settings: any) => void;
    setInsightsSettings: (settings: any) => void;
    setMindmapSettings: (settings: any) => void;

    // Slide Actions
    setIsSlideMode: (isSlideMode: boolean) => void;
    setIsProcessingSlides: (isProcessing: boolean) => void;
    setRenderingProgress: (progress: number) => void;
    setSlides: (slides: any[]) => void;
    setCurrentSlideIndex: (index: number) => void;
    nextSlide: () => void;
    prevSlide: () => void;

    // Preview Actions
    setPreviewPreset: (preset: PreviewPreset) => void;

    openExportModal: (mode: string, content: any) => void;
    closeExportModal: () => void;
}

export const useStore = create<AppState>((set) => ({
    htmlPreview: null,
    isLoading: false,
    view: 'import',
    mode: 'editor',
    leftPanelView: 'editor',
    mindmapData: null,
    insightsData: null,
    notesData: null,
    quizData: null,
    flashcardsData: null,
    summaryData: null,
    chatHistory: [],
    fileId: null,
    fileType: null,
    stats: { wordCount: 0, charCount: 0, lineCount: 0, readTime: 0 },
    isPreviewMode: false,
    isTyping: false,
    showExportModal: false,
    exportMode: 'editor',
    exportContent: null,

    isSlideMode: false,
    isProcessingSlides: false,
    renderingProgress: 0,
    slides: [],
    currentSlideIndex: 0,

    summarySettings: {
        summaryLength: 50,
        summaryFormat: 'paragraph',
        tone: 'professional',
        language: 'English',
        summaryType: 'abstractive',
        keywords: '',
        keySentences: false
    },
    insightsSettings: {
        keyEntities: true,
        topics: false,
        customExtraction: ''
    },
    notesSettings: {
        detailLevel: 'medium',
        keyConcepts: true,
        actionItems: true,
        aiSummary: true
    },
    quizSettings: {
        questionCount: 5,
        difficulty: 'medium',
        questionTypes: ['multiple-choice'],
        timed: false,
        timeLimit: 10
    },
    mindmapSettings: {
        depth: 2,
        layout: 'organic',
        theme: 'default',
        focusMode: false,
        presentationMode: false,
        searchTerm: ''
    },

    isSummaryGenerated: false,
    isInsightsGenerated: false,
    isNotesGenerated: false,
    isFlashcardsGenerated: false,
    isQuizGenerated: false,
    isMindmapGenerated: false,

    activeNotesToggles: {},
    activeInsightsToggles: {},

    previewPreset: 'professional',

    setHtmlPreview: (html) => set({ htmlPreview: html }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    setView: (view) => set({ view: view }),
    setMode: (mode) => set({ mode: mode }),
    setLeftPanelView: (view) => set({ leftPanelView: view }),
    setMindmapData: (data) => set({ mindmapData: data }),
    setInsightsData: (data) => set({ insightsData: data }),
    setNotesData: (data) => set({ notesData: data }),
    setQuizData: (data) => set({ quizData: data }),
    setFlashcardsData: (data) => set({ flashcardsData: data }),
    setSummaryData: (data) => set({ summaryData: data }),
    setChatHistory: (history) => set((state) => ({
        chatHistory: typeof history === 'function' ? history(state.chatHistory) : history
    })),
    setFileId: (id) => set({ fileId: id }),
    setFileType: (type) => set({ fileType: type }),
    setStats: (stats) => set({ stats: stats }),
    setPreviewMode: (preview) => set({ isPreviewMode: preview }),
    setIsTyping: (typing) => set({ isTyping: typing }),
    setIsSummaryGenerated: (val) => set({ isSummaryGenerated: val }),
    setIsInsightsGenerated: (val) => set({ isInsightsGenerated: val }),
    setIsNotesGenerated: (val) => set({ isNotesGenerated: val }),
    setIsFlashcardsGenerated: (val) => set({ isFlashcardsGenerated: val }),
    setIsQuizGenerated: (val) => set({ isQuizGenerated: val }),
    setIsMindmapGenerated: (val) => set({ isMindmapGenerated: val }),
    setSummarySettings: (settings) => set({ summarySettings: settings }),
    setQuizSettings: (settings) => set({ quizSettings: settings }),
    setNotesSettings: (settings) => set({ notesSettings: settings }),
    setInsightsSettings: (settings) => set({ insightsSettings: settings }),
    setMindmapSettings: (settings) => set({ mindmapSettings: settings }),

    setIsSlideMode: (isSlideMode) => set({ isSlideMode }),
    setIsProcessingSlides: (isProcessing) => set({ isProcessingSlides: isProcessing }),
    setRenderingProgress: (progress) => set({ renderingProgress: progress }),
    setSlides: (slides) => set({ slides }),
    setCurrentSlideIndex: (index) => set({ currentSlideIndex: index }),
    nextSlide: () => set((state) => ({
        currentSlideIndex: Math.min(state.currentSlideIndex + 1, state.slides.length - 1)
    })),
    prevSlide: () => set((state) => ({
        currentSlideIndex: Math.max(state.currentSlideIndex - 1, 0)
    })),

    openExportModal: (mode, content) => set({ showExportModal: true, exportMode: mode, exportContent: content }),
    closeExportModal: () => set({ showExportModal: false }),

    setPreviewPreset: (preset) => set({ previewPreset: preset }),
}));
