/**
 * Checks if a project module has actual generated content.
 * Used for conditional visibility in the Project Overview and Export actions.
 */
export function hasProjectContent(mode: string, data: any): boolean {
    if (!data) return false;

    // Robustness: If data is a revision wrapper, extract the direct content or latest revision data
    let activeData = data;
    if (data && typeof data === 'object' && !('nodes' in data)) { // Mindmap doesn't use revisions usually
        if ('content' in data && data.content !== null) {
            activeData = data.content;
        } else if ('revisions' in data && Array.isArray(data.revisions) && data.revisions.length > 0) {
            activeData = data.revisions[0].data;
        }
    }

    if (!activeData) return false;

    // Handle string data (like Summary or Editor content)
    if (typeof activeData === 'string') return activeData.trim().length > 0;

    // Handle specific module data structures
    switch (mode.toLowerCase()) {
        case 'summary':
            return !!(activeData.summary || (activeData.keyPoints && activeData.keyPoints.length > 0));
        case 'notes':
            return !!((activeData.notes && activeData.notes.length > 0) || (activeData.blocks && activeData.blocks.length > 0));
        case 'insights':
            return !!((activeData.insights && activeData.insights.length > 0) || (activeData.blocks && activeData.blocks.length > 0));
        case 'flashcards':
            return !!(activeData.flashcards && activeData.flashcards.length > 0);
        case 'quiz':
            return !!(activeData.quiz && activeData.quiz.length > 0);
        case 'mindmap':
            return !!(activeData.nodes && activeData.nodes.length > 0);
        default:
            return true;
    }
}
