import { StateCreator } from 'zustand';
import { AppState, Mode, Revision } from '../types';
import * as apiService from '../../services/apiService';
import { toast } from 'react-hot-toast';
import { getContent } from '../utils';

export interface ProjectSlice {
    fileId: string | null;
    fileType: 'pdf' | 'pptx' | 'text' | null;
    stats: {
        wordCount: number;
        charCount: number;
        lineCount: number;
        readTime: number;
        pageCount: number;
    };
    isLoading: boolean;
    isHydrating: boolean;
    setFileId: (id: string | null) => void;
    setFileType: (type: 'pdf' | 'pptx' | 'text' | null) => void;
    setStats: (stats: any) => void;
    updateStats: (text: string, pageCount?: number) => void;

    resetWorkspace: () => void;
    loadProject: (documentId: string) => Promise<void>;
    refreshCurrentProject: (documentId?: string) => Promise<void>;
    loadProjectModule: (moduleKey: string) => Promise<void>;
    pdfSearchText: string | null;
    setPdfSearchText: (text: string | null) => void;
}

export const createProjectSlice: StateCreator<AppState, [], [], ProjectSlice> = (set, get) => ({
    fileId: null,
    fileType: null,
    stats: { wordCount: 0, charCount: 0, lineCount: 0, readTime: 0, pageCount: 1 },
    isLoading: false,
    isHydrating: false,
    pdfSearchText: null,

    setFileId: (id) => set({ fileId: id }),
    setFileType: (type) => set({ fileType: type }),
    setStats: (stats) => set({ stats }),
    setPdfSearchText: (text) => set({ pdfSearchText: text }),

    updateStats: (text, pageCount) => {
        const words = text.trim().split(/\s+/).length;
        const chars = text.length;
        const readTime = Math.ceil(words / 200);
        set((state) => ({
            stats: {
                ...state.stats,
                wordCount: words,
                charCount: chars,
                readTime,
                pageCount: pageCount !== undefined ? pageCount : state.stats.pageCount
            }
        }));
    },

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
            view: 'import',
            mode: 'editor',
            leftPanelView: 'editor',
            localDrafts: {
                summary: [], notes: [], insights: [], flashcards: [], quiz: [], mindmap: []
            },
            summaryRevisions: [],
            notesRevisions: [],
            insightsRevisions: [],
            flashcardsRevisions: [],
            quizRevisions: [],
            mindmapRevisions: [],
            activeRevisionIds: {
                summary: '', notes: '', insights: '', flashcards: '', quiz: '', mindmap: '', editor: '', chat: '', slides: ''
            }
        });
    },

    loadProject: async (documentId) => {
        // Prevent concurrent hydration calls which cause tab doubling
        if (get().isHydrating) return;
        set({ isHydrating: true });

        get().resetWorkspace();
        set({ isLoading: true });
        try {
            const data = await apiService.fetchDocument(documentId);
            set({
                fileId: data.documentId || data.fileId, // Use documentId as primary source
                fileType: data.fileType || 'pdf',
                stats: data.stats || { wordCount: 0, charCount: 0, lineCount: 0, readTime: 0, pageCount: 1 },
                isPreviewMode: false,
                htmlPreview: data.pdfUrl || data.originalFile?.url || null,
                view: 'editor' // Restore view state to fix redirect to import
            });

            // Hydrate Revisions from server
            const modules: Mode[] = ['summary', 'notes', 'insights', 'flashcards', 'quiz', 'mindmap'];
            modules.forEach(m => {
                const revisions = data[`${m}Data`]?.revisions || [];
                set({ [`${m}Revisions`]: revisions } as any);
            });

            // Rehydrate Local Drafts
            const savedDrafts = localStorage.getItem(`pdfx_drafts_${documentId}`);
            if (savedDrafts) {
                set({ localDrafts: JSON.parse(savedDrafts) });
            }

            // Maintenance: Unified Hydration (Run exactly once)
            modules.forEach(m => {
                const content = getContent(data[`${m}Data`]);
                const revisions = (get()[`${m}Revisions` as keyof AppState] as any[]) || [];
                get().reconcileProjectTabs(m, content, revisions);
            });

        } catch (error) {
            console.error('[Store] loadProject failed:', error);
            toast.error('Failed to load project');
        } finally {
            set({ isLoading: false, isHydrating: false });
        }
    },

    refreshCurrentProject: async (documentId) => {
        const id = documentId || get().fileId;
        // Strict guard: Prevent 400 errors by validating ID is a UUID
        if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            return;
        }
        try {
            const data = await apiService.fetchDocument(id);
            const modules: Mode[] = ['summary', 'notes', 'insights', 'flashcards', 'quiz', 'mindmap'];
            modules.forEach(m => {
                const revisions = data[`${m}Data`]?.revisions || [];
                set({ [`${m}Revisions`]: revisions } as any);
            });
        } catch (error) {
            console.error('[Store] refreshCurrentProject failed:', error);
        }
    },

    loadProjectModule: async (moduleKey) => {
        const fileId = get().fileId;
        // Strict guard: Prevent 400 errors by validating ID is a UUID
        if (!fileId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(fileId)) {
            return;
        }
        try {
            const data = await apiService.fetchDocument(fileId);
            const moduleData = data[`${moduleKey}Data`];
            const content = getContent(moduleData);
            const module = moduleKey as Mode;
            const revisions = moduleData?.revisions || [];

            set({ [`${moduleKey}Revisions`]: revisions } as any);
            get().reconcileProjectTabs(module, content, revisions);
        } catch (error) {
            console.error('[Store] loadProjectModule failed:', error);
        }
    }
});
