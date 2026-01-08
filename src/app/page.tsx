'use client';

import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import MainLayout from "../components/MainLayout";
import { ExportModal } from "../components/ExportModal";
import * as apiService from "../services/apiService";
import { useStore } from "../store/useStore";

const Home = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const {
        htmlPreview, setHtmlPreview,
        isLoading, setIsLoading,
        view, setView,
        mode, setMode,
        leftPanelView, setLeftPanelView,
        mindmapData, setMindmapData,
        setInsightsData,
        setNotesData,
        setQuizData,
        setFlashcardsData,
        setSummaryData,
        chatHistory, setChatHistory,
        fileId, setFileId,
        quizSettings,
        summarySettings,
        mindmapSettings,
        notesSettings,
        insightsSettings,
        isSummaryGenerated, setIsSummaryGenerated,
        isInsightsGenerated, setIsInsightsGenerated,
        isNotesGenerated, setIsNotesGenerated,
        isFlashcardsGenerated, setIsFlashcardsGenerated,
        isQuizGenerated, setIsQuizGenerated,
        isMindmapGenerated, setIsMindmapGenerated,
        activeNotesToggles,
        activeInsightsToggles,
        isPreviewMode, setPreviewMode,
        isTyping, setIsTyping,
        stats, setStats,
        openExportModal,
        summaryData, insightsData, notesData, quizData, flashcardsData,
    } = useStore();

    const handleSendMessage = async (message: string) => {
        const newUserMessage = {
            sender: 'user',
            text: message,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };

        setChatHistory(prev => [...prev, newUserMessage]);

        if (!fileId) {
            setTimeout(() => {
                const aiErrorMessage = {
                    sender: 'ai',
                    text: "I'm sorry, I can only answer questions based on documents. Please upload or paste a document first so I can assist you!",
                    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                };
                setChatHistory(prev => [...prev, aiErrorMessage]);
            }, 500);
            return;
        }

        setIsTyping(true);

        try {
            let fullAiText = '';

            await apiService.chatWithDocumentStream(
                message,
                fileId,
                (chunk) => {
                    fullAiText += chunk;
                    setIsTyping(false);

                    setChatHistory(prev => {
                        const lastMsg = prev[prev.length - 1];
                        if (lastMsg && lastMsg.sender === 'ai' && lastMsg.timestamp === 'streaming...') {
                            return [...prev.slice(0, -1), { ...lastMsg, text: fullAiText }];
                        } else {
                            return [...prev, {
                                sender: 'ai',
                                text: fullAiText,
                                timestamp: 'streaming...'
                            }];
                        }
                    });
                },
                (finalText) => {
                    setChatHistory(prev => {
                        return [...prev.slice(0, -1), {
                            sender: 'ai',
                            text: finalText,
                            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                        }];
                    });
                    setIsTyping(false);
                }
            );
        } catch (error) {
            console.error("Error sending message:", error);
            setIsTyping(false);
            const errorResponse = {
                sender: 'ai',
                text: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            };
            setChatHistory(prev => [...prev.slice(0, -1), errorResponse]);
        }
    };

    const backToImport = () => {
        setView("import");
        setMode("editor");
    };

    const handleEditorChange = (html: string, text: string) => {
        setHtmlPreview(html);
        const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
        const chars = text.length;
        const lines = text.split("\n").length;
        const readTime = Math.ceil(words / 200);
        setStats({ wordCount: words, charCount: chars, lineCount: lines, readTime: readTime });
    };

    const triggerBackgroundEmbedding = async (text: string, name?: string) => {
        if (!text.trim()) return;
        try {
            const data = await apiService.embedText(text, name);
            if (data.fileId) {
                setFileId(data.fileId);
            }
        } catch (error) {
            console.error("Background embedding failed:", error);
        }
    };

    const handleFileUpload = async (file: File) => {
        setIsLoading(true);
        try {
            const data = await apiService.uploadFile(file);
            setHtmlPreview(data.extractedText);
            setFileId(data.fileId);
            setView("editor");
            setMode('editor');
        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleScrapeUrl = async (url: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`);
            if (!response.ok) throw new Error("Failed to scrape URL");
            const data = await response.json();
            setHtmlPreview(data.html);
            setView("editor");
            setMode('editor');

            const textContent = new DOMParser().parseFromString(data.html, "text/html").body.textContent || "";
            triggerBackgroundEmbedding(textContent, url);
        } catch (error) {
            console.error("Error scraping URL:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasteContent = (content?: string) => {
        setView("editor");
        setHtmlPreview(typeof content === 'string' ? content : "");
        setMode('editor');

        if (typeof content === 'string' && content.trim()) {
            triggerBackgroundEmbedding(content, "Pasted Content");
        }
    };

    const handleGenerate = async (targetMode: any) => {
        if (!htmlPreview) return;

        const payload: any = { settings: {} };
        if (fileId) {
            payload.fileId = fileId;
        } else {
            const textContent = new DOMParser().parseFromString(htmlPreview, "text/html").body.textContent || "";
            if (!textContent) return;
            payload.text = textContent;
        }

        let settings: any = {};
        switch (targetMode) {
            case 'summary': settings = summarySettings; break;
            case 'insights': settings = insightsSettings; break;
            case 'notes': settings = notesSettings; break;
            case 'quiz': settings = quizSettings; break;
            case 'mindmap': settings = mindmapSettings; break;
            default: settings = {};
        }
        payload.settings = settings;

        if (targetMode === 'summary') {
            const maxWords = Math.floor(stats.wordCount / 3);
            const targetWords = Math.floor(maxWords * (settings.summaryLength / 100));
            payload.settings = { ...settings, targetWordCount: targetWords };
        }

        setIsLoading(true);
        try {
            switch (targetMode) {
                case 'insights':
                    const resultInsights = await apiService.fetchInsights(payload);
                    setInsightsData(resultInsights);
                    setIsInsightsGenerated(true);
                    break;
                case 'notes':
                    const resultNotes = await apiService.fetchNotes(payload);
                    setNotesData(resultNotes);
                    setIsNotesGenerated(true);
                    break;
                case 'quiz':
                    const quiz = await apiService.fetchQuiz(payload);
                    setQuizData(quiz);
                    setIsQuizGenerated(true);
                    break;
                case 'flashcards':
                    const flashcards = await apiService.fetchFlashcards(payload);
                    setFlashcardsData(flashcards);
                    setIsFlashcardsGenerated(true);
                    break;
                case 'mindmap':
                    const mindmap = await apiService.fetchMindmap(payload);
                    setMindmapData(mindmap);
                    setIsMindmapGenerated(true);
                    break;
                case 'summary':
                    const summary = await apiService.generateSummary(payload);
                    setSummaryData(summary);
                    setIsSummaryGenerated(true);
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error(`Error fetching data for ${targetMode}:`, error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        if (mode === 'editor') {
            if (!htmlPreview) return;
            openExportModal('editor', htmlPreview);
        } else {
            let data = null;
            switch (mode) {
                case 'summary': data = summaryData; break;
                case 'insights': data = insightsData; break;
                case 'notes': data = notesData; break;
                case 'quiz': data = quizData; break;
                case 'flashcards': data = flashcardsData; break;
                case 'mindmap': data = mindmapData; break;
                default: data = null;
            }
            if (!data) return;
            openExportModal(mode, data);
        }
    };

    const getHasGenerated = () => {
        switch (mode) {
            case 'summary': return isSummaryGenerated;
            case 'insights': return isInsightsGenerated;
            case 'notes': return isNotesGenerated;
            case 'flashcards': return isFlashcardsGenerated;
            case 'quiz': return isQuizGenerated;
            case 'mindmap': return isMindmapGenerated;
            default: return false;
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#0a0a0a] text-white font-sans">
            <Header />
            <MainLayout
                view={view}
                mode={mode}
                isMounted={isMounted}
                isLoading={isLoading}
                leftPanelView={leftPanelView}
                isPreviewMode={isPreviewMode}
                htmlPreview={htmlPreview}
                activeNotesToggles={activeNotesToggles}
                activeInsightsToggles={activeInsightsToggles}
                chatHistory={chatHistory}
                isTyping={isTyping}
                mindmapData={mindmapData}
                isSummaryGenerated={isSummaryGenerated}
                isInsightsGenerated={isInsightsGenerated}
                isNotesGenerated={isNotesGenerated}
                isFlashcardsGenerated={isFlashcardsGenerated}
                isQuizGenerated={isQuizGenerated}
                isMindmapGenerated={isMindmapGenerated}
                backToImport={backToImport}
                setLeftPanelView={setLeftPanelView}
                setMode={setMode}
                setPreviewMode={setPreviewMode}
                handleEditorChange={handleEditorChange}
                handleFileUpload={handleFileUpload}
                handlePasteContent={handlePasteContent}
                handleScrapeUrl={handleScrapeUrl}
                handleGenerate={handleGenerate}
                handleExport={handleExport}
                handleSendMessage={handleSendMessage}
                getHasGenerated={getHasGenerated}
            />
            <ExportModal />
        </div>
    );
};

export default Home;
