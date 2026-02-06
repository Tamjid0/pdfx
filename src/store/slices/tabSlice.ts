import { StateCreator } from 'zustand';
import { AppState, Mode, Revision } from '../types';
import * as apiService from '../../services/apiService';
import { toast } from 'react-hot-toast';

export interface TabSlice {
    localDrafts: Record<string, { id: string; name: string; data: any | null }[]>;
    summaryRevisions: Revision<any>[];
    notesRevisions: Revision<any>[];
    insightsRevisions: Revision<any>[];
    flashcardsRevisions: Revision<any>[];
    quizRevisions: Revision<any>[];
    mindmapRevisions: Revision<any>[];
    activeRevisionIds: Record<Mode, string>;

    addLocalDraft: (module: Mode, name?: string, initialData?: any, skipSync?: boolean) => string;
    closeLocalDraft: (module: Mode, draftId: string) => void;
    renameLocalDraft: (module: Mode, draftId: string, name: string) => void;

    getTabs: (module: Mode) => { id: string; name: string; type: 'draft' | 'revision'; data: any }[];
    ensureTabInvariant: (module: Mode) => void;
    adoptServerContent: (module: Mode, content: any) => void;

    switchRevision: (module: Mode, revisionId: string, skipSync?: boolean) => void;
    deleteRevision: (module: Mode, revisionId: string) => Promise<void>;
    renameRevision: (module: Mode, revisionId: string, name: string) => Promise<void>;
    deleteTab: (module: Mode, tabId: string) => Promise<void>;
    updateRevisionsFromSync: (updatedFields: any) => void;
}

export const createTabSlice: StateCreator<AppState, [], [], TabSlice> = (set, get) => ({
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
    },

    getTabs: (module) => {
        const drafts = get().localDrafts[module] || [];
        const revKey = `${module}Revisions` as keyof AppState;
        const revisions = (get()[revKey] as Revision<any>[]) || [];

        const unifiedDrafts = drafts.map(d => ({ id: d.id, name: d.name, type: 'draft' as const, data: d.data }));
        const unifiedRevisions = revisions.map(r => ({ id: r.id, name: r.name, type: 'revision' as const, data: r.data }));

        return [...unifiedDrafts, ...unifiedRevisions];
    },

    addLocalDraft: (module, name, initialData = null, skipSync = false) => {
        const id = `draft-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`;
        const existing = get().localDrafts[module] || [];
        const draftNumber = existing.length + 1;
        const newDraft = { id, name: name || `Draft ${draftNumber}`, data: initialData };

        const newLocalDrafts = { ...get().localDrafts, [module]: [...existing, newDraft] };
        set({ localDrafts: newLocalDrafts });

        const fileId = get().fileId;
        if (fileId) {
            localStorage.setItem(`pdfx_drafts_${fileId}`, JSON.stringify(newLocalDrafts));
        }

        get().switchRevision(module, id, skipSync);
        return id;
    },

    closeLocalDraft: (module, draftId) => {
        const existing = get().localDrafts[module] || [];
        const filtered = existing.filter(d => d.id !== draftId);
        const revisions = (get()[`${module}Revisions` as keyof AppState] as any[]) || [];

        const fileId = get().fileId;
        const newLocalDrafts = { ...get().localDrafts, [module]: filtered };

        // Atomic wipe if last tab
        if (filtered.length === 0 && revisions.length === 0) {
            const dataKey = `${module}Data` as keyof AppState;
            const genKey = `is${module.charAt(0).toUpperCase() + module.slice(1)}Generated` as keyof AppState;
            set({ [dataKey]: null, [genKey]: false } as any);
            if (fileId) {
                apiService.syncProjectContent(fileId, { [dataKey]: { content: null } }).catch(() => { });
            }
        }

        set({ localDrafts: newLocalDrafts });
        if (fileId) {
            localStorage.setItem(`pdfx_drafts_${fileId}`, JSON.stringify(newLocalDrafts));
        }

        get().ensureTabInvariant(module);
    },

    renameLocalDraft: (module, draftId, name) => {
        const existing = get().localDrafts[module] || [];
        const newLocalDrafts = {
            ...get().localDrafts,
            [module]: existing.map(d => d.id === draftId ? { ...d, name } : d)
        };
        set({ localDrafts: newLocalDrafts });
        const fileId = get().fileId;
        if (fileId) {
            localStorage.setItem(`pdfx_drafts_${fileId}`, JSON.stringify(newLocalDrafts));
        }
    },

    ensureTabInvariant: (module) => {
        const tabs = get().getTabs(module);
        if (tabs.length === 0) {
            get().addLocalDraft(module, `Draft 1`, null, true);
        } else {
            const currentActiveId = get().activeRevisionIds[module];
            if (!currentActiveId || !tabs.find(t => t.id === currentActiveId)) {
                get().switchRevision(module, tabs[0].id, true);
            }
        }
    },

    adoptServerContent: (module, content) => {
        if (!content) return;
        const tabs = get().getTabs(module);
        const hasRevisions = (get()[`${module}Revisions` as keyof AppState] as any[])?.length > 0;

        if (tabs.length === 0) {
            get().addLocalDraft(module, `Imported Content`, content, true);
        } else if (!hasRevisions && tabs.length === 1 && tabs[0].type === 'draft' && !tabs[0].data) {
            // Use specific setter to ensure localStorage sync
            const setterKey = `set${module.charAt(0).toUpperCase() + module.slice(1)}Data` as keyof AppState;
            (get()[setterKey] as Function)(content);
        }
    },

    switchRevision: (module, revisionId, skipSync = false) => set((state) => {
        const dataKey = `${module}Data` as keyof AppState;
        const genKey = `is${module.charAt(0).toUpperCase() + module.slice(1)}Generated` as keyof AppState;
        const newActiveRevisionIds = { ...state.activeRevisionIds, [module]: revisionId };

        if (!revisionId) {
            get().ensureTabInvariant(module);
            return state;
        }

        let content = null;
        if (revisionId.startsWith('draft-')) {
            const draft = state.localDrafts[module]?.find(d => d.id === revisionId);
            content = draft?.data || null;
        } else {
            const revisions = state[`${module}Revisions` as keyof AppState] as Revision<any>[];
            content = revisions?.find(r => r.id === revisionId)?.data || null;
        }

        if (state.fileId && content && !skipSync) {
            apiService.syncProjectContent(state.fileId, { [dataKey]: content }).catch(() => { });
        }

        return {
            [dataKey]: content,
            [genKey]: !!content,
            activeRevisionIds: newActiveRevisionIds
        } as any;
    }),

    deleteRevision: async (module, revisionId) => {
        const { fileId } = get();
        if (!fileId) return;
        try {
            const moduleKey = `${module}Data`;
            const response = await fetch(`/api/v1/documents/${fileId}/revisions/${revisionId}?module=${moduleKey}`, {
                method: 'DELETE',
                headers: await apiService.getAuthHeaders()
            });
            if (!response.ok) throw new Error('Failed to delete revision');

            set((state) => {
                const revKey = `${module}Revisions` as keyof AppState;
                const revisions = state[revKey] as Revision<any>[];
                return { [revKey]: revisions.filter(r => r.id !== revisionId) } as any;
            });

            get().ensureTabInvariant(module);

            if (!get()[`${module}Data` as keyof AppState]) {
                await apiService.syncProjectContent(fileId, { [moduleKey]: { content: null } });
            }
        } catch (error) {
            console.error('Delete revision failed', error);
            toast.error('Failed to delete version');
        }
    },

    renameRevision: async (module, revisionId, name) => {
        const { fileId } = get();
        if (!fileId) return;
        try {
            const moduleKey = `${module}Data`;
            const response = await fetch(`/api/v1/documents/${fileId}/revisions/${revisionId}`, {
                method: 'PATCH',
                headers: await apiService.getAuthHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ module: moduleKey, name })
            });
            if (!response.ok) throw new Error('Failed to rename revision');

            set((state) => {
                const revKey = `${module}Revisions` as keyof AppState;
                const revisions = state[revKey] as Revision<any>[];
                return { [revKey]: revisions.map(r => r.id === revisionId ? { ...r, name } : r) } as any;
            });
        } catch (error) {
            toast.error('Failed to rename version');
        }
    },

    deleteTab: async (module, tabId) => {
        const tabs = get().getTabs(module);
        const tab = tabs.find(t => t.id === tabId);
        if (!tab) return;
        if (tab.type === 'draft') {
            get().closeLocalDraft(module, tabId);
        } else {
            await get().deleteRevision(module, tabId);
        }
    },

    updateRevisionsFromSync: (updatedFields) => set((state) => {
        const newState: any = {};
        for (const [key, value] of Object.entries(updatedFields)) {
            if (key.includes('.')) {
                const [moduleData, field] = key.split('.');
                const module = moduleData.replace('Data', '') as Mode;
                if (field === 'revisions') {
                    newState[`${module}Revisions`] = value;
                } else if (field === 'content') {
                    newState[`${module}Data`] = value;
                }
            }
        }
        return newState;
    })
});
