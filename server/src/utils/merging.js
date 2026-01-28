/**
 * Intelligent merging logic for non-destructive AI analysis.
 */

/**
 * Merges two data objects based on the module type.
 * @param {any} oldData - Existing content data
 * @param {any} newData - Newly generated content data
 * @param {string} type - 'summary' | 'notes' | 'insights' | 'flashcards' | 'quiz'
 * @returns {any} Merged data
 */
export function mergeContent(oldData, newData, type) {
    if (!oldData) return newData;
    if (!newData) return oldData;

    switch (type) {
        case 'summary':
            return mergeSummary(oldData, newData);
        case 'notes':
            return mergeNotes(oldData, newData);
        case 'insights':
            return mergeInsights(oldData, newData);
        case 'flashcards':
            return mergeFlashcards(oldData, newData);
        case 'quiz':
            return mergeQuiz(oldData, newData);
        default:
            return newData;
    }
}

/**
 * Summary Merge: Concatenates with a stylistic separator
 */
function mergeSummary(oldData, newData) {
    const oldText = typeof oldData === 'string' ? oldData : (oldData.summary || '');
    const newText = typeof newData === 'string' ? newData : (newData.summary || '');

    return {
        summary: `${oldText}\n\n<hr />\n\n${newText}`
    };
}

/**
 * Notes Merge: Merges sections by title, deduplicates points
 */
function mergeNotes(oldData, newData) {
    const oldNotes = Array.isArray(oldData) ? oldData : (oldData.notes || []);
    const newNotes = Array.isArray(newData) ? newData : (newData.notes || []);

    const merged = [...oldNotes];

    newNotes.forEach(newSec => {
        const existingSec = merged.find(s => s.section.toLowerCase() === newSec.section.toLowerCase());
        if (existingSec) {
            // Merge points into existing section
            const uniquePoints = new Set([...existingSec.points, ...newSec.points]);
            existingSec.points = Array.from(uniquePoints);
        } else {
            // Add new section
            merged.push(newSec);
        }
    });

    return { notes: merged };
}

/**
 * Generic Array Deduplicator for Insights, Flashcards, Quiz
 * @param {any[]} oldArr 
 * @param {any[]} newArr 
 * @param {string} key - Unique key per item (e.g. 'question' or 'title')
 */
function mergeKeyedArray(oldArr, newArr, key) {
    const map = new Map();
    oldArr.forEach(item => map.set(item[key]?.toLowerCase(), item));
    newArr.forEach(item => map.set(item[key]?.toLowerCase(), item));
    return Array.from(map.values());
}

function mergeInsights(oldData, newData) {
    const oldArr = Array.isArray(oldData) ? oldData : (oldData.insights || []);
    const newArr = Array.isArray(newData) ? newData : (newData.insights || []);
    return { insights: mergeKeyedArray(oldArr, newArr, 'title') };
}

function mergeFlashcards(oldData, newData) {
    const oldArr = Array.isArray(oldData) ? oldData : (oldData.flashcards || []);
    const newArr = Array.isArray(newData) ? newData : (newData.flashcards || []);
    return { flashcards: mergeKeyedArray(oldArr, newArr, 'question') };
}

function mergeQuiz(oldData, newData) {
    const oldArr = Array.isArray(oldData) ? oldData : (oldData.questions || []);
    const newArr = Array.isArray(newData) ? newData : (newData.questions || []);
    return { questions: mergeKeyedArray(oldArr, newArr, 'question') };
}
