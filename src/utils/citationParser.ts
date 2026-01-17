export interface MessagePart {
    type: 'text' | 'citation' | 'block';
    blockType?: 'text' | 'table' | 'list' | 'steps' | 'qa' | 'insight' | 'code';
    content?: string;
    page?: number;
    quotedText?: string | null;
}

/**
 * Converts all citation formats to markdown links for integrated rendering.
 * Handled: <cite page="1">text</cite>, (Page 1), [P1], P1
 */
export function linkifyCitations(text: string): string {
    if (!text) return '';

    let processed = text;
    // Aggressively strip any HTML-like tags just to be safe and clean
    processed = processed.replace(/<\/?(text|table|list|steps|qa|insight|code|cite)[^>]*>/gi, '');
    processed = processed.replace(/<\/?\w+[^>]*>/gi, '');

    return processed;
}

/**
 * Parses AI response text into a structured array of blocks and citations.
 * Optimized for streaming: Handles unclosed tags at the end of the string.
 */
export function parseMessageParts(text: string): MessagePart[] {
    const parts: MessagePart[] = [];
    const blockTags = ['text', 'table', 'list', 'steps', 'qa', 'insight', 'code'];

    // Regex for full/greedy blocks
    const blockRegex = /<(text|table|list|steps|qa|insight|code)>([\s\S]*?)<\/\1>/gi;

    let lastIndex = 0;
    let match;

    while ((match = blockRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            const rawText = text.slice(lastIndex, match.index).trim();
            if (rawText) parts.push({ type: 'text', content: rawText });
        }

        parts.push({
            type: 'block',
            blockType: match[1] as any,
            content: match[2].trim()
        });
        lastIndex = blockRegex.lastIndex;
    }

    // Handle the remaining part (potential unclosed block during streaming)
    const remaining = text.slice(lastIndex).trim();
    if (remaining) {
        // Look for an unclosed opening tag at the VERY start of remaining text
        const unclosedRegex = /^<(text|table|list|steps|qa|insight|code)>([\s\S]*)$/i;
        const unclosedMatch = unclosedRegex.exec(remaining);

        if (unclosedMatch) {
            parts.push({
                type: 'block',
                blockType: unclosedMatch[1] as any,
                content: unclosedMatch[2].trim()
            });
        } else {
            parts.push({ type: 'text', content: remaining });
        }
    }

    if (parts.length === 0 && text.trim()) {
        parts.push({ type: 'text', content: text });
    }

    return parts;
}

/**
 * Legacy citation parsing logic (kept for internal use but usually bypassed by linkifyCitations)
 */
export function parseCitationsOnly(text: string): any[] {
    const parts: any[] = [];
    const allMatches: any[] = [];

    const citeRegex = /<cite\s+page="(\d+)">([\s\S]*?)<\/cite>/gi;
    let match;
    while ((match = citeRegex.exec(text)) !== null) {
        allMatches.push({ index: match.index, length: match[0].length, page: parseInt(match[1], 10), text: match[2] || null, fullMatch: match[0] });
    }

    const parenRegex = /\((?:Source:\s*)?(Page|Slide)\s+(\d+)\)/gi;
    while ((match = parenRegex.exec(text)) !== null) {
        const isOverlap = allMatches.some(m => match!.index >= m.index && match!.index < m.index + m.length);
        if (isOverlap) continue;
        allMatches.push({ index: match.index, length: match[0].length, page: parseInt(match[2], 10), text: null, fullMatch: match[0] });
    }

    const markerRegex = /\[?P(\d+)\]?/g;
    while ((match = markerRegex.exec(text)) !== null) {
        const isOverlap = allMatches.some(m => match!.index >= m.index && match!.index < m.index + m.length);
        if (isOverlap) continue;
        allMatches.push({ index: match.index, length: match[0].length, page: parseInt(match[1], 10), text: null, fullMatch: match[0] });
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

export function triggerBrowserSearch(searchText: string): void {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(searchText).catch(err => console.warn('Clipboard fail:', err));
    }
}
