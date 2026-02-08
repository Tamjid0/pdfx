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
import CollapsibleChatPanel from './CollapsibleChatPanel';

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
    rightSidebarOpen: boolean;
    setRightSidebarOpen: (open: boolean) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
    view, mode, isMounted, isLoading, leftPanelView, isPreviewMode, htmlPreview,
    activeNotesToggles, activeInsightsToggles, chatHistory, isTyping, mindmapData,
    isSummaryGenerated, isInsightsGenerated, isNotesGenerated, isFlashcardsGenerated,
    isQuizGenerated, isMindmapGenerated, isSlideMode, backToImport, setLeftPanelView, setMode,
    setPreviewMode, handleEditorChange, handleFileUpload, handlePasteContent,
    handleScrapeUrl, handleGenerate, handleExport, handleSendMessage, getHasGenerated,
    fileType, fileId,
    rightSidebarOpen, setRightSidebarOpen
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
            // NEW: Exit slide mode (which is just a leftPanelView state)
            if (leftPanelView === 'slides') {
                setLeftPanelView('editor');
                useStore.getState().setIsSlideMode(false);
                return;
            }

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

    const embeddedChats = useStore(state => state.embeddedChats);
    const closeEmbeddedChat = useStore(state => state.closeEmbeddedChat);

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
                            <div className="flex-1 flex overflow-hidden">
                                {isMounted && (
                                    <Allotment>
                                        <Allotment.Pane>
                                            <div className="flex flex-col h-full">
                                                {/* Source Pane Header */}
                                                <div className="flex-shrink-0 h-14 border-b border-[#222] bg-[#0f0f0f] flex items-center justify-between px-4">
                                                    <div className="w-24">
                                                        {isDocumentMode && (
                                                            <button
                                                                onClick={handleBackClick}
                                                                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-gemini-green border border-gemini-green/30 bg-gemini-green/5 rounded hover:bg-gemini-green/10 transition-all"
                                                            >
                                                                Back
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 flex justify-center">
                                                        <ModeSwitcher currentMode={mode} onModeChange={(newMode) => setMode(newMode)} />
                                                    </div>

                                                    <div className="w-24 flex justify-end">
                                                        <div className="inline-flex bg-[#1a1a1a] p-1 rounded-md border border-[#333]">
                                                            {fileType === 'pptx' && isDocumentMode && (
                                                                <div className="px-3 py-0.5 text-[10px] font-bold text-gemini-green flex items-center gap-2">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-gemini-green animate-pulse"></span>
                                                                    Slides
                                                                </div>
                                                            )}
                                                            {fileType === 'pdf' && isDocumentMode && (
                                                                <div className="px-3 py-0.5 text-[10px] font-bold text-gemini-green flex items-center gap-2">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-gemini-green animate-pulse"></span>
                                                                    PDF
                                                                </div>
                                                            )}
                                                            {!isDocumentMode && (
                                                                <div className="px-3 py-0.5 text-[10px] font-bold text-gemini-green flex items-center gap-2">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-gemini-green"></span>
                                                                    Workspace
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

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
                                            </div>
                                        </Allotment.Pane>
                                        {showSecondPane && (
                                            <Allotment.Pane>
                                                <div className="h-full flex flex-col overflow-hidden bg-[#0a0a0a]">
                                                    <div className="flex-1 overflow-hidden p-6">
                                                        {(() => {
                                                            const historyActions = ['summary', 'insights', 'notes', 'quiz', 'flashcards'].includes(mode) ? (
                                                                <RevisionSwitcher module={mode as any} />
                                                            ) : null;

                                                            const interactiveAction = (
                                                                <button
                                                                    onClick={() => setPreviewMode(!isPreviewMode)}
                                                                    className={`px-4 py-2 border rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${isPreviewMode
                                                                        ? 'bg-gemini-green/10 text-gemini-green border-gemini-green/30'
                                                                        : 'bg-[#1a1a1a] text-white border-white/10 hover:bg-white/5'
                                                                        }`}
                                                                >
                                                                    {isPreviewMode ? (
                                                                        <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>INTERACTIVE</>
                                                                    ) : (
                                                                        <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>REVIEW</>
                                                                    )}
                                                                </button>
                                                            );

                                                            const toolsAction = mode !== 'chat' ? (
                                                                <button
                                                                    onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                                                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${rightSidebarOpen
                                                                        ? 'bg-gemini-green text-black shadow-[0_0_20px_rgba(0,255,136,0.3)]'
                                                                        : 'bg-gemini-dark-300 text-gemini-green border border-gemini-green/20 hover:bg-gemini-green/10'
                                                                        }`}
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                                                    </svg>
                                                                    Tools
                                                                </button>
                                                            ) : null;

                                                            if (mode === 'editor') {
                                                                return <Artboard htmlContent={htmlPreview} isLoading={false} activeNotesToggles={activeNotesToggles} activeInsightsToggles={activeInsightsToggles} onExport={handleExport} />;
                                                            }

                                                            if (mode === 'chat') {
                                                                return (
                                                                    <Chat
                                                                        history={chatHistory}
                                                                        onSendMessage={handleSendMessage}
                                                                        onCitationClick={(pageIndex, searchText) => {
                                                                            useStore.getState().setCurrentSlideIndex(pageIndex - 1);
                                                                            if (searchText) {
                                                                                useStore.getState().setPdfSearchText(searchText);
                                                                            }
                                                                        }}
                                                                        isTyping={isTyping}
                                                                    />
                                                                );
                                                            }

                                                            return (
                                                                <>
                                                                    {mode === 'summary' && (
                                                                        <Summary
                                                                            onGenerate={() => handleGenerate('summary')}
                                                                            historyActions={historyActions}
                                                                            interactiveAction={interactiveAction}
                                                                            toolsAction={toolsAction}
                                                                        />
                                                                    )}
                                                                    {mode === 'insights' && (
                                                                        <Insights
                                                                            onGenerate={() => handleGenerate('insights')}
                                                                            historyActions={historyActions}
                                                                            interactiveAction={interactiveAction}
                                                                            toolsAction={toolsAction}
                                                                        />
                                                                    )}
                                                                    {mode === 'notes' && (
                                                                        <Notes
                                                                            onGenerate={() => handleGenerate('notes')}
                                                                            historyActions={historyActions}
                                                                            interactiveAction={interactiveAction}
                                                                            toolsAction={toolsAction}
                                                                        />
                                                                    )}
                                                                    {mode === 'flashcards' && (
                                                                        <Flashcards
                                                                            onGenerate={() => handleGenerate('flashcards')}
                                                                            historyActions={historyActions}
                                                                            interactiveAction={interactiveAction}
                                                                            toolsAction={toolsAction}
                                                                        />
                                                                    )}
                                                                    {mode === 'quiz' && (
                                                                        <Quiz
                                                                            onGenerate={() => handleGenerate('quiz')}
                                                                            historyActions={historyActions}
                                                                            interactiveAction={interactiveAction}
                                                                            toolsAction={toolsAction}
                                                                        />
                                                                    )}
                                                                    {mode === 'mindmap' && (
                                                                        <Mindmap
                                                                            data={mindmapData}
                                                                            onGenerate={() => handleGenerate('mindmap')}
                                                                            historyActions={historyActions}
                                                                            interactiveAction={interactiveAction}
                                                                            toolsAction={toolsAction}
                                                                        />
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </Allotment.Pane>
                                        )}
                                    </Allotment>
                                )}
                            </div>
                        </main>

                        {/* Overlay for mobile/slide-over effect */}
                        {rightSidebarOpen && (
                            <div
                                className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100] transition-opacity duration-300"
                                onClick={() => setRightSidebarOpen(false)}
                            />
                        )}

                        <div
                            className={`fixed top-0 right-0 bottom-0 z-[110] w-[320px] bg-gemini-dark-200 border-l border-gemini-dark-400 shadow-2xl transition-all duration-500 ease-in-out transform ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full'
                                }`}
                        >
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
            {
                showExitConfirm && (
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
                )
            }
            {((mode === 'quiz' || mode === 'flashcards') && Object.entries(embeddedChats).map(([itemId, chat]) => (
                chat.isOpen && (
                    <CollapsibleChatPanel
                        key={itemId}
                        itemId={itemId}
                        itemType={chat.itemType}
                        itemData={chat.itemData}
                        onClose={() => closeEmbeddedChat(itemId)}
                    />
                )
            )))}
        </div >
    );
};

export default MainLayout;
