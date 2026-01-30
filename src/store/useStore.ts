import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import * as apiService from '../services/apiService';

export type PreviewPreset = 'professional' | 'academic' | 'minimal' | 'creative';
export type Mode = 'summary' | 'insights' | 'notes' | 'quiz' | 'flashcards' | 'mindmap' | 'editor' | 'chat' | 'slides';

// --- Data Interfaces ---
export interface SummaryData {
    summary: string | string[];
    keyPoints: string[];
}

export interface NoteSection {
    section: string;
    points: string[];
}

export interface NotesData {
    notes: NoteSection[];
}

export interface Insight {
    title: string;
    description: string;
}

export interface InsightsData {
    insights: Insight[];
}

export interface Flashcard {
    question: string;
    answer: string;
}

export interface FlashcardsData {
    flashcards: Flashcard[];
}

export type QuizItem = {
    type: 'mc';
    question: string;
    options: { label: string; value: string; }[];
    correctAnswer: string;
} | {
    type: 'tf';
    question: string;
    correctAnswer: string; // Stored as string 'true'/'false' for consistency if needed, or boolean. Local Quiz.tsx used boolean. Let's use string 'true'/'false' to match API usually.
} | {
    type: 'fib';
    question: string;
    correctAnswer: string;
} | {
    type: 'sa';
    question: string;
    correctAnswer: string;
};

export interface QuizData {
    quiz: QuizItem[];
}

export interface MindmapNode {
    id: string;
    data: { label: string };
    position: { x: number; y: number };
}

export interface MindmapEdge {
    id: string;
    source: string;
    target: string;
}

export interface MindmapData {
    nodes: MindmapNode[];
    edges: MindmapEdge[];
}

export interface DocumentOverview {
    _id: string;
    documentId: string;
    fileName: string;
    fileId: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    originalFile?: {
        name: string;
        mime: string;
        size: number;
        processedAt: string;
    };
    metadata?: {
        title: string;
        pageCount: number;
        language: string;
        author: string;
    };
    summaryData?: { revisions: Revision<SummaryData>[] };
    notesData?: { revisions: Revision<NotesData>[] };
    insightsData?: { revisions: Revision<InsightsData>[] };
    flashcardsData?: { revisions: Revision<FlashcardsData>[] };
    quizData?: { revisions: Revision<QuizData>[] };
    mindmapData?: { revisions: Revision<MindmapData>[] };
    chatHistory?: any[];
}

export interface Revision<T> {
    id: string;
    name: string;
    content: T;
    timestamp: string;
}

export interface Topic {
    id: string;
    title: string;
    label: string;
    startPage: number;
    endPage: number;
    pageRange?: [number, number];
}

export interface GenerationScope {
    type: 'all' | 'pages' | 'topics';
    value: null | [number, number] | string[];
}

interface AppState {
    htmlPreview: string | null;
    isLoading: boolean;
    isPageLoading: boolean;
    isDocumentLoading: boolean;

    // Generation Status
    isGeneratingSummary: boolean;
    isGeneratingInsights: boolean;
    isGeneratingNotes: boolean;
    isGeneratingFlashcards: boolean;
    isGeneratingQuiz: boolean;
    isGeneratingMindmap: boolean;

    view: 'import' | 'editor' | 'viewer';
    mode: Mode;
    leftPanelView: 'editor' | 'artboard' | 'slides';
    mindmapData: MindmapData | null;
    insightsData: InsightsData | null;
    notesData: NotesData | null;
    quizData: QuizData | null;
    flashcardsData: FlashcardsData | null;
    summaryData: SummaryData | null;
    insightsRevisions: Revision<InsightsData>[];
    notesRevisions: Revision<NotesData>[];
    summaryRevisions: Revision<SummaryData>[];
    flashcardsRevisions: Revision<FlashcardsData>[];
    quizRevisions: Revision<QuizData>[];
    chatHistory: { role: 'user' | 'assistant' | 'ai'; content: string; timestamp?: string }[];
    fileId: string | null;
    fileType: 'pdf' | 'pptx' | 'text' | null;
    stats: {
        wordCount: number;
        charCount: number;
        lineCount: number;
        readTime: number;
        pageCount: number;
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
    activeNotesToggles: Record<string, boolean>;
    activeInsightsToggles: Record<string, boolean>;

    // Preview Settings
    previewPreset: PreviewPreset;
    prompt: string;

    // Smart Chunking & Scope
    topics: Topic[];
    setTopics: (topics: Topic[]) => void;
    generationScope: GenerationScope;
    setGenerationScope: (scope: GenerationScope) => void;
    isAppendMode: boolean;
    setIsAppendMode: (val: boolean) => void;

    // Actions
    setHtmlPreview: (html: string | null) => void;
    setIsLoading: (loading: boolean) => void;
    setIsPageLoading: (loading: boolean) => void;
    setIsDocumentLoading: (loading: boolean) => void;
    setIsGeneratingSummary: (val: boolean) => void;
    setIsGeneratingInsights: (val: boolean) => void;
    setIsGeneratingNotes: (val: boolean) => void;
    setIsGeneratingFlashcards: (val: boolean) => void;
    setIsGeneratingQuiz: (val: boolean) => void;
    setIsGeneratingMindmap: (val: boolean) => void;
    setView: (view: 'import' | 'editor' | 'viewer') => void;
    setMode: (mode: Mode) => void;
    setLeftPanelView: (view: 'editor' | 'artboard' | 'slides') => void;
    setMindmapData: (data: MindmapData | null) => void;
    setInsightsData: (data: InsightsData | null) => void;
    setNotesData: (data: NotesData | null) => void;
    setQuizData: (data: QuizData | null) => void;
    setFlashcardsData: (data: FlashcardsData | null) => void;
    setSummaryData: (data: SummaryData | null) => void;
    setChatHistory: (history: ({ role: 'user' | 'assistant' | 'ai'; content: string; timestamp?: string }[]) | ((prev: { role: 'user' | 'assistant' | 'ai'; content: string; timestamp?: string }[]) => { role: 'user' | 'assistant' | 'ai'; content: string; timestamp?: string }[])) => void;
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
    setSlides: (slides: { title: string; content: string }[]) => void;
    setCurrentSlideIndex: (index: number) => void;
    nextSlide: () => void;
    prevSlide: () => void;

    // Preview Actions
    setPreviewPreset: (preset: PreviewPreset) => void;
    setPrompt: (prompt: string) => void;
    setStats: (stats: any) => void;

    openExportModal: (mode: string, content: any) => void;
    closeExportModal: () => void;

    setFileId: (id: string | null) => void;
    templates: any[];
    setTemplates: (templates: any[]) => void;
    pdfSearchText: string | null;
    setPdfSearchText: (text: string | null) => void;
    updateStats: (text: string, pageCount?: number) => void;

    // Revision Actions
    switchRevision: (module: 'summary' | 'notes' | 'insights' | 'flashcards' | 'quiz', revisionId: string) => void;
    updateRevisionsFromSync: (updatedFields: any) => void;
    deleteRevision: (module: 'summary' | 'notes' | 'insights' | 'flashcards' | 'quiz', revisionId: string) => Promise<void>;
    renameRevision: (module: 'summary' | 'notes' | 'insights' | 'flashcards' | 'quiz', revisionId: string, name: string) => Promise<void>;

    // Workspace Management
    resetWorkspace: () => void;

    // Study Continuity
    loadProject: (documentId: string) => Promise<void>;
    loadProjectModule: (moduleKey: string) => Promise<void>;
    deleteDocument: (documentId: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
    htmlPreview: null,
    isLoading: false,
    isPageLoading: false,
    isDocumentLoading: false,
    isGeneratingSummary: false,
    isGeneratingInsights: false,
    isGeneratingNotes: false,
    isGeneratingFlashcards: false,
    isGeneratingQuiz: false,
    isGeneratingMindmap: false,
    view: 'import',
    mode: 'editor',
    leftPanelView: 'editor',
    mindmapData: null,
    insightsData: null,
    notesData: null,
    quizData: null,
    flashcardsData: null,
    summaryData: null,
    insightsRevisions: [],
    notesRevisions: [],
    summaryRevisions: [],
    flashcardsRevisions: [],
    quizRevisions: [],
    chatHistory: [],
    fileId: null,
    fileType: null,
    stats: { wordCount: 0, charCount: 0, lineCount: 0, readTime: 0, pageCount: 1 },
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
    prompt: '',

    topics: [],
    generationScope: { type: 'all', value: null },
    isAppendMode: false,
    setIsAppendMode: (val) => set({ isAppendMode: val }),

    setHtmlPreview: (html) => set({ htmlPreview: html }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    setIsPageLoading: (loading) => set({ isPageLoading: loading }),
    setIsDocumentLoading: (loading) => set({ isDocumentLoading: loading }),
    setIsGeneratingSummary: (val) => set({ isGeneratingSummary: val }),
    setIsGeneratingInsights: (val) => set({ isGeneratingInsights: val }),
    setIsGeneratingNotes: (val) => set({ isGeneratingNotes: val }),
    setIsGeneratingFlashcards: (val) => set({ isGeneratingFlashcards: val }),
    setIsGeneratingQuiz: (val) => set({ isGeneratingQuiz: val }),
    setIsGeneratingMindmap: (val) => set({ isGeneratingMindmap: val }),
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
    setPrompt: (prompt) => set({ prompt }),

    setTopics: (topics) => set({ topics }),
    setGenerationScope: (scope) => set({ generationScope: scope }),

    templates: [],
    setTemplates: (templates) => set({ templates }),

    switchRevision: (module, revisionId) => set((state) => {
        const revKey = `${module}Revisions` as keyof AppState;
        const dataKey = `${module}Data` as keyof AppState;
        const genKey = `is${module.charAt(0).toUpperCase() + module.slice(1)}Generated` as keyof AppState;
        const revisions = state[revKey] as Revision<any>[];
        const revision = revisions.find((r) => r.id === revisionId);

        if (!revision) {
            console.warn(`[Store] Revision ${revisionId} not found in ${module}`);
            return state;
        }

        return {
            [dataKey]: revision.content,
            [genKey]: true
        } as Partial<AppState>;
    }),

    deleteRevision: async (module, revisionId) => {
        const { fileId } = get();
        if (!fileId) return;

        try {
            const moduleKey = `${module}Data`;
            const response = await fetch(`/api/v1/documents/${fileId}/revisions/${revisionId}?module=${moduleKey}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete revision');

            set((state) => {
                const revKey = `${module}Revisions` as keyof AppState;
                const revisions = state[revKey] as Revision<any>[];
                const filtered = revisions.filter((r) => r.id !== revisionId);
                return { [revKey]: filtered } as Partial<AppState>;
            });
        } catch (error) {
            toast.error('Failed to delete revision');
            throw error;
        }
    },

    renameRevision: async (module, revisionId, name) => {
        const { fileId } = get();
        if (!fileId) return;

        try {
            const moduleKey = `${module}Data`;
            const response = await fetch(`/api/v1/documents/${fileId}/revisions/${revisionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ module: moduleKey, name })
            });

            if (!response.ok) throw new Error('Failed to rename revision');

            set((state) => {
                const revKey = `${module}Revisions` as keyof AppState;
                const revisions = state[revKey] as Revision<any>[];
                const updated = revisions.map((r) =>
                    r.id === revisionId ? { ...r, name } : r
                );
                return { [revKey]: updated } as Partial<AppState>;
            });
        } catch (error) {
            toast.error('Failed to rename revision');
            throw error;
        }
    },

    updateRevisionsFromSync: (updatedFields: Record<string, any>) => set((state) => {
        const newState: Partial<AppState> = {};

        // Map backend keys (e.g. summaryData.revisions) to frontend store keys (e.g. summaryRevisions)
        const mappings: Record<string, keyof AppState> = {
            'summaryData.revisions': 'summaryRevisions',
            'notesData.revisions': 'notesRevisions',
            'insightsData.revisions': 'insightsRevisions',
            'flashcardsData.revisions': 'flashcardsRevisions',
            'quizData.revisions': 'quizRevisions',
            'summaryData': 'summaryData',
            'notesData': 'notesData',
            'insightsData': 'insightsData',
            'flashcardsData': 'flashcardsData',
            'quizData': 'quizData',
            'mindmapData': 'mindmapData'
        };

        for (const [backendKey, storeKey] of Object.entries(mappings)) {
            if (updatedFields[backendKey]) {
                (newState as any)[storeKey] = updatedFields[backendKey];
            }
        }

        return newState;
    }),

    // PDF Search State
    pdfSearchText: null,
    setPdfSearchText: (text) => set({ pdfSearchText: text }),

    updateStats: (text, pageCount) => {
        const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
        const chars = text.length;
        const lines = text.split("\n").length;
        const readTime = Math.ceil(words / 200);
        set((state) => ({
            stats: {
                wordCount: words,
                charCount: chars,
                lineCount: lines,
                readTime: readTime,
                pageCount: pageCount !== undefined ? pageCount : state.stats.pageCount
            }
        }));
    },

    // Workspace Management
    resetWorkspace: () => {
        set({
            htmlPreview: null,
            mindmapData: null,
            insightsData: null,
            notesData: null,
            quizData: null,
            flashcardsData: null,
            summaryData: null,
            chatHistory: [],
            fileId: null,
            fileType: null,
            isPreviewMode: false,
            isSummaryGenerated: false,
            isInsightsGenerated: false,
            isNotesGenerated: false,
            isFlashcardsGenerated: false,
            isQuizGenerated: false,
            isMindmapGenerated: false,
            stats: { wordCount: 0, charCount: 0, lineCount: 0, readTime: 0, pageCount: 1 },
            slides: [],
            currentSlideIndex: 0,
            isSlideMode: false,
            view: 'editor', // Changed from 'import' to 'editor' to keep workspace visible
            mode: 'editor',
            isPageLoading: false,
            isDocumentLoading: false,
            isGeneratingSummary: false,
            isGeneratingInsights: false,
            isGeneratingNotes: false,
            isGeneratingFlashcards: false,
            isGeneratingQuiz: false,
            isGeneratingMindmap: false
        });
    },

    // Study Continuity - Restoration Logic
    loadProject: async (documentId) => {
        set({ isLoading: true });
        try {
            const data = await apiService.fetchDocument(documentId);

            const typeStr = (data.type || '').toLowerCase();
            const isPptx = typeStr.includes('presentation') || typeStr.includes('powerpoint') || typeStr.includes('pptx');
            const isPdf = typeStr.includes('pdf');

            // Helper to handle legacy data format (Phase 10)
            const getActiveContent = (dataObj: any, key: string) => {
                const val = dataObj[key];
                if (!val) return null;
                // 1. Check for standard content field
                if (val.content !== undefined && val.content !== null) return val.content;
                // 2. Fallback to latest revision content if available
                if (Array.isArray(val.revisions) && val.revisions.length > 0 && val.revisions[0].content) {
                    return val.revisions[0].content;
                }
                // 3. Fallback to legacy format (no revisions field, just the data)
                if (typeof val === 'object' && !val.revisions) return val;
                return null;
            };

            // Populate workspace state from stored project data
            set({
                fileId: data.documentId,
                fileType: isPdf ? 'pdf' : (isPptx ? 'pptx' : 'text'),
                // Only show extracted text in editor for plain text projects
                htmlPreview: (isPdf || isPptx) ? null : (data.extractedText || ''),

                // Active Content (Mapping from .content with legacy fallback)
                summaryData: getActiveContent(data, 'summaryData'),
                notesData: getActiveContent(data, 'notesData'),
                flashcardsData: getActiveContent(data, 'flashcardsData'),
                quizData: getActiveContent(data, 'quizData'),
                insightsData: getActiveContent(data, 'insightsData'),
                mindmapData: data.mindmapData, // Not versioned yet
                chatHistory: data.chatHistory || [],

                // Revisions
                summaryRevisions: data.summaryData?.revisions || [],
                notesRevisions: data.notesData?.revisions || [],
                flashcardsRevisions: data.flashcardsData?.revisions || [],
                quizRevisions: data.quizData?.revisions || [],
                insightsRevisions: data.insightsData?.revisions || [],

                // Flags
                isSummaryGenerated: !!getActiveContent(data, 'summaryData'),
                isNotesGenerated: !!getActiveContent(data, 'notesData'),
                isFlashcardsGenerated: !!getActiveContent(data, 'flashcardsData'),
                isQuizGenerated: !!getActiveContent(data, 'quizData'),
                isMindmapGenerated: !!data.mindmapData,
                isInsightsGenerated: !!getActiveContent(data, 'insightsData'),

                topics: data.topics || [],
                view: 'viewer', // Switch to viewer view for projects
                mode: 'editor',
                leftPanelView: isPptx ? 'slides' : 'editor',
                isSlideMode: isPptx,
                isProcessingSlides: false,
                renderingProgress: 100
            });

            // Recalculate stats for restored document
            get().updateStats(data.extractedText || "", data.metadata?.pageCount || 1);

            // Special case for slides - Load slide data from chunks
            if (isPptx && data.chunks && data.chunks.length > 0) {
                const slides = data.chunks.map((chunk: any) => ({
                    title: chunk.metadata?.slideTitle || `Slide ${chunk.metadata?.pageIndex || 1}`,
                    content: chunk.content
                }));
                set({ slides, currentSlideIndex: 0 });
                console.log(`[Store] Loaded ${slides.length} slides for PPTX project`);
            }

        } catch (error) {
            console.error('[Store] loadProject failed:', error);
            alert('Failed to load project. Please try again.');
        } finally {
            set({ isLoading: false });
        }
    },

    loadProjectModule: async (moduleKey: string) => {
        const { fileId } = get();
        if (!fileId) return;
        try {
            const data = await apiService.fetchDocument(fileId);
            const content = data[moduleKey];
            if (content) {
                const storeKey = moduleKey as keyof AppState;
                const baseName = moduleKey.replace('Data', '');
                const genKey = `is${baseName.charAt(0).toUpperCase() + baseName.slice(1)}Generated` as keyof AppState;
                set({ [storeKey]: content, [genKey]: true } as any);
            }
        } catch (error) {
            console.error(`[Store] loadProjectModule failed for ${moduleKey}:`, error);
        }
    },

    deleteDocument: async (documentId: string) => {
        try {
            await apiService.deleteDocument(documentId);
            toast.success('Project discarded successfully');
        } catch (error: any) {
            console.error('[Store] deleteDocument failed:', error);
            toast.error(error.message || 'Failed to delete project');
            throw error;
        }
    }
}));
