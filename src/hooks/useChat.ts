import { useStore } from '../store/useStore';
import * as apiService from '../services/apiService';

export const useChat = () => {
    const {
        fileId,
        setChatHistory,
        setIsTyping,
    } = useStore();

    const handleSendMessage = async (message: string) => {
        const newUserMessage = {
            role: 'user' as const,
            content: message,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
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
                }
            );
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
