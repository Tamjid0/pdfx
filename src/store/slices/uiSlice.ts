import { StateCreator } from 'zustand';
import { AppState, Mode, PreviewPreset } from '../types';

export interface UISlice {
    isLoading: boolean;
    isPageLoading: boolean;
    isDocumentLoading: boolean;
    view: 'import' | 'editor' | 'viewer';
    mode: Mode;
    leftPanelView: 'editor' | 'artboard' | 'slides';
    isPreviewMode: boolean;
    isTyping: boolean;
    showExportModal: boolean;
    exportMode: string;
    exportContent: any;
    headersLoaded: boolean;
    authHeaders: Record<string, string>;

    setIsLoading: (loading: boolean) => void;
    setIsPageLoading: (loading: boolean) => void;
    setIsDocumentLoading: (loading: boolean) => void;
    setView: (view: 'import' | 'editor' | 'viewer') => void;
    setMode: (mode: Mode) => void;
    setLeftPanelView: (view: 'editor' | 'artboard' | 'slides') => void;
    setPreviewMode: (preview: boolean) => void;
    setIsTyping: (typing: boolean) => void;
    setHeadersLoaded: (loaded: boolean) => void;
    setAuthHeaders: (headers: Record<string, string>) => void;
    openExportModal: (mode: string, content: any) => void;
    closeExportModal: () => void;
}

export const createUISlice: StateCreator<AppState, [], [], UISlice> = (set) => ({
    isLoading: false,
    isPageLoading: false,
    isDocumentLoading: false,
    view: 'import',
    mode: 'editor',
    leftPanelView: 'editor',
    isPreviewMode: false,
    isTyping: false,
    showExportModal: false,
    exportMode: 'editor',
    exportContent: null,
    headersLoaded: false,
    authHeaders: {},

    setIsLoading: (loading) => set({ isLoading: loading }),
    setIsPageLoading: (loading) => set({ isPageLoading: loading }),
    setIsDocumentLoading: (loading) => set({ isDocumentLoading: loading }),
    setView: (view) => set({ view }),
    setMode: (mode) => set({ mode }),
    setLeftPanelView: (view) => set({ leftPanelView: view }),
    setPreviewMode: (preview) => set({ isPreviewMode: preview }),
    setIsTyping: (typing) => set({ isTyping: typing }),
    setHeadersLoaded: (loaded) => set({ headersLoaded: loaded }),
    setAuthHeaders: (headers) => set({ authHeaders: headers }),
    openExportModal: (mode, content) => set({ showExportModal: true, exportMode: mode, exportContent: content }),
    closeExportModal: () => set({ showExportModal: false }),
});
