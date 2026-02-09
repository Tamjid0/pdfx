import { useStore } from '../store/useStore';
import * as apiService from '../services/apiService';
import { useEffect } from 'react';

export const useChat = () => {
    const {
        fileId,
        setChatHistory,
        setIsTyping,
        activeSelection,
        setActiveSelection,
        chatHistory
    } = useStore();

    // Load chat history when fileId changes
    useEffect(() => {
        if (!fileId) {
            setChatHistory([]);
            return;
        }

        // Load chat history from backend
        apiService.fetchDocumentData(fileId)
            .then(data => {
                if (data.chatHistory && Array.isArray(data.chatHistory)) {
                    setChatHistory(data.chatHistory);
                }
            })
            .catch(err => {
                console.error('[useChat] Failed to load chat history:', err);
            });
    }, [fileId, setChatHistory]);

    const handleSendMessage = async (message: string) => {
        const newUserMessage = {
            role: 'user' as const,
            content: message,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            // Optional: attach selection info to the local message for UI reference if needed
            selection: activeSelection ? { pageIndex: activeSelection.pageIndex, nodesCount: activeSelection.textNodes.length } : undefined
        };

        setChatHistory(prev => [...prev, newUserMessage]);

        if (!fileId) {
            setTimeout(() => {
                const aiErrorMessage = {
                    role: 'ai' as const,
                    content: "I'm sorry, I can only answer questions based on documents. Please upload or paste a document first so I can assist you!",
                    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                };
                setChatHistory(prev => [...prev, aiErrorMessage]);
            }, 500);
            return;
        }

        setIsTyping(true);

        try {
            let streamedText = '';

            // Add a placeholder AI message for streaming
            setChatHistory(prev => [...prev, {
                role: 'ai',
                content: '',
                timestamp: 'streaming...'
            }]);

            const selectionNodeIds = activeSelection?.nodeIds || [];

            if (activeSelection && selectionNodeIds.length === 0) {
                setChatHistory(prev => [...prev, {
                    role: 'ai',
                    content: "⚠️ **No text detected in this selection.**\n\nThis specific area might be an image, or the document needs to be **re-uploaded** to apply the latest text extraction updates.",
                    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                }]);
            }

            // Clear selection immediately so it doesn't persist in UI while streaming
            setActiveSelection(null);

            await apiService.chatWithDocumentStream(
                message,
                fileId,
                (chunk) => {
                    streamedText += chunk;
                    // Update the last message in the history with the streamed text
                    setChatHistory(prev => {
                        const newHistory = [...prev];
                        if (newHistory.length > 0) {
                            newHistory[newHistory.length - 1] = {
                                ...newHistory[newHistory.length - 1],
                                content: streamedText
                            };
                        }
                        return newHistory;
                    });
                },
                (finalText) => {
                    // Update the streaming message with final timestamp
                    setChatHistory(prev => {
                        const newHistory = [...prev];
                        if (newHistory.length > 0) {
                            newHistory[newHistory.length - 1] = {
                                ...newHistory[newHistory.length - 1],
                                content: finalText,
                                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                            };
                        }

                        // Sync with backend once state is updated
                        apiService.syncProjectContent(fileId, { chatHistory: newHistory })
                            .catch(err => console.error("[Sync] Chat history sync failed:", err));

                        return newHistory;
                    });
                    setIsTyping(false);
                },
                selectionNodeIds
            );

            // Clear selection after sending
            setActiveSelection(null);
        } catch (error) {
            console.error("Error sending message:", error);
            setIsTyping(false);
            const errorResponse = {
                role: 'ai' as const,
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            };
            setChatHistory(prev => [...prev.slice(0, -1), errorResponse]);
        }
    };

    return { handleSendMessage };
};
