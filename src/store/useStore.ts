import { create } from 'zustand';
import { AppState } from './types';
import { createUISlice } from './slices/uiSlice';
import { createProjectSlice } from './slices/projectSlice';
import { createContentSlice } from './slices/contentSlice';
import { createTabSlice } from './slices/tabSlice';
import { createSlideSlice } from './slices/slideSlice';
import { createSettingsSlice } from './slices/settingsSlice';

export * from './types';

export const useStore = create<AppState>()((...a) => ({
    ...createUISlice(...a),
    ...createProjectSlice(...a),
    ...createContentSlice(...a),
    ...createTabSlice(...a),
    ...createSlideSlice(...a),
    ...createSettingsSlice(...a),
}));
