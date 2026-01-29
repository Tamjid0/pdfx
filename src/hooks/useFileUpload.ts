import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useAuth } from '../hooks/useAuth';
import * as apiService from '../services/apiService';

export const useFileUpload = () => {
    const { user } = useAuth();
    const {
        setIsLoading,
        setHtmlPreview,
        setFileId,
        setView,
        setSlides,
        setIsSlideMode,
        setLeftPanelView,
        setMode,
        setIsProcessingSlides,
        setRenderingProgress,
        setFileType,
        resetWorkspace,
        updateStats,
        setTopics
    } = useStore();

    const pollJobStatus = async (jobId: string, documentId: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                try {
                    const status = await apiService.getJobStatus(jobId);

                    // Update progress if available
                    if (status.progress) {
                        setRenderingProgress(status.progress);
                    }

                    if (status.state === 'completed') {
                        clearInterval(interval);
                        setIsProcessingSlides(false);
                        setRenderingProgress(100);

                        const docData = await apiService.fetchDocument(documentId);

                        resolve({
                            ...docData,
                            fileId: documentId,
                            extractedText: docData.extractedText || ''
                        });
                    } else if (status.state === 'failed') {
                        clearInterval(interval);
                        setIsProcessingSlides(false);
                        reject(new Error(status.failedReason || 'Job failed'));
                    }
                } catch (error) {
                    clearInterval(interval);
                    setIsProcessingSlides(false);
                    reject(error);
                }
            }, 1500);
        });
    };

    const handleFileUpload = async (file: File) => {
        resetWorkspace();
        setIsLoading(true);
        try {
            const isSlideFile = file.name.endsWith('.pptx') || file.name.endsWith('.ppt') || file.name.endsWith('.key');
            const isPdfFile = file.name.endsWith('.pdf');

            const response = await apiService.uploadFile(file, user?.uid || 'guest');
            const { jobId, documentId, extractedText, topics, metadata } = response;

            setFileId(documentId);
            setHtmlPreview(extractedText || "");
            setTopics(topics || []);
            if (extractedText || metadata) {
                updateStats(extractedText || "", metadata?.pageCount || 1);
            }

            // DEFAULT: Check if we are in import view, if so, switch to default editor mode
            // Otherwise, keep the current mode (e.g., if user is in Chat, stay in Chat)
            if (useStore.getState().view === 'import') {
                setView("editor");
                setMode('editor');
            }

            if (isPdfFile) {
                setFileType('pdf');
                // Don't auto-fill editor for PDF
                setHtmlPreview('');
            } else if (isSlideFile) {
                setFileType('pptx');
            } else {
                setFileType('text');
                setHtmlPreview(response.extractedText || "");
            }

            if (isSlideFile) {
                // IMMEDIATE TRANSITION for PPTX
                setIsSlideMode(true);
                setLeftPanelView('slides');
                setMode('chat'); // Open chat by default so they can interact

                if (jobId) {
                    setIsProcessingSlides(true);
                    setRenderingProgress(5);
                    pollJobStatus(jobId, documentId).then(data => {
                        // After polling completes, sync the full state
                        setHtmlPreview(data.extractedText || "");
                        setTopics(data.topics || []);
                        updateStats(data.extractedText || "", data.metadata?.pageCount || 1);

                        if (isSlideFile && data.chunks) {
                            const slides = data.chunks.map((chunk: any) => ({
                                title: chunk.metadata.slideTitle || `Slide ${chunk.metadata.pageIndex}`,
                                content: chunk.content
                            }));
                            setSlides(slides);
                        }
                    }).catch(err => {
                        console.error("Background processing failed:", err);
                    });
                } else if (response.chunks) {
                    // Synchronous case (if someone tweaked backend or direct PDF)
                    const slides = response.chunks.map((chunk: any) => ({
                        title: chunk.metadata.slideTitle || `Slide ${chunk.metadata.pageIndex}`,
                        content: chunk.content
                    }));
                    setSlides(slides);
                }
            } else if (isPdfFile) {
                // PDF Path - Now uses Client-Side Viewer
                setIsSlideMode(false);
                setLeftPanelView('editor'); // Left panel will show DocumentViewer

                if (jobId) {
                    setIsProcessingSlides(true);
                    setRenderingProgress(5);
                    pollJobStatus(jobId, documentId).then(data => {
                        setHtmlPreview(data.extractedText || "");
                        setTopics(data.topics || []);
                        updateStats(data.extractedText || "", data.metadata?.pageCount || 1);
                    }).catch(err => {
                        console.error("Background PDF processing failed:", err);
                    });
                } else {
                    setIsProcessingSlides(false);
                    setRenderingProgress(100);
                }

            } else {
                // Text/Other Path
                setIsSlideMode(false);
                setLeftPanelView('editor');
                setSlides([]);
            }

            return response;
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return { handleFileUpload };
};
