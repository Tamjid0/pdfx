'use client';

import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import MainLayout from "../components/MainLayout";
import { ExportModal } from "../components/ExportModal";
import * as apiService from "../services/apiService";
import { useStore } from "../store/useStore";
import { toast } from 'react-hot-toast';

import { useFileUpload } from "../hooks/useFileUpload";
import { useChat } from "../hooks/useChat";
import AuthGuard from "../components/auth/AuthGuard";

const Home = () => {
    const [isMounted, setIsMounted] = useState(false);
    const { handleFileUpload } = useFileUpload();
    const { handleSendMessage } = useChat();

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
        isSlideMode, setIsSlideMode, setSlides, fileType, updateStats,
        resetWorkspace, setIsPageLoading, setTopics, isAppendMode, generationScope,
        updateRevisionsFromSync, refreshCurrentProject
    } = useStore();

    const backToImport = () => {
        setView("import");
        setMode("editor");
    };

    const handleEditorChange = (html: string, text: string) => {
        setHtmlPreview(html);
        updateStats(text);
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


    const handleScrapeUrl = async (url: string) => {
        resetWorkspace();
        setIsPageLoading(true);
        try {
            const response = await fetch(`/api/v1/scrape?url=${encodeURIComponent(url)}`);
            if (!response.ok) throw new Error("Failed to scrape URL");
            const data = await response.json();
            setHtmlPreview(data.html);
            setView("editor");
            setMode('editor');

            const textContent = new DOMParser().parseFromString(data.html, "text/html").body.textContent || "";
            updateStats(textContent);
            triggerBackgroundEmbedding(textContent, url);
        } catch (error) {
            toast.error("Failed to scrape URL. Please check the URL and try again.");
            console.error("Error scraping URL:", error);
        } finally {
            setIsPageLoading(false);
        }
    };

    const handlePasteContent = (content?: string) => {
        resetWorkspace();
        setView("editor");
        const safeContent = typeof content === 'string' ? content : "";
        setHtmlPreview(safeContent);
        setMode('editor');

        if (safeContent.trim()) {
            updateStats(safeContent);
            triggerBackgroundEmbedding(safeContent, "Pasted Content");
        }
    };

    const handleGenerate = async (targetMode: any) => {
        if (!htmlPreview && !fileId) return;
        const {
            setIsGeneratingSummary, setIsGeneratingInsights, setIsGeneratingNotes,
            setIsGeneratingFlashcards, setIsGeneratingQuiz, setIsGeneratingMindmap,
            generationScope
        } = useStore.getState();

        const payload: any = { settings: {}, scope: generationScope };
        if (fileId) {
            payload.fileId = fileId;
        } else {
            const textContent = new DOMParser().parseFromString(htmlPreview, "text/html").body.textContent || "";
            if (!textContent) return;
            payload.text = textContent;
        }

        let settings: any = {};
        switch (targetMode) {
            case 'summary': settings = summarySettings; setIsGeneratingSummary(true); break;
            case 'insights': settings = insightsSettings; setIsGeneratingInsights(true); break;
            case 'notes': settings = notesSettings; setIsGeneratingNotes(true); break;
            case 'quiz': settings = quizSettings; setIsGeneratingQuiz(true); break;
            case 'mindmap': settings = mindmapSettings; setIsGeneratingMindmap(true); break;
            case 'flashcards': setIsGeneratingFlashcards(true); break;
            default: settings = {};
        }
        payload.settings = settings;

        if (targetMode === 'summary') {
            const maxWords = Math.floor(stats.wordCount / 3);
            const targetWords = Math.floor(maxWords * (settings.summaryLength / 100));
            payload.settings = { ...settings, targetWordCount: targetWords };
        }

        try {
            switch (targetMode) {
                case 'insights':
                    const resultInsights = await apiService.fetchInsights(payload);
                    setInsightsData(resultInsights);
                    setIsInsightsGenerated(true);
                    if (fileId) {
                        const syncRes = await apiService.syncProjectContent(fileId, { insightsData: resultInsights }, { append: isAppendMode, scope: generationScope });
                        if (syncRes.updatedFields) updateRevisionsFromSync(syncRes.updatedFields);
                        await refreshCurrentProject(fileId);
                    }
                    break;
                case 'notes':
                    const resultNotes = await apiService.fetchNotes(payload);
                    setNotesData(resultNotes);
                    setIsNotesGenerated(true);
                    if (fileId) {
                        const syncRes = await apiService.syncProjectContent(fileId, { notesData: resultNotes }, { append: isAppendMode, scope: generationScope });
                        if (syncRes.updatedFields) updateRevisionsFromSync(syncRes.updatedFields);
                        await refreshCurrentProject(fileId);
                    }
                    break;
                case 'quiz':
                    const quiz = await apiService.fetchQuiz(payload);
                    setQuizData(quiz);
                    setIsQuizGenerated(true);
                    if (fileId) {
                        const syncRes = await apiService.syncProjectContent(fileId, { quizData: quiz }, { append: isAppendMode, scope: generationScope });
                        if (syncRes.updatedFields) updateRevisionsFromSync(syncRes.updatedFields);
                        await refreshCurrentProject(fileId);
                    }
                    break;
                case 'flashcards':
                    const flashcards = await apiService.fetchFlashcards(payload);
                    setFlashcardsData(flashcards);
                    setIsFlashcardsGenerated(true);
                    if (fileId) {
                        const syncRes = await apiService.syncProjectContent(fileId, { flashcardsData: flashcards }, { append: isAppendMode, scope: generationScope });
                        if (syncRes.updatedFields) updateRevisionsFromSync(syncRes.updatedFields);
                        await refreshCurrentProject(fileId);
                    }
                    break;
                case 'mindmap':
                    const mindmap = await apiService.fetchMindmap(payload);
                    setMindmapData(mindmap);
                    setIsMindmapGenerated(true);
                    if (fileId) {
                        const syncRes = await apiService.syncProjectContent(fileId, { mindmapData: mindmap }, { append: isAppendMode, scope: generationScope });
                        if (syncRes.updatedFields) updateRevisionsFromSync(syncRes.updatedFields);
                        await refreshCurrentProject(fileId);
                    }
                    break;
                case 'summary':
                    const summary = await apiService.generateSummary(payload);
                    setSummaryData(summary);
                    setIsSummaryGenerated(true);
                    if (fileId) {
                        const syncRes = await apiService.syncProjectContent(fileId, { summaryData: summary }, { append: isAppendMode, scope: generationScope });
                        if (syncRes.updatedFields) updateRevisionsFromSync(syncRes.updatedFields);
                        await refreshCurrentProject(fileId);
                    }
                    break;
                default:
                    break;
            }
        } catch (error) {
            toast.error(`Generation failed for ${targetMode}. Please try again.`);
            console.error(`Error fetching data for ${targetMode}:`, error);
        } finally {
            switch (targetMode) {
                case 'summary': setIsGeneratingSummary(false); break;
                case 'insights': setIsGeneratingInsights(false); break;
                case 'notes': setIsGeneratingNotes(false); break;
                case 'quiz': setIsGeneratingQuiz(false); break;
                case 'mindmap': setIsGeneratingMindmap(false); break;
                case 'flashcards': setIsGeneratingFlashcards(false); break;
            }
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
        <AuthGuard>
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
                    isSlideMode={isSlideMode}
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
                    fileType={fileType}
                    fileId={fileId}
                />
                <ExportModal />
            </div>
        </AuthGuard>
    );
};

export default Home;
