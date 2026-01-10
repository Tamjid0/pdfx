import { useStore } from '../store/useStore';
import * as apiService from '../services/apiService';

export const useChat = () => {
    const {
        fileId,
        setChatHistory,
        setIsTyping
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

    return { handleSendMessage };
};
