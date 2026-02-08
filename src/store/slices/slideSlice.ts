import { StateCreator } from 'zustand';
import { AppState } from '../types';

export interface SlideSlice {
    isSlideMode: boolean;
    isProcessingSlides: boolean;
    renderingProgress: number;
    slides: { title: string; content: string }[];
    currentSlideIndex: number;
    selectionMode: boolean;
    activeSelection: {
        x: number;
        y: number;
        width: number;
        height: number;
        pageIndex: number;
        textNodes: string[];
    } | null;

    setIsSlideMode: (isSlideMode: boolean) => void;
    setIsProcessingSlides: (isProcessing: boolean) => void;
    setRenderingProgress: (progress: number) => void;
    setSlides: (slides: { title: string; content: string }[]) => void;
    setCurrentSlideIndex: (index: number) => void;
    nextSlide: () => void;
    prevSlide: () => void;
    setSelectionMode: (mode: boolean) => void;
    setActiveSelection: (selection: {
        x: number;
        y: number;
        width: number;
        height: number;
        pageIndex: number;
        textNodes: string[];
    } | null) => void;
}

export const createSlideSlice: StateCreator<AppState, [], [], SlideSlice> = (set) => ({
    isSlideMode: false,
    isProcessingSlides: false,
    renderingProgress: 0,
    slides: [],
    currentSlideIndex: 0,
    selectionMode: false,
    activeSelection: null,

    setIsSlideMode: (isSlideMode) => set({ isSlideMode }),
    setIsProcessingSlides: (isProcessing) => set({ isProcessingSlides: isProcessing }),
    setRenderingProgress: (progress) => set({ renderingProgress: progress }),
    setSlides: (slides) => set({ slides }),
    setCurrentSlideIndex: (index) => set({ currentSlideIndex: index, activeSelection: null }), // Clear selection on page change
    nextSlide: () => set((state) => ({
        currentSlideIndex: Math.min(state.currentSlideIndex + 1, state.slides.length - 1),
        activeSelection: null
    })),
    prevSlide: () => set((state) => ({
        currentSlideIndex: Math.max(state.currentSlideIndex - 1, 0),
        activeSelection: null
    })),
    setSelectionMode: (mode) => set({ selectionMode: mode }),
    setActiveSelection: (selection) => set({ activeSelection: selection }),
});
