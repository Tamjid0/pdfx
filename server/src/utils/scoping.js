import Document from '../models/Document.js';
import ApiError from './ApiError.js';

/**
 * Resolves the full text for AI processing based on a provided scope.
 * @param {string} fileId - The document ID
 * @param {Object} scope - { type: 'all' | 'pages' | 'topics', value: any }
 * @param {boolean} includeIds - Whether to include node IDs in the text
 * @returns {Promise<string>}
 */
export async function resolveScopedText(fileId, scope, includeIds = false) {
    const document = await Document.findOne({ documentId: fileId });
    if (!document) {
        throw new ApiError(404, `No document found for fileId: ${fileId}`);
    }

    const formatContent = (node) => {
        const text = node.content?.text || '';
        if (includeIds && node.id) {
            return `[[${node.id}]]: ${text}`;
        }
        return text;
    };

    if (!scope || scope.type === 'all') {
        if (!includeIds) return document.extractedText;

        // If includeIds, we need to rebuild from nodes to get tags
        const pages = (document.structure?.pages || document.structure?.structure?.pages || []);
        return pages
            .flatMap(p => p.nodes || [])
            .filter(n => n.type === 'text')
            .map(formatContent)
            .join('\n');
    }

    if (scope.type === 'pages') {
        const selectedPages = Array.isArray(scope.value) ? scope.value : [scope.value];
        const pages = (document.structure?.pages || document.structure?.structure?.pages || []);

        return pages
            .filter((p, i) => selectedPages.includes(i + 1))
            .flatMap(p => p.nodes || [])
            .filter(n => n.type === 'text')
            .map(formatContent)
            .join('\n');
    }

    if (scope.type === 'topics') {
        const selectedTopicIds = Array.isArray(scope.value) ? scope.value : [scope.value];
        if (selectedTopicIds.length === 0) return document.extractedText;

        const selectedTopics = document.topics.filter(t => selectedTopicIds.includes(t.id));
        const nodeIds = new Set(selectedTopics.flatMap(t => t.nodes));

        const pages = (document.structure?.pages || document.structure?.structure?.pages || []);

        const allTextNodes = pages
            .flatMap(p => p.nodes || [])
            .filter(n => n.type === 'text');

        return allTextNodes
            .filter(n => nodeIds.has(n.id))
            .map(formatContent)
            .join(' ');
    }

    return document.extractedText;
}
