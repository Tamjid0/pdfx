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

export interface Insight {
    title: string;
    description: string;
    type?: string;
}

export interface AdaptiveBlock {
    type: string;
    title?: string;
    content?: string | string[];
    items?: any[];
    source_pages?: number[];
    language?: string;
}

export interface NotesData {
    notes?: NoteSection[];
    blocks?: AdaptiveBlock[];
}

export interface InsightsData {
    insights?: Insight[];
    blocks?: AdaptiveBlock[];
}

export interface Flashcard {
    question: string;
    answer: string;
    interval?: number;
    ease?: number;
    dueDate?: string;
    state?: 'new' | 'learning' | 'review' | 'relearning';
    hint?: string;
    hintNodeIds?: string[];
}

export interface FlashcardsData {
    flashcards: Flashcard[];
}

export type QuizItem = {
    type: 'mc';
    question: string;
    options: { label: string; value: string; }[];
    correctAnswer: string;
    hint?: string;
    hintNodeIds?: string[];
} | {
    type: 'tf';
    question: string;
    correctAnswer: string;
    hint?: string;
    hintNodeIds?: string[];
} | {
    type: 'fib';
    question: string;
    correctAnswer: string;
    hint?: string;
    hintNodeIds?: string[];
} | {
    type: 'sa';
    question: string;
    correctAnswer: string;
    hint?: string;
    hintNodeIds?: string[];
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

export interface Revision<T> {
    id: string;
    name: string;
    data: T;
    timestamp: string;
    scope?: GenerationScope;
}

export interface Topic {
    id: string;
    title: string;
    label: string;
    startPage: number;
    endPage: number;
    pageRange?: [number, number];
}

export interface Activity {
    date: string;
    count: number;
}

export interface GenerationScope {
    type: 'all' | 'pages' | 'topics';
    value: null | [number, number] | string[];
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

export interface AppState {
    htmlPreview: string | null;
    isLoading: boolean;
    isPageLoading: boolean;
    isDocumentLoading: boolean;
    isHydrating: boolean;

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
    mindmapRevisions: Revision<MindmapData>[];
    activeRevisionIds: Record<Mode, string>;
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

    // Settings
    summarySettings: any;
    insightsSettings: any;
    notesSettings: any;
    quizSettings: any;
    mindmapSettings: any;

    // Generation Flags
    isSummaryGenerated: boolean;
    isInsightsGenerated: boolean;
    isNotesGenerated: boolean;
    isFlashcardsGenerated: boolean;
    isQuizGenerated: boolean;
    isMindmapGenerated: boolean;

    // Gamification
    studyActivity: Activity[];
    logActivity: (count?: number) => void;

    // Toggles
    activeNotesToggles: Record<string, boolean>;
    activeInsightsToggles: Record<string, boolean>;

    // Preview
    previewPreset: PreviewPreset;
    prompt: string;

    // Smart Chunking
    topics: Topic[];
    setTopics: (topics: Topic[]) => void;
    activeNodeIds: string[] | null;
    setActiveNodeIds: (ids: string[] | null) => void;

    // Auth
    headersLoaded: boolean;
    setHeadersLoaded: (loaded: boolean) => void;
    authHeaders: Record<string, string>;
    setAuthHeaders: (headers: Record<string, string>) => void;

    generationScope: GenerationScope;
    setGenerationScope: (scope: GenerationScope) => void;
    isAppendMode: boolean;
    setIsAppendMode: (val: boolean) => void;

    // Embedded Chats
    embeddedChats: Record<string, { itemId: string; itemType: 'quiz' | 'flashcard'; itemData: any; isOpen: boolean }>;
    openEmbeddedChat: (itemId: string, itemType: 'quiz' | 'flashcard', itemData: any) => void;
    closeEmbeddedChat: (itemId: string) => void;
    closeAllEmbeddedChats: () => void;

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
    switchRevision: (module: Mode, revisionId: string, skipSync?: boolean) => Promise<void>;
    updateRevisionsFromSync: (updatedFields: any) => void;
    deleteRevision: (module: Mode, revisionId: string) => Promise<void>;
    renameRevision: (module: Mode, revisionId: string, name: string) => Promise<void>;
    deleteTab: (module: Mode, tabId: string) => Promise<void>;

    // Workspace Management
    resetWorkspace: () => void;

    // Study Continuity
    loadProject: (documentId: string) => Promise<void>;
    refreshCurrentProject: (documentId?: string) => Promise<void>;
    loadProjectModule: (moduleKey: string) => Promise<void>;
    deleteDocument: (documentId: string) => Promise<void>;

    // Local Draft Management
    localDrafts: Record<string, { id: string; name: string; data: any | null }[]>;
    addLocalDraft: (module: Mode, name?: string, initialData?: any, skipSync?: boolean) => Promise<string>;
    closeLocalDraft: (module: Mode, draftId: string) => Promise<void>;
    renameLocalDraft: (module: Mode, draftId: string, name: string) => void;

    // Global Tab Accessor
    getTabs: (module: Mode) => { id: string; name: string; type: 'draft' | 'revision'; data: any }[];
    reconcileProjectTabs: (module: Mode, serverContent: any, serverRevisions: Revision<any>[], forceSyncOnSwitch?: boolean) => Promise<void>;
    ensureMinimumOneTab: (module: Mode) => Promise<void>;
}
