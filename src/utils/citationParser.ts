export interface MessagePart {
    type: 'text' | 'citation' | 'block';
    blockType?: 'text' | 'table' | 'list' | 'steps' | 'qa' | 'insight' | 'code';
    content?: string;
    page?: number;
    quotedText?: string | null;
}

/**
 * Parses AI response text into a structured array of blocks and citations
 */
export function parseMessageParts(text: string): MessagePart[] {
    const parts: MessagePart[] = [];

    // Regex to match blocks: <tag>content</tag>
    const blockRegex = /<(text|table|list|steps|qa|insight|code)>([\s\S]*?)<\/\1>/gi;

    let lastIndex = 0;
    let match;

    while ((match = blockRegex.exec(text)) !== null) {
        // Handle any raw text before the block (if AI forgot or is still typing)
        if (match.index > lastIndex) {
            const rawText = text.slice(lastIndex, match.index).trim();
            if (rawText) {
                appendCitations(parts, rawText);
            }
        }

        const type = match[1] as any;
        const content = match[2];

        // For blocks, we still want to parse citations INSIDE them
        // unless it's a code block
        if (type === 'code') {
            parts.push({
                type: 'block',
                blockType: 'code',
                content: content.trim()
            });
        } else {
            // Process content for citations
            const subParts = parseCitationsOnly(content);
            parts.push({
                type: 'block',
                blockType: type,
                content: content // Keep raw content for sub-parsing in UI if needed, or sub-parts
            });
            // Note: In a production app, we might want a nested structure.
            // For now, I'll flatten or handle sub-parsing in the renderer.
        }

        lastIndex = blockRegex.lastIndex;
    }

    // Handle remaining text
    if (lastIndex < text.length) {
        const remaining = text.slice(lastIndex).trim();
        if (remaining) {
            appendCitations(parts, remaining);
        }
    }

    // If no blocks were found, treat the whole thing as text + citations
    if (parts.length === 0 && text.trim()) {
        appendCitations(parts, text);
    }

    return parts;
}

function appendCitations(parts: MessagePart[], text: string) {
    const citationParts = parseCitationsOnly(text);
    parts.push(...citationParts.map(p => ({
        ...p,
        type: (p.type === 'text' ? 'text' : 'citation') as any
    })));
}

/**
 * Legacy citation parsing logic (extracted from original parseCitations)
 */
export function parseCitationsOnly(text: string): any[] {
    const parts: any[] = [];
    const allMatches: any[] = [];

    // <cite page="3">text</cite>
    const citeRegex = /<cite\s+page="(\d+)">([^<]+)<\/cite>/gi;
    let match;
    while ((match = citeRegex.exec(text)) !== null) {
        allMatches.push({
            index: match.index,
            length: match[0].length,
            page: parseInt(match[1], 10),
            text: match[2],
            fullMatch: match[0]
        });
    }

    // (Page 3) or (Slide 3)
    const parenRegex = /\((?:Source:\s*)?(Page|Slide)\s+(\d+)\)/gi;
    while ((match = parenRegex.exec(text)) !== null) {
        const beforeText = text.substring(Math.max(0, match.index - 150), match.index).trim();
        const words = beforeText.split(/\s+/).slice(-20).join(' ');
        allMatches.push({
            index: match.index,
            length: match[0].length,
            page: parseInt(match[2], 10),
            text: words || null,
            fullMatch: match[0]
        });
    }

    allMatches.sort((a, b) => a.index - b.index);

    let lastIndex = 0;
    for (const m of allMatches) {
        if (m.index > lastIndex) {
            parts.push({ type: 'text', content: text.slice(lastIndex, m.index) });
        }
        parts.push({ type: 'citation', page: m.page, quotedText: m.text });
        lastIndex = m.index + m.length;
    }

    if (lastIndex < text.length) {
        parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return parts;
}

/**
 * Triggers browser's native find functionality to search for text
 */
export function triggerBrowserSearch(searchText: string): void {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(searchText).catch(err => {
            console.warn('Failed to copy to clipboard:', err);
        });
    }
    console.log(`Copied to clipboard: "${searchText}". Press Ctrl+F to search.`);
}

// Keep the old export for compatibility during transition
export const parseCitations = parseCitationsOnly;
