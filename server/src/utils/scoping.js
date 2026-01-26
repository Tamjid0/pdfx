import Document from '../models/Document.js';
import ApiError from './ApiError.js';

/**
 * Resolves the full text for AI processing based on a provided scope.
 * @param {string} fileId - The document ID
 * @param {Object} scope - { type: 'all' | 'pages' | 'topics', value: any }
 * @returns {Promise<string>}
 */
export async function resolveScopedText(fileId, scope) {
    const document = await Document.findOne({ documentId: fileId });
    if (!document) {
        throw new ApiError(404, `No document found for fileId: ${fileId}`);
    }

    if (!scope || scope.type === 'all') {
        return document.extractedText;
    }

    if (scope.type === 'pages') {
        const selectedPages = Array.isArray(scope.value) ? scope.value : [scope.value];
        // Note: selectedPages are 1-based, chunks are 0-based
        const scopedChunks = document.chunks.filter(chunk =>
            selectedPages.includes(chunk.metadata.pageIndex + 1)
        );
        return scopedChunks.map(c => c.content).join('\n\n');
    }

    if (scope.type === 'topics') {
        const selectedTopicIds = Array.isArray(scope.value) ? scope.value : [scope.value];
        if (selectedTopicIds.length === 0) return document.extractedText;

        const selectedTopics = document.topics.filter(t => selectedTopicIds.includes(t.id));
        const nodeIds = new Set(selectedTopics.flatMap(t => t.nodes));

        const allTextNodes = document.structure.pages.flatMap(p => p.nodes).filter(n => n.type === 'text');
        return allTextNodes
            .filter(n => nodeIds.has(n.id))
            .map(n => n.content.text)
            .join(' ');
    }

    return document.extractedText;
}
