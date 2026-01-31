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

    // Relaxed check: allow empty strings or partial arrays if non-null
    if (content === null || content === undefined) return null;

    if (typeof content === 'string') {
        sections.push({ content: content || '(Empty summary)', type: 'paragraph' });
    } else if (Array.isArray(content)) {
        if (content.length === 0) {
            sections.push({ content: '(No key points available)', type: 'paragraph' });
        } else {
            content.forEach((point) => {
                sections.push({ content: point, type: 'list' });
            });
        }
    }

    if (sections.length === 0) {
        // Fallback for unexpected types
        sections.push({ content: 'Summary content is not text or list.', type: 'paragraph' });
    }

    const wordCount = sections.reduce((acc, section) =>
        acc + (section.content || '').split(/\s+/).length, 0
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
    if (data?.blocks && Array.isArray(data.blocks)) {
        const sections = transformAdaptiveBlocks(data.blocks);
        return {
            title: 'Key Insights',
            sections,
            metadata: { count: data.blocks.length }
        };
    }

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
    if (data?.blocks && Array.isArray(data.blocks)) {
        const sections = transformAdaptiveBlocks(data.blocks);
        return {
            title: 'Study Notes',
            sections,
            metadata: { count: data.blocks.length }
        };
    }

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
 * Helper to transform adaptive blocks into flat preview sections
 */
function transformAdaptiveBlocks(blocks: any[]): PreviewSection[] {
    const sections: PreviewSection[] = [];
    blocks.forEach(block => {
        if (block.title) {
            sections.push({ content: block.title, type: 'heading' });
        }
        if (block.content) {
            if (Array.isArray(block.content)) {
                block.content.forEach((point: string) => {
                    sections.push({ content: point, type: 'list' });
                });
            } else {
                sections.push({ content: block.content, type: 'paragraph' });
            }
        }
        if (block.items) {
            block.items.forEach((item: any) => {
                if (item.heading || item.example || item.term || item.step) {
                    sections.push({ content: item.heading || item.example || item.term || item.step, type: 'heading' });
                }
                if (item.explanation || item.description || item.content) {
                    sections.push({ content: item.explanation || item.description || item.content, type: 'paragraph' });
                }
                if (item.question) {
                    sections.push({ content: `Q: ${item.question}`, type: 'paragraph' });
                    if (item.hint) sections.push({ content: `Hint: ${item.hint}`, type: 'paragraph' });
                }
                if (item.formula) {
                    sections.push({ content: item.label ? `${item.label}: ${item.formula}` : item.formula, type: 'paragraph' });
                }
            });
        }
    });
    return sections;
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
