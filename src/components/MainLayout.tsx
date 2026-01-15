'use client';

import React from 'react';
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import Sidebar from "./Sidebar";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import LoadingOverlay from "./LoadingOverlay";
import Editor from "./Editor";
import Artboard from "./Artboard";
import SlidePipelineContainer from "./slides/SlidePipelineContainer";
import ImportChat from "./ImportChat";
import ModeSwitcher from "./ModeSwitcher";
import { DocumentPreview } from "./DocumentPreview/DocumentPreview";
import { PreviewStyleDropdown } from "./DocumentPreview/PreviewStyleDropdown";
import Summary from "./Summary";
import Insights from "./Insights";
import Notes from "./Notes";
import Flashcards from "./Flashcards";
import Quiz from "./Quiz";
import Mindmap from "./Mindmap";
import Chat from "./Chat";

interface MainLayoutProps {
    view: string;
    mode: string;
    isMounted: boolean;
    isLoading: boolean;
    leftPanelView: string;
    isPreviewMode: boolean;
    htmlPreview: string | null;
    activeNotesToggles: any;
    activeInsightsToggles: any;
    chatHistory: any[];
    isTyping: boolean;
    mindmapData: any;
    isSummaryGenerated: boolean;
    isInsightsGenerated: boolean;
    isNotesGenerated: boolean;
    isFlashcardsGenerated: boolean;
    isQuizGenerated: boolean;
    isMindmapGenerated: boolean;
    isSlideMode: boolean;
    backToImport: () => void;
    setLeftPanelView: (view: string) => void;
    setMode: (mode: any) => void;
    setPreviewMode: (mode: boolean) => void;
    handleEditorChange: (html: string, text: string) => void;
    handleFileUpload: (file: File) => void;
    handlePasteContent: (content?: string) => void;
    handleScrapeUrl: (url: string) => void;
    handleGenerate: (mode: any) => void;
    handleExport: () => void;
    handleSendMessage: (message: string) => void;
    getHasGenerated: () => boolean;
    fileType?: string | null;
    fileId?: string | null;
}

const MainLayout: React.FC<MainLayoutProps> = ({
    view, mode, isMounted, isLoading, leftPanelView, isPreviewMode, htmlPreview,
    activeNotesToggles, activeInsightsToggles, chatHistory, isTyping, mindmapData,
    isSummaryGenerated, isInsightsGenerated, isNotesGenerated, isFlashcardsGenerated,
    isQuizGenerated, isMindmapGenerated, isSlideMode, backToImport, setLeftPanelView, setMode,
    setPreviewMode, handleEditorChange, handleFileUpload, handlePasteContent,
    handleScrapeUrl, handleGenerate, handleExport, handleSendMessage, getHasGenerated,
    fileType, fileId
}) => {
    // Check if we are in PDF viewing mode
    const isPdfMode = fileType === 'pdf' && !!fileId;

    // Hide the second pane (Artboard) if we are in PDF mode and the mode is 'editor' (default)
    // This allows the PDF viewer to take full width ("Middle")
    const showSecondPane = !isPdfMode || mode !== 'editor';

    return (
        <div className="flex flex-1 overflow-hidden">
            {view !== 'import' && isMounted && <Sidebar />}
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
                        <div className={`${isMounted ? 'transition-all duration-500 ease-in-out' : ''} overflow-hidden ${mode === 'editor' ? 'w-[320px]' : 'w-0'}`}>
                            <LeftSidebar />
                        </div>

                        <main className="flex-1 flex flex-col overflow-hidden">
                            <div className="flex-shrink-0 p-2 border-b border-[#222] flex justify-between items-center gap-4 bg-[#0f0f0f]">
                                <div className="flex items-center justify-between px-6 py-3 border-b border-[#222] bg-[#0a0a0a]">
                                    <button onClick={backToImport} className="px-3 py-1.5 text-xs font-semibold bg-[#222] rounded-md hover:bg-[#333]">Back</button>
                                </div>
                                <div className="flex-1 flex justify-center items-center gap-4">
                                    <div className={`inline-flex bg-[#1a1a1a] p-1 rounded-md border border-[#333] ${mode === 'editor' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        {!isSlideMode && !isPdfMode && (
                                            <>
                                                <button onClick={() => { if (mode !== 'editor') setLeftPanelView('editor') }} className={`px-4 py-2 text-sm font-medium rounded ${leftPanelView === 'editor' && mode !== 'editor' ? 'bg-[#00ff88] text-black' : 'text-white'}`} disabled={mode === 'editor'}>Editor</button>
                                                <button onClick={() => { if (mode !== 'editor') setLeftPanelView('artboard') }} className={`px-4 py-2 text-sm font-medium rounded ${leftPanelView === 'artboard' && mode !== 'editor' ? 'bg-[#00ff88] text-black' : 'text-white'}`} disabled={mode === 'editor'}>Artboard</button>
                                            </>
                                        )}
                                        {isSlideMode && (
                                            <button onClick={() => { if (mode !== 'editor') setLeftPanelView('slides') }} className={`px-4 py-2 text-sm font-medium rounded ${leftPanelView === 'slides' && mode !== 'editor' ? 'bg-[#00ff88] text-black' : 'text-white'}`} disabled={mode === 'editor'}>Slides</button>
                                        )}
                                        {isPdfMode && (
                                            <div className="px-4 py-2 text-sm font-bold text-[#00ff88] flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-[#00ff88]"></span>
                                                PDF Viewer
                                            </div>
                                        )}
                                    </div>
                                    <ModeSwitcher currentMode={mode} onModeChange={(newMode) => setMode(newMode)} />
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
                                {isMounted && (
                                    <Allotment>
                                        <Allotment.Pane>
                                            <div className="flex-1 flex flex-col overflow-y-auto border-r border-[#222] h-full">
                                                {leftPanelView === 'slides' ? (
                                                    <SlidePipelineContainer />
                                                ) : (mode === 'editor' || leftPanelView === 'editor') ? (
                                                    <div className="p-6 h-full flex flex-col">
                                                        <Editor
                                                            htmlContent={htmlPreview}
                                                            onEditorChange={handleEditorChange}
                                                            onFileUpload={handleFileUpload}
                                                            onPasteContent={handlePasteContent}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="p-6 h-full flex flex-col">
                                                        <Artboard htmlContent={htmlPreview} isLoading={false} activeNotesToggles={activeNotesToggles} activeInsightsToggles={activeInsightsToggles} onExport={handleExport} />
                                                    </div>
                                                )}
                                            </div>
                                        </Allotment.Pane>
                                        {showSecondPane && (
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
                                        )}
                                    </Allotment>
                                )}
                            </div>
                        </main>

                        <div className={`${isMounted ? 'transition-all duration-500 ease-in-out' : ''} overflow-hidden ${(mode !== 'editor' && mode !== 'chat') ? 'w-[320px]' : 'w-0'}`}>
                            <RightSidebar
                                onApplyTools={handleGenerate}
                                hasGenerated={getHasGenerated()}
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MainLayout;
