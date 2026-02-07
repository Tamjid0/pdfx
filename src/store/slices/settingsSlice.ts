import { StateCreator } from 'zustand';
import { AppState, GenerationScope, PreviewPreset, Activity, Topic } from '../types';

export interface SettingsSlice {
    summarySettings: any;
    insightsSettings: any;
    notesSettings: any;
    quizSettings: any;
    mindmapSettings: any;
    activeNotesToggles: Record<string, boolean>;
    activeInsightsToggles: Record<string, boolean>;
    previewPreset: PreviewPreset;
    prompt: string;
    generationScope: GenerationScope;
    activeNodeIds: string[] | null;
    studyActivity: Activity[];
    embeddedChats: Record<string, { itemId: string; itemType: 'quiz' | 'flashcard'; itemData: any; isOpen: boolean }>;

    setSummarySettings: (settings: any) => void;
    setQuizSettings: (settings: any) => void;
    setNotesSettings: (settings: any) => void;
    setInsightsSettings: (settings: any) => void;
    setMindmapSettings: (settings: any) => void;
    setPreviewPreset: (preset: PreviewPreset) => void;
    setPrompt: (prompt: string) => void;
    setGenerationScope: (scope: GenerationScope) => void;
    setActiveNodeIds: (ids: string[] | null) => void;
    logActivity: (count?: number) => void;
    openEmbeddedChat: (itemId: string, itemType: 'quiz' | 'flashcard', itemData: any) => void;
    closeEmbeddedChat: (itemId: string) => void;
    closeAllEmbeddedChats: () => void;
    topics: Topic[];
    setTopics: (topics: Topic[]) => void;
    isAppendMode: boolean;
    setIsAppendMode: (val: boolean) => void;
}

export const createSettingsSlice: StateCreator<AppState, [], [], SettingsSlice> = (set, get) => ({
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
        detailLevel: 'comprehensive',
        formatting: 'bullet_points',
        includeExamples: true,
        keyConcepts: true,
        actionItems: false,
        aiSummary: true
    },
    quizSettings: {
        questionCount: 5,
        difficulty: 'medium',
        quizType: 'mixed',
        questionTypes: ['multiple-choice', 'true-false'],
        timed: false,
        timeLimit: 10
    },
    mindmapSettings: {
        layout: 'balanced',
        depth: 2,
        theme: 'default',
        focusMode: false,
        presentationMode: false,
        searchTerm: ''
    },
    activeNotesToggles: {},
    activeInsightsToggles: {},
    previewPreset: 'professional',
    prompt: '',
    generationScope: { type: 'all', value: null },
    activeNodeIds: null,
    studyActivity: [],
    embeddedChats: {},
    topics: [],
    isAppendMode: false,

    setSummarySettings: (settings) => set({ summarySettings: settings }),
    setQuizSettings: (settings) => set({ quizSettings: settings }),
    setNotesSettings: (settings) => set({ notesSettings: settings }),
    setInsightsSettings: (settings) => set({ insightsSettings: settings }),
    setMindmapSettings: (settings) => set({ mindmapSettings: settings }),
    setPreviewPreset: (preset) => set({ previewPreset: preset }),
    setPrompt: (prompt) => set({ prompt }),
    setGenerationScope: (scope) => set({ generationScope: scope }),
    setActiveNodeIds: (ids) => set({ activeNodeIds: ids }),
    setTopics: (topics) => set({ topics }),
    setIsAppendMode: (val) => set({ isAppendMode: val }),

    logActivity: (count = 1) => {
        const today = new Date().toISOString().split('T')[0];
        const activity = [...get().studyActivity];
        const index = activity.findIndex(a => a.date === today);
        if (index !== -1) {
            activity[index].count += count;
        } else {
            activity.push({ date: today, count });
        }
        set({ studyActivity: activity });
    },

    openEmbeddedChat: (itemId, itemType, itemData) => set((state) => ({
        embeddedChats: { ...state.embeddedChats, [itemId]: { itemId, itemType, itemData, isOpen: true } }
    })),
    closeEmbeddedChat: (itemId) => set((state) => {
        const { [itemId]: removed, ...rest } = state.embeddedChats;
        return { embeddedChats: rest };
    }),
    closeAllEmbeddedChats: () => set({ embeddedChats: {} }),
});
