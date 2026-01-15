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
        setMode,
        setIsProcessingSlides,
        setRenderingProgress,
        setFileType
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
        setIsLoading(true);
        try {
            const isSlideFile = file.name.endsWith('.pptx') || file.name.endsWith('.ppt') || file.name.endsWith('.key');
            const isPdfFile = file.name.endsWith('.pdf');

            const response = await apiService.uploadFile(file);
            const { jobId, documentId } = response;

            setHtmlPreview(response.extractedText || "");
            setFileId(documentId);

            // DEFAULT: Always go to Editor view after upload
            setView("editor");
            setMode('editor');

            if (isPdfFile) {
                setFileType('pdf');
            } else if (isSlideFile) {
                setFileType('pptx');
            } else {
                setFileType('text');
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
                        if (data.chunks) {
                            const slides = data.chunks.map((chunk: any) => ({
                                title: chunk.metadata.slideTitle || `Slide ${chunk.metadata.pageIndex}`,
                                content: chunk.content
                            }));
                            setSlides(slides);
                        }
                    }).catch(err => {
                        console.error("Delayed slide processing failed:", err);
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
                // PDF Path - Now uses Document Viewer
                setIsSlideMode(false); // It's not "Slide Mode" in the global sense (that's for PPTX chat view), but we use slide data for viewer
                setLeftPanelView('editor');

                // Populate slides for PDF Viewer (it needs length and structure)
                if (response.chunks) {
                    const pages = response.chunks.map((chunk: any) => ({
                        title: `Page ${chunk.metadata.pageIndex + 1}`,
                        content: chunk.content
                    }));
                    setSlides(pages);
                    console.log(`[useFileUpload] PDF loaded with ${pages.length} pages.`);
                } else {
                    setSlides([]);
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
