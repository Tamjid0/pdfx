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

    const pollJobStatus = async (jobId: string, documentId: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                try {
                    const status = await apiService.getJobStatus(jobId);
                    if (status.state === 'completed') {
                        clearInterval(interval);

                        // After completion, we can fetch the full document data if needed
                        // or just return the final result if worker returns enough info
                        const docDataResponse = await fetch(`/api/v1/documents/${documentId}`);
                        if (!docDataResponse.ok) throw new Error('Failed to fetch processed document');
                        const docData = await docDataResponse.json();

                        resolve({
                            ...docData,
                            fileId: documentId,
                            extractedText: docData.extractedText || ''
                        });
                    } else if (status.state === 'failed') {
                        clearInterval(interval);
                        reject(new Error(status.failedReason || 'Job failed'));
                    }
                    // Optional: Update global loading state or progress bar here
                } catch (error) {
                    clearInterval(interval);
                    reject(error);
                }
            }, 1500); // Poll every 1.5 seconds
        });
    };

    const handleFileUpload = async (file: File) => {
        setIsLoading(true);
        try {
            const isSlideFile = file.name.endsWith('.pptx') || file.name.endsWith('.ppt') || file.name.endsWith('.key');
            const response = await apiService.uploadFile(file);
            const { jobId, documentId } = response;

            let data;
            if (jobId) {
                // Background Path: Start Polling
                data = await pollJobStatus(jobId, documentId);
            } else {
                // Synchronous Fallback Path: Data is already in the response
                console.log("[useFileUpload] Processed synchronously (Redis unavailable)");
                data = {
                    ...response,
                    fileId: documentId,
                    extractedText: response.extractedText || ''
                };
            }

            setHtmlPreview(data.extractedText);
            setFileId(data.fileId);

            // DEFAULT: Always go to Editor view after upload
            setView("editor");
            setMode('editor');

            // Only enable Slide Mode if it's explicitly a presentation file
            if (isSlideFile && data.chunks && data.chunks.length > 0) {
                const slides = data.chunks.map((chunk: any) => ({
                    title: chunk.metadata.slideTitle || `Slide ${chunk.metadata.pageIndex}`,
                    content: chunk.content
                }));
                setSlides(slides);
                setIsSlideMode(true);
                // We keep the left panel as editor by default as requested
                setLeftPanelView('editor');
            } else {
                setIsSlideMode(false);
                setLeftPanelView('editor');
                setSlides([]);
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
