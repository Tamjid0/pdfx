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
    closeLocalDraft: (module: Mode, draftId: string) => Promise<void>;
    renameLocalDraft: (module: Mode, draftId: string, name: string) => void;

    getTabs: (module: Mode) => { id: string; name: string; type: 'draft' | 'revision'; data: any }[];
    reconcileProjectTabs: (module: Mode, serverContent: any, serverRevisions: Revision<any>[]) => void;
    ensureMinimumOneTab: (module: Mode) => void;

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
        console.trace('TAB WRITE: addLocalDraft', { module, name, existingDrafts: get().localDrafts[module] });
        const existing = get().localDrafts[module] || [];

        // --- STRICT "NEW TAB" POLICY ---
        // 2024-01-29 Fix: Clicking "+" MUST always create a new tab. 
        // We do NOT reuse empty drafts. We do NOT check for duplicates of empty drafts.
        // We only check for content duplicates if data is provided (to prevent "Imported Content" doubling).

        if (initialData) {
            const stringifiedData = JSON.stringify(initialData);
            const contentDup = existing.find(d => d.data && JSON.stringify(d.data) === stringifiedData);
            if (contentDup) {
                get().switchRevision(module, contentDup.id, skipSync);
                return contentDup.id;
            }
        }

        // Check revision count too for accurate "Draft X" numbering
        const revisions = get()[`${module}Revisions` as keyof AppState] as any[] || [];
        const totalTabs = existing.length + revisions.length;

        // Ensure name is unique if not provided
        let finalName = name;
        if (!finalName) {
            let counter = totalTabs + 1;
            finalName = `Draft ${counter}`;
            // Simple overlap check
            while (
                existing.some(d => d.name === finalName) ||
                revisions.some(r => r.name === finalName)
            ) {
                counter++;
                finalName = `Draft ${counter}`;
            }
        }

        const id = `draft-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`;
        const newDraft = { id, name: finalName, data: initialData };

        const newLocalDrafts = { ...get().localDrafts, [module]: [...existing, newDraft] };
        set({ localDrafts: newLocalDrafts });

        get().switchRevision(module, id, skipSync);
        return id;
    },

    closeLocalDraft: async (module, draftId) => {
        const existing = get().localDrafts[module] || [];
        const filtered = existing.filter(d => d.id !== draftId);
        const revisions = (get()[`${module}Revisions` as keyof AppState] as any[]) || [];

        const fileId = get().fileId;
        const newLocalDrafts = { ...get().localDrafts, [module]: filtered };

        // --- TOTAL SERVER WIPE ON LAST TAB ---
        if (filtered.length === 0 && revisions.length === 0) {
            const dataKey = `${module}Data` as keyof AppState;
            const genKey = `is${module.charAt(0).toUpperCase() + module.slice(1)}Generated` as keyof AppState;

            // Set local state to null
            set({ [dataKey]: null, [genKey]: false } as any);

            if (fileId) {
                // ABSOLUTE WIPE: Send null for the entire module object to MongoDB
                // preventSnapshot: true stops the backend from creating a "zombie" revision
                await apiService.syncProjectContent(fileId, { [dataKey]: null }, { preventSnapshot: true } as any).catch(() => { });
            }
        }

        set({ localDrafts: newLocalDrafts });

        // Reconcile to ensure we always have at least ONE tab if revisions exist, 
        // or a new Draft 1 if we're now totally empty.
        get().reconcileProjectTabs(module, null, revisions);
        get().ensureMinimumOneTab(module);
    },

    renameLocalDraft: (module, draftId, name) => {
        const existing = get().localDrafts[module] || [];
        const newLocalDrafts = {
            ...get().localDrafts,
            [module]: existing.map(d => d.id === draftId ? { ...d, name } : d)
        };
        set({ localDrafts: newLocalDrafts });
    },

    reconcileProjectTabs: (module, serverContent, serverRevisions) => {
        console.trace('TAB WRITE: reconcileProjectTabs', { module, serverContent, serverRevisions });
        const drafts = get().localDrafts[module] || [];
        const revisions = serverRevisions || [];
        const activeId = get().activeRevisionIds[module];

        // 1. If we ALREADY have tabs, just ensure one is active or switched correctly.
        // We do NOT add more tabs here to prevent the "doubling" bug.
        if (drafts.length > 0 || revisions.length > 0) {
            const allIds = [...drafts.map(d => d.id), ...revisions.map(r => r.id)];
            if (!activeId || !allIds.includes(activeId)) {
                get().switchRevision(module, allIds[0], true);
            }
            return;
        }

        // 2. If NO tabs exist at all (not in LocalStorage, not in revisions):
        // Check for orphan server content (Legacy data that wasn't previously wrapped in a revision)
        // STRICTER CHECK: Ensure content is not just an empty object or string
        const hasValidContent = serverContent && (
            (typeof serverContent === 'string' && serverContent.trim().length > 0) ||
            (typeof serverContent === 'object' && Object.keys(serverContent).length > 0)
        );

        if (hasValidContent) {
            get().addLocalDraft(module, 'Imported Content', serverContent, true);
            return;
        }


        // 3. Absolute fallback is NO LONGER handled here.
        // It is now the responsibility of ensureMinimumOneTab()
    },

    ensureMinimumOneTab: (module) => {
        const drafts = get().localDrafts[module] || [];
        const revKey = `${module}Revisions` as keyof AppState;
        const revisions = (get()[revKey] as Revision<any>[]) || [];

        // Only create a default draft if there are absolutely NO tabs (no drafts, no revisions)
        if (drafts.length === 0 && revisions.length === 0) {
            console.trace('TAB WRITE: ensureMinimumOneTab creating default draft', { module });
            get().addLocalDraft(module, 'Draft 1', null, true);
        }
    },

    switchRevision: (module, revisionId, skipSync = false) => set((state) => {
        const dataKey = `${module}Data` as keyof AppState;
        const genKey = `is${module.charAt(0).toUpperCase() + module.slice(1)}Generated` as keyof AppState;
        const newActiveRevisionIds = { ...state.activeRevisionIds, [module]: revisionId };

        if (!revisionId) {
            console.error('switchRevision called with null ID');
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
            apiService.syncProjectContent(state.fileId, { [dataKey]: content })
                .then(() => toast.success('Synced to Cloud', { id: `sync-${module}`, duration: 1500 }))
                .catch(() => { });
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
        set({ isLoading: true });
        try {
            const moduleKey = `${module}Data`;
            const response = await fetch(`/api/v1/documents/${fileId}/revisions/${revisionId}?module=${moduleKey}`, {
                method: 'DELETE',
                headers: await apiService.getAuthHeaders()
            });
            if (!response.ok) throw new Error('Failed to delete revision');

            let updatedRevisions: Revision<any>[] = [];
            set((state) => {
                const revKey = `${module}Revisions` as keyof AppState;
                const revisions = state[revKey] as Revision<any>[];
                updatedRevisions = revisions.filter(r => r.id !== revisionId);
                return { [revKey]: updatedRevisions } as any;
            });

            // Re-reconcile after revision deletion
            get().reconcileProjectTabs(module, null, updatedRevisions);
            get().ensureMinimumOneTab(module);

            // If the module is now totally empty, ensure server is wiped
            // preventSnapshot: true stops the backend from creating a "zombie" revision
            if (updatedRevisions.length === 0 && (get().localDrafts[module] || []).length === 0) {
                await apiService.syncProjectContent(fileId, { [moduleKey]: null }, { preventSnapshot: true } as any);
                toast.success('Project content wiped permanently');
            } else {
                toast.success('Version deleted');
            }
        } catch (error) {
            console.error('Delete revision failed', error);
            toast.error('Failed to delete version');
        } finally {
            set({ isLoading: false });
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

        set({ isLoading: true });
        try {
            if (tab.type === 'draft') {
                await get().closeLocalDraft(module, tabId);
            } else {
                await get().deleteRevision(module, tabId);
            }
        } catch (error) {
            console.error('Delete tab failed', error);
        } finally {
            setTimeout(() => set({ isLoading: false }), 300);
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
