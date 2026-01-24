/**
 * Content Transformers for Document Preview
 * Converts mode-specific data structures into preview-ready format
 */























/**
 * Transform Summary data for preview
 */
export function transformSummary(summaryData) {
    console.log('[Preview] Summary data:', summaryData);

    if (!summaryData) {
        console.log('[Preview] No summary data');
        return null;
    }

    const sections = [];

    // Handle different data structures
    if (summaryData.summary) {
        const summary = summaryData.summary;
        if (typeof summary === 'string') {
            sections.push({ content: summary, type: 'paragraph' });
        } else if (Array.isArray(summary)) {
            summary.forEach((point) => {
                sections.push({ content: point, type: 'list' });
            });
        }
    } else if (summaryData.summaryText) {
        // Alternative field name
        sections.push({ content: summaryData.summaryText, type: 'paragraph' });
    } else if (typeof summaryData === 'string') {
        // Direct string
        sections.push({ content: summaryData, type: 'paragraph' });
    }

    if (sections.length === 0) {
        console.log('[Preview] No sections created from summary data');
        return null;
    }

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
export function transformInsights(insightsData) {
    // console.log('[Preview] Insights data:', insightsData);

    const insightsArray = Array.isArray(insightsData) ? insightsData : (insightsData.insights || insightsData.data);

    if (!insightsArray || !Array.isArray(insightsArray)) {
        console.log('[Preview] No insights array found');
        return null;
    }

    const sections = insightsArray.map((insight) => ({
        heading: insight.title,
        content: insight.description,
        type: 'paragraph'
    }));

    return {
        title: 'Key Insights',
        sections,
        metadata: {
            count: insightsData.insights.length,
            topics: insightsData.insights.map((i) => i.title)
        }
    };
}

/**
 * Transform Notes data for preview
 */
export function transformNotes(notesData) {
    // console.log('[Preview] Notes data:', notesData);

    if (!notesData) {
        // console.log('[Preview] No notes data');
        return null;
    }

    const sections = [];

    // Handle actual data structure: {notes: Array<{section, points}>} or just the array itself
    const notesArray = Array.isArray(notesData) ? notesData : (notesData.notes || notesData.data);

    if (notesArray && Array.isArray(notesArray)) {
        notesArray.forEach((note) => {
            if (note.section && note.points) {
                sections.push({
                    heading: note.section,
                    content: Array.isArray(note.points) ? note.points.join('\n') : note.points,
                    type: 'list'
                });
            }
        });
    }
    // Fallback: Handle old structure if it exists
    else if (notesData.keyConcepts && Array.isArray(notesData.keyConcepts)) {
        sections.push({
            heading: 'Key Concepts',
            content: notesData.keyConcepts.join('\n'),
            type: 'list'
        });
    }

    if (sections.length === 0) {
        console.log('[Preview] No sections created from notes data');
        return null;
    }

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
export function transformQuiz(quizData) {
    if (!quizData || !quizData.quiz) return null;

    const sections = quizData.quiz.map((q, index) => {
        let content = `Q${index + 1}: ${q.question}\n\n`;

        if (q.type === 'mc' && q.options) {
            q.options.forEach((opt) => {
                const marker = opt.value === q.correctAnswer ? '✓' : '○';
                content += `${marker} ${opt.label}. ${opt.value}\n`;
            });
        } else if (q.type === 'tf') {
            content += `○ True\n○ False\n`;
            content += `\nCorrect Answer: ${q.correctAnswer ? 'True' : 'False'}`;
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
            totalQuestions: quizData.quiz.length,
            difficulty: quizData.difficulty || 'medium'
        }
    };
}

/**
 * Transform Flashcards data for preview
 */
export function transformFlashcards(flashcardsData) {
    const cardsArray = Array.isArray(flashcardsData) ? flashcardsData : (flashcardsData.flashcards || flashcardsData.data);

    if (!cardsArray || !Array.isArray(cardsArray)) return null;

    const sections = cardsArray.map((card, index) => ({
        heading: `Card ${index + 1}: ${card.question}`,
        content: card.answer,
        type: 'paragraph'
    }));

    return {
        title: 'Flashcard Deck',
        sections,
        metadata: {
            totalCards: flashcardsData.flashcards.length
        }
    };
}

/**
 * Main transformer function - routes to appropriate transformer
 */
export function transformModeContent(mode, data) {
    // console.log('[Preview] Transforming mode:', mode, 'with data:', JSON.stringify(data)?.slice(0, 100));

    let result = null;

    switch (mode) {
        case 'summary':
            result = transformSummary(data);
            break;
        case 'insights':
            result = transformInsights(data);
            break;
        case 'notes':
            result = transformNotes(data);
            break;
        case 'quiz':
            result = transformQuiz(data);
            break;
        case 'flashcards':
            result = transformFlashcards(data);
            break;
        default:
            console.log('[Preview] Unknown mode:', mode);
            result = null;
    }

    console.log('[Preview] Transform result:', result);
    return result;
}
