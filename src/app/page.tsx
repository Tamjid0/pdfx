'use client';

import React from "react";
import { marked } from 'marked';
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import Header from "../components/Header";
import Editor from "../components/Editor";
import Artboard from "../components/Artboard";
import ImportChat from "../components/ImportChat";
import Sidebar from "../components/Sidebar";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import LoadingOverlay from "../components/LoadingOverlay";
import * as apiService from "../services/apiService";
import Insights from "../components/Insights";
import Notes from "../components/Notes";
import Flashcards from "../components/Flashcards";
import Quiz from "../components/Quiz";
import Mindmap from "../components/Mindmap";
import Summary from "../components/Summary";
import Chat from "../components/Chat";
import ModeSwitcher from "../components/ModeSwitcher";
import { ExportModal } from "../components/ExportModal";
import { DocumentPreview } from "../components/DocumentPreview/DocumentPreview";
import { PreviewStyleDropdown } from "../components/DocumentPreview/PreviewStyleDropdown";
import { useStore } from "../store/useStore";

// Define generic types for now as we migrate
type Mode = 'summary' | 'insights' | 'notes' | 'quiz' | 'flashcards' | 'mindmap' | 'editor' | 'chat';

interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
}

const Home = () => {
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
        const newUserMessage: ChatMessage = {
            sender: 'user',
            text: message,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };

        // @ts-ignore
        setChatHistory(prev => [...prev, newUserMessage]);

        if (!fileId) {
            setTimeout(() => {
                const aiErrorMessage: ChatMessage = {
                    sender: 'ai',
                    text: "I'm sorry, I can only answer questions based on documents. Please upload or paste a document first so I can assist you!",
                    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                };
                // @ts-ignore
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
                    setIsTyping(false); // Stop "thinking" animation when first chunk arrives

                    // Update the last message in history (the AI message)
                    // @ts-ignore
                    setChatHistory(prev => {
                        const lastMsg = prev[prev.length - 1];
                        if (lastMsg && lastMsg.sender === 'ai' && lastMsg.timestamp === 'streaming...') {
                            return [...prev.slice(0, -1), { ...lastMsg, text: fullAiText }];
                        } else {
                            // Initial AI message placeholder
                            return [...prev, {
                                sender: 'ai',
                                text: fullAiText,
                                timestamp: 'streaming...'
                            }];
                        }
                    });
                },
                (finalText) => {
                    // Final update to set the correct timestamp
                    // @ts-ignore
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
            const errorResponse: ChatMessage = {
                sender: 'ai',
                text: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            };
            // @ts-ignore
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
                console.log("[+] Content embedded in background:", data.fileId);
            }
        } catch (error) {
            console.error("[-] Background embedding failed:", error);
        }
    };

    const handleFileUpload = async (file: File) => {
        console.log("Uploading file:", file.name);
        setIsLoading(true);
        try {
            const data = await apiService.uploadFile(file);
            console.log("API returned extractedText:", data.extractedText.substring(0, 200));

            // Don't parse here - let TiptapEditor handle the content
            // TiptapEditor will convert it to HTML via editor.getHTML()
            setHtmlPreview(data.extractedText);
            setFileId(data.fileId);
            setView("editor");
            setMode('editor');
        } catch (error) {
            console.error("Error uploading file:", error);
            setHtmlPreview(null);
            setFileId(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleScrapeUrl = async (url: string) => {
        console.log("Scraping URL:", url);
        setIsLoading(true);
        try {
            const response = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`);
            if (!response.ok) throw new Error("Failed to scrape URL");
            const data = await response.json();
            setHtmlPreview(data.html);
            setView("editor");
            setMode('editor');

            // Background Embedding
            const textContent = new DOMParser().parseFromString(data.html, "text/html").body.textContent || "";
            triggerBackgroundEmbedding(textContent, url);
        } catch (error) {
            console.error("Error scraping URL:", error);
            setHtmlPreview(null);
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

    const handleGenerate = async (targetMode: Mode) => {
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
            if (!htmlPreview) {
                alert("No content to export.");
                return;
            }
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

            if (!data) {
                alert("No generated content to export.");
                return;
            }
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
            <div className="flex flex-1 overflow-hidden">
                {view !== 'import' && <Sidebar />}
                <main className="flex-1 flex flex-col bg-[#0f0f0f] overflow-hidden relative">
                    {isLoading && <LoadingOverlay />}
                    {view === "import" ? (
                        <div className="flex-1 p-4 md:p-8 overflow-y-auto flex justify-center items-center">
                            <ImportChat
                                onImportUrl={handleScrapeUrl}
                                onPasteContent={handlePasteContent}
                                onFileUpload={handleFileUpload}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-1 overflow-hidden">
                            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${mode === 'editor' ? 'w-[320px]' : 'w-0'}`}>
                                <LeftSidebar />
                            </div>

                            <main className="flex-1 flex flex-col overflow-hidden">
                                <div className="flex-shrink-0 p-2 border-b border-[#222] flex justify-between items-center gap-4 bg-[#0f0f0f]">
                                    <div className="flex items-center justify-between px-6 py-3 border-b border-[#222] bg-[#0a0a0a]">
                                        <button onClick={backToImport} className="px-3 py-1.5 text-xs font-semibold bg-[#222] rounded-md hover:bg-[#333]">Back</button>
                                    </div>
                                    <div className="flex-1 flex justify-center items-center gap-4">
                                        <div className={`inline-flex bg-[#1a1a1a] p-1 rounded-md border border-[#333] ${mode === 'editor' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <button onClick={() => { if (mode !== 'editor') setLeftPanelView('editor') }} className={`px-4 py-2 text-sm font-medium rounded ${leftPanelView === 'editor' && mode !== 'editor' ? 'bg-[#00ff88] text-black' : 'text-white'}`} disabled={mode === 'editor'}>Editor</button>
                                            <button onClick={() => { if (mode !== 'editor') setLeftPanelView('artboard') }} className={`px-4 py-2 text-sm font-medium rounded ${leftPanelView === 'artboard' && mode !== 'editor' ? 'bg-[#00ff88] text-black' : 'text-white'}`} disabled={mode === 'editor'}>Artboard</button>
                                        </div>
                                        <ModeSwitcher currentMode={mode} onModeChange={(newMode) => setMode(newMode as Mode)} />
                                    </div>
                                    <div className="flex-1 flex justify-end items-center gap-2 pr-6">
                                        {['summary', 'insights', 'notes', 'quiz', 'flashcards'].includes(mode) && (
                                            <>
                                                <button
                                                    onClick={() => setPreviewMode(!isPreviewMode)}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${isPreviewMode
                                                        ? 'bg-[#00ff88] text-black shadow-lg shadow-[#00ff88]/20'
                                                        : 'bg-[#1a1a1a] text-white hover:bg-[#222]'
                                                        }`}
                                                    title="Toggle Preview (Cmd/Ctrl+P)"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        {isPreviewMode ? (
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        ) : (
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        )}
                                                    </svg>
                                                    {isPreviewMode ? 'Preview' : 'Interactive'}
                                                </button>
                                                {isPreviewMode && (
                                                    <PreviewStyleDropdown />
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 flex overflow-hidden">
                                    <Allotment>
                                        <Allotment.Pane>
                                            <div className="flex-1 flex flex-col p-6 overflow-y-auto border-r border-[#222] h-full">
                                                {(mode === 'editor' || leftPanelView === 'editor') ? (
                                                    <Editor
                                                        htmlContent={htmlPreview}
                                                        onEditorChange={handleEditorChange}
                                                        onFileUpload={handleFileUpload}
                                                        onPasteContent={handlePasteContent}
                                                    />
                                                ) : (
                                                    <Artboard htmlContent={htmlPreview} isLoading={false} activeNotesToggles={activeNotesToggles} activeInsightsToggles={activeInsightsToggles} onExport={handleExport} />
                                                )}
                                            </div>
                                        </Allotment.Pane>
                                        <Allotment.Pane>
                                            <div className="flex-1 flex flex-col p-6 overflow-y-auto h-full">
                                                {mode === 'editor' ? (
                                                    <Artboard htmlContent={htmlPreview} isLoading={false} activeNotesToggles={activeNotesToggles} activeInsightsToggles={activeInsightsToggles} onExport={handleExport} />
                                                ) : (
                                                    <DocumentPreview mode={mode}>
                                                        {mode === 'summary' && <Summary onGenerate={() => handleGenerate('summary')} />}
                                                        {mode === 'insights' && <Insights onGenerate={() => handleGenerate('insights')} />}
                                                        {mode === 'notes' && <Notes onGenerate={() => handleGenerate('notes')} />}
                                                        {mode === 'flashcards' && <Flashcards onGenerate={() => handleGenerate('flashcards')} />}
                                                        {mode === 'quiz' && <Quiz onGenerate={() => handleGenerate('quiz')} />}
                                                        {mode === 'mindmap' && <Mindmap data={mindmapData} onGenerate={() => handleGenerate('mindmap')} />}
                                                    </DocumentPreview>
                                                )}
                                                {mode === 'chat' && (
                                                    <Chat
                                                        history={chatHistory}
                                                        onSendMessage={handleSendMessage}
                                                        isTyping={isTyping}
                                                    />
                                                )}
                                            </div>
                                        </Allotment.Pane>
                                    </Allotment>
                                </div>
                            </main>

                            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${(mode !== 'editor' && mode !== 'chat') ? 'w-[320px]' : 'w-0'}`}>
                                <RightSidebar
                                    onApplyTools={handleGenerate}
                                    hasGenerated={getHasGenerated()}
                                />
                            </div>
                        </div>
                    )}
                </main>
            </div>
            <ExportModal />
        </div>
    );
};

export default Home;
