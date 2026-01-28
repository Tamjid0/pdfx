import {
    SummaryData,
    InsightsData,
    NotesData,
    FlashcardsData,
    QuizData,
    Mode
} from '../store/useStore';

export interface PreviewSection {
    heading?: string;
    content: string;
    type: 'paragraph' | 'list' | 'heading';
}

export interface PreviewData {
    title: string;
    sections: PreviewSection[];
    metadata: {
        wordCount?: number;
        readTime?: number;
        count?: number;
        topics?: string[];
        totalQuestions?: number;
        difficulty?: string;
        totalCards?: number;
    };
}

/**
 * Transform Summary data for preview
 */
export function transformSummary(data: SummaryData | string): PreviewData | null {
    if (!data) return null;

    const sections: PreviewSection[] = [];

    let content: string | string[] | null = null;

    if (typeof data === 'string') {
        content = data;
    } else {
        content = data.summary;
    }

    if (!content) return null;

    if (typeof content === 'string') {
        sections.push({ content: content, type: 'paragraph' });
    } else if (Array.isArray(content)) {
        content.forEach((point) => {
            sections.push({ content: point, type: 'list' });
        });
    }

    if (sections.length === 0) return null;

    const wordCount = sections.reduce((acc, section) =>
        acc + section.content.split(/\s+/).length, 0
    );

    return {
        title: 'Document Summary',
        sections,
        metadata: {
            wordCount,
            readTime: Math.ceil(wordCount / 200)
        }
    };
}

/**
 * Transform Insights data for preview
 */
export function transformInsights(data: InsightsData): PreviewData | null {
    const insightsArray = data?.insights || [];

    if (insightsArray.length === 0) return null;

    const sections: PreviewSection[] = insightsArray.map((insight) => ({
        heading: insight.title,
        content: insight.description,
        type: 'paragraph'
    }));

    return {
        title: 'Key Insights',
        sections,
        metadata: {
            count: insightsArray.length,
            topics: insightsArray.map((i) => i.title)
        }
    };
}

/**
 * Transform Notes data for preview
 */
export function transformNotes(data: NotesData): PreviewData | null {
    const sections: PreviewSection[] = [];
    const notesArray = data?.notes || [];

    notesArray.forEach((note) => {
        if (note.section && note.points) {
            sections.push({
                heading: note.section,
                content: Array.isArray(note.points) ? note.points.join('\n') : note.points,
                type: 'list'
            });
        }
    });

    if (sections.length === 0) return null;

    return {
        title: 'Study Notes',
        sections,
        metadata: {
            count: sections.length
        }
    };
}

/**
 * Transform Quiz data for preview
 */
export function transformQuiz(data: QuizData): PreviewData | null {
    const quizItems = data?.quiz || [];
    if (quizItems.length === 0) return null;

    const sections: PreviewSection[] = quizItems.map((q, index) => {
        let content = `Q${index + 1}: ${q.question}\n\n`;

        if (q.type === 'mc' && q.options) {
            q.options.forEach((opt) => {
                const marker = opt.value === q.correctAnswer ? '✓' : '○';
                content += `${marker} ${opt.label}. ${opt.value}\n`;
            });
        } else if (q.type === 'tf') {
            content += `○ True\n○ False\n`;
            content += `\nCorrect Answer: ${q.correctAnswer}`;
        } else if (q.type === 'fib') {
            content += `Answer: ${q.correctAnswer}`;
        }

        return {
            content,
            type: 'paragraph'
        };
    });

    return {
        title: 'Assessment Quiz',
        sections,
        metadata: {
            totalQuestions: quizItems.length
        }
    };
}

/**
 * Transform Flashcards data for preview
 */
export function transformFlashcards(data: FlashcardsData): PreviewData | null {
    const cardsArray = data?.flashcards || [];

    if (cardsArray.length === 0) return null;

    const sections: PreviewSection[] = cardsArray.map((card, index) => ({
        heading: `Card ${index + 1}: ${card.question}`,
        content: card.answer,
        type: 'paragraph'
    }));

    return {
        title: 'Flashcard Deck',
        sections,
        metadata: {
            totalCards: cardsArray.length
        }
    };
}

/**
 * Main transformer function - routes to appropriate transformer
 * Now robust enough to handle both raw content and revision-wrapped objects
 */
export function transformModeContent(mode: Mode | string, data: any): PreviewData | null {
    if (!data) return null;

    // Robustness: If data is a revision wrapper, extract the latest content
    let activeData = data;
    if (data && typeof data === 'object' && 'revisions' in data && Array.isArray(data.revisions)) {
        if (data.revisions.length > 0 && data.revisions[0].content) {
            activeData = data.revisions[0].content;
        } else {
            return null; // No revisions or no content in latest revision
        }
    }

    switch (mode) {
        case 'summary':
            return transformSummary(activeData);
        case 'insights':
            return transformInsights(activeData);
        case 'notes':
            return transformNotes(activeData);
        case 'quiz':
            return transformQuiz(activeData);
        case 'flashcards':
            return transformFlashcards(activeData);
        default:
            return null;
    }
}
