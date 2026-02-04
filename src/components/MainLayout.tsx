'use client';

import { useStore } from '../store/useStore';
import React from 'react';
import { useRouter } from 'next/navigation';

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
import { RevisionSwitcher } from "./dashboard/RevisionSwitcher";
import HideContentToggle from "./HideContentToggle";

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
    chatHistory: { role: 'user' | 'assistant' | 'ai'; content: string; timestamp?: string }[];
    isTyping: boolean;
    mindmapData: any; // Keeping any for complex mindmap structure for now
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
    const router = useRouter();
    const [showExitConfirm, setShowExitConfirm] = React.useState(false);

    // Check if we are in document viewing mode (PDF or Slides)
    const isDocumentMode = !!fileId;

    // Hide the second pane (Artboard) if we are in a document project and the mode is 'editor'
    // This allows the document renderer (PDF or Slides) to take full width
    const showSecondPane = !isDocumentMode || mode !== 'editor';

    const handleBackClick = () => {
        if (isDocumentMode) {
            if (mode !== 'editor') {
                // If in a study/mode view, go back to editor mode first
                setMode('editor');
            } else {
                // If already in editor mode, show exit confirmation
                setShowExitConfirm(true);
            }
        } else {
            backToImport();
        }
    };

    const confirmExit = () => {
        useStore.getState().resetWorkspace();
        // Clear project ID from URL when exiting session
        router.replace('/');
        setShowExitConfirm(false);
    };

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
                                <div className="flex items-center justify-between px-6 py-3">
                                    {isDocumentMode && (
                                        <button
                                            onClick={handleBackClick}
                                            className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-[#00ff88] border border-[#00ff88]/30 bg-[#00ff88]/5 rounded-md hover:bg-[#00ff88]/10 hover:border-[#00ff88]/60 transition-all shadow-[0_0_10px_rgba(0,255,136,0.1)] hover:shadow-[0_0_15px_rgba(0,255,136,0.2)]"
                                        >
                                            Back
                                        </button>
                                    )}
                                </div>
                                <div className="flex-1 flex justify-center items-center gap-4">
                                    <div className={`inline-flex bg-[#1a1a1a] p-1 rounded-md border border-[#333] ${mode === 'editor' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        {!isDocumentMode && (
                                            <>
                                                <button onClick={() => { if (mode !== 'editor') setLeftPanelView('editor') }} className={`px-4 py-2 text-sm font-medium rounded ${leftPanelView === 'editor' && mode !== 'editor' ? 'bg-[#00ff88] text-black' : 'text-white'}`} disabled={mode === 'editor'}>Editor</button>
                                                <button onClick={() => { if (mode !== 'editor') setLeftPanelView('artboard') }} className={`px-4 py-2 text-sm font-medium rounded ${leftPanelView === 'artboard' && mode !== 'editor' ? 'bg-[#00ff88] text-black' : 'text-white'}`} disabled={mode === 'editor'}>Artboard</button>
                                            </>
                                        )}
                                        {fileType === 'pptx' && isDocumentMode && (
                                            <div className="px-4 py-2 text-sm font-bold text-[#00ff88] flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-[#00ff88]"></span>
                                                Slide Viewer
                                            </div>
                                        )}
                                        {fileType === 'pdf' && isDocumentMode && (
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
                                            <RevisionSwitcher module={mode as any} />
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
                                            <HideContentToggle
                                                storageKey={`source_visibility_${fileId || 'default'}`}
                                                enabled={['quiz', 'flashcards'].includes(mode)}
                                            >
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
                                            </HideContentToggle>
                                        </Allotment.Pane>
                                        {showSecondPane && (
                                            <Allotment.Pane>
                                                <div className="h-full flex flex-col p-6 overflow-hidden">
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
                                                            onCitationClick={(pageIndex, searchText) => {
                                                                // Convert 1-based page index to 0-based for the store
                                                                useStore.getState().setCurrentSlideIndex(pageIndex - 1);
                                                                // Store search text for PDF viewer to use
                                                                if (searchText) {
                                                                    useStore.getState().setPdfSearchText(searchText);
                                                                }
                                                            }}
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
                )
                }
            </main >
            {/* Confirmation Modal */}
            {showExitConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
                    <div className="bg-[#1a1a1a] border border-[#333] p-6 rounded-2xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 slide-in-from-bottom-2 duration-200 ring-1 ring-white/10">
                        <div className="flex items-center gap-3 mb-4 text-white">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 text-yellow-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold">End Session?</h3>
                        </div>

                        <p className="text-[#888] text-sm mb-6 leading-relaxed">
                            Are you sure you want to close this file? Your current interaction session will be ended.
                        </p>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowExitConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-[#888] hover:text-white hover:bg-[#333] rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmExit}
                                className="px-4 py-2 text-sm font-bold bg-[#222] text-[#ff4444] border border-[#333] hover:bg-[#ff4444] hover:text-white hover:border-transparent rounded-xl transition-all shadow-lg"
                            >
                                End Session
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default MainLayout;
