import { StateCreator } from 'zustand';
import { AppState, Topic, Mode } from '../types';
import * as apiService from '../../services/apiService';
import { getContent } from '../utils';
import { toast } from 'react-hot-toast';

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
    topics: Topic[];
    isAppendMode: boolean;
    templates: any[];
    pdfSearchText: string | null;

    setFileId: (id: string | null) => void;
    setFileType: (type: 'pdf' | 'pptx' | 'text' | null) => void;
    setTopics: (topics: Topic[]) => void;
    setIsAppendMode: (val: boolean) => void;
    setTemplates: (templates: any[]) => void;
    setPdfSearchText: (text: string | null) => void;
    updateStats: (text: string, pageCount?: number) => void;

    loadProject: (documentId: string) => Promise<void>;
    resetWorkspace: () => void;
    deleteDocument: (documentId: string) => Promise<void>;
}

export const createProjectSlice: StateCreator<AppState, [], [], ProjectSlice> = (set, get) => ({
    fileId: null,
    fileType: null,
    stats: { wordCount: 0, charCount: 0, lineCount: 0, readTime: 0, pageCount: 1 },
    topics: [],
    isAppendMode: false,
    templates: [],
    pdfSearchText: null,

    setFileId: (id) => set({ fileId: id }),
    setFileType: (type) => set({ fileType: type }),
    setTopics: (topics) => set({ topics }),
    setIsAppendMode: (val) => set({ isAppendMode: val }),
    setTemplates: (templates) => set({ templates }),
    setPdfSearchText: (text) => set({ pdfSearchText: text }),
    setStats: (stats) => set({ stats }),

    updateStats: (text, pageCount) => {
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
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
            activeRevisionIds: {
                summary: '', notes: '', insights: '', flashcards: '', quiz: '', mindmap: '', editor: '', chat: '', slides: ''
            }
        });
    },

    loadProject: async (documentId) => {
        set({ isLoading: true });
        try {
            const data = await apiService.fetchDocument(documentId);
            const typeStr = data.type || '';
            const isPptx = typeStr.includes('presentation') || typeStr.includes('powerpoint') || typeStr.includes('pptx');
            const isPdf = typeStr.includes('pdf');

            set({
                fileId: data.documentId,
                fileType: isPdf ? 'pdf' : (isPptx ? 'pptx' : 'text'),
                htmlPreview: (isPdf || isPptx) ? null : (data.extractedText || ''),
                summaryData: getContent(data.summaryData),
                notesData: getContent(data.notesData),
                flashcardsData: getContent(data.flashcardsData),
                quizData: getContent(data.quizData),
                insightsData: getContent(data.insightsData),
                mindmapData: data.mindmapData,
                chatHistory: data.chatHistory || [],
                summaryRevisions: data.summaryData?.revisions || [],
                notesRevisions: data.notesData?.revisions || [],
                flashcardsRevisions: data.flashcardsData?.revisions || [],
                quizRevisions: data.quizData?.revisions || [],
                insightsRevisions: data.insightsData?.revisions || [],
                isSummaryGenerated: !!getContent(data.summaryData),
                isNotesGenerated: !!getContent(data.notesData),
                isFlashcardsGenerated: !!getContent(data.flashcardsData),
                isQuizGenerated: !!getContent(data.quizData),
                isMindmapGenerated: !!data.mindmapData,
                isInsightsGenerated: !!getContent(data.insightsData),
                topics: data.topics || [],
                view: 'viewer',
                mode: (get().mode !== 'editor' && getContent(data[`${get().mode}Data`])) ? get().mode : (getContent(data.summaryData) ? 'summary' : 'editor'),
                leftPanelView: isPptx ? 'slides' : 'editor',
                isSlideMode: isPptx,
                activeRevisionIds: {
                    summary: '', notes: '', insights: '', flashcards: '', quiz: '', mindmap: '', editor: '', chat: '', slides: ''
                }
            });

            get().updateStats(data.extractedText || "", data.metadata?.pageCount || 1);

            if (isPptx && data.chunks && data.chunks.length > 0) {
                const slides = data.chunks.map((chunk: any) => ({
                    title: chunk.metadata?.slideTitle || `Slide ${chunk.metadata?.pageIndex || 1}`,
                    content: chunk.content
                }));
                set({ slides, currentSlideIndex: 0 });
            }

            // Persistence: Load drafts
            const savedDrafts = localStorage.getItem(`pdfx_drafts_${data.documentId}`);
            if (savedDrafts) {
                set({ localDrafts: JSON.parse(savedDrafts) });
            }

            // Maintenance: Enforce invariants & Adoption
            const modules: Mode[] = ['summary', 'notes', 'insights', 'flashcards', 'quiz', 'mindmap'];
            modules.forEach(m => {
                get().ensureTabInvariant(m);
                const content = getContent(data[`${m}Data`]);
                get().adoptServerContent(m, content);
            });

            get().ensureTabInvariant(get().mode);

        } catch (error) {
            console.error('[Store] loadProject failed:', error);
            toast.error('Failed to load project.');
        } finally {
            set({ isLoading: false });
        }
    },

    refreshCurrentProject: async (documentId) => {
        const id = documentId || get().fileId;
        if (!id) return;
        try {
            const data = await apiService.fetchDocument(id);
            set({
                summaryRevisions: data.summaryData?.revisions || [],
                notesRevisions: data.notesData?.revisions || [],
                flashcardsRevisions: data.flashcardsData?.revisions || [],
                quizRevisions: data.quizData?.revisions || [],
                insightsRevisions: data.insightsData?.revisions || [],
            });
        } catch (error) {
            console.error('Refresh project failed', error);
        }
    },

    loadProjectModule: async (moduleKey) => {
        const { fileId } = get();
        if (!fileId) return;
        try {
            const data = await apiService.fetchDocument(fileId);
            const moduleData = data[moduleKey];
            const revisions = moduleData?.revisions || [];
            const module = moduleKey.replace('Data', '') as Mode;

            set({
                [`${module}Revisions`]: revisions
            } as any);

            // Re-enforce invariant for this module
            get().ensureTabInvariant(module);
        } catch (error) {
            console.error('Load project module failed', error);
        }
    },

    deleteDocument: async (documentId) => {
        try {
            await apiService.deleteDocument(documentId);
            toast.success('Project discarded successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete project');
            throw error;
        }
    }
});
