import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';

export const useProactiveAgent = () => {
    const chatHistory = useStore(state => state.chatHistory);
    const setMode = useStore(state => state.setMode);
    const [suggestion, setSuggestion] = useState<{ type: 'quiz' | 'flashcards' | 'notes', reason: string } | null>(null);
    const [hasDismissed, setHasDismissed] = useState(false);

    useEffect(() => {
        if (chatHistory.length < 4 || hasDismissed) return;

        // Simple heuristic: If user asks 3+ questions and AI responds with long text, suggest notes or quiz
        const userMessages = chatHistory.filter(m => m.role === 'user');
        const aiMessages = chatHistory.filter(m => m.role === 'ai' || m.role === 'assistant');

        if (userMessages.length >= 3 && aiMessages.length >= 3) {
            // Check if they are discussing a specific topic (naive check)
            const lastThreeUserMsg = userMessages.slice(-3).map(m => m.content.toLowerCase()).join(' ');

            if (lastThreeUserMsg.length > 50 && !suggestion) {
                setSuggestion({
                    type: 'quiz',
                    reason: "You've been asking a lot about this topic. Want to test your knowledge with a quick quiz?"
                });
            }
        }
    }, [chatHistory, suggestion]);

    const handleAcceptSuggestion = () => {
        if (suggestion) {
            setMode(suggestion.type);
            setSuggestion(null);
        }
    };

    const handleDismissSuggestion = () => {
        setSuggestion(null);
        setHasDismissed(true);
    };

    return { suggestion, handleAcceptSuggestion, handleDismissSuggestion };
};
