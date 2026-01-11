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
                            // Map DocumentGraph structure to what the UI expects
                            extractedText: docData.nodes?.filter((n: any) => n.type === 'Text' || n.type === 'Heading').map((n: any) => n.content.text).join('\n') || ''
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
            const { jobId, documentId } = await apiService.uploadFile(file);

            // Start Polling
            const data = await pollJobStatus(jobId, documentId);

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
