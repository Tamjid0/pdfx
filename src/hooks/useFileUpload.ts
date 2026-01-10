import { useState } from 'react';
import { useStore } from '../store/useStore';
import * as apiService from '../services/apiService';

export const useFileUpload = () => {
    const {
        setIsLoading,
        setHtmlPreview,
        setFileId,
        setView,
        setSlides,
        setIsSlideMode,
        setLeftPanelView,
        setMode
    } = useStore();

    const handleFileUpload = async (file: File) => {
        setIsLoading(true);
        try {
            const isSlideFile = file.name.endsWith('.pptx') || file.name.endsWith('.ppt') || file.name.endsWith('.key');
            const data = await apiService.uploadFile(file);

            setHtmlPreview(data.extractedText);
            setFileId(data.fileId);
            setView("editor");

            if (data.slides && data.slides.length > 0) {
                setSlides(data.slides);
                setIsSlideMode(true);
                setLeftPanelView('slides');
                setMode('editor');
            } else if (isSlideFile) {
                setSlides([
                    { title: "Processing Error", content: "Could not extract slides from this file." }
                ]);
                setIsSlideMode(true);
                setLeftPanelView('slides');
                setMode('editor');
            } else {
                setIsSlideMode(false);
                setLeftPanelView('editor');
                setMode('editor');
            }
            return data;
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return { handleFileUpload };
};
