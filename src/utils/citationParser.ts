// Citation parsing utility for AI responses
// Supports multiple citation formats

export interface CitationPart {
    type: 'text' | 'citation';
    content?: string;
    page?: number;
    quotedText?: string | null;
    pageType?: string;
}

/**
 * Parses AI response text to extract citations in multiple formats:
 * - <cite page="3">exact quoted text</cite>
 * - (Page 3) or (Slide 3)
 * - [Page 3] or [Slide 3]
 * - "quoted text" [Page 3]
 */
export function parseCitations(text: string): CitationPart[] {
    const parts: CitationPart[] = [];
    const allMatches: Array<{ index: number, length: number, page: number, text: string | null }> = [];

    // Find cite tags: <cite page="3">text</cite>
    const citeRegex = /<cite\s+page="(\d+)">([^<]+)<\/cite>/gi;
    let match;

    while ((match = citeRegex.exec(text)) !== null) {
        allMatches.push({
            index: match.index,
            length: match[0].length,
            page: parseInt(match[1], 10),
            text: match[2]
        });
    }

    // Find parentheses citations: (Page 3) or (Slide 3)
    const parenRegex = /\((?:Source:\s*)?(Page|Slide)\s+(\d+)\)/gi;

    while ((match = parenRegex.exec(text)) !== null) {
        allMatches.push({
            index: match.index,
            length: match[0].length,
            page: parseInt(match[2], 10),
            text: null
        });
    }

    // Find square bracket citations: [Page 3] or "text" [Page 3]
    const bracketRegex = /"([^"]+)"\s*\[(?:Source:\s*)?(Page|Slide)\s+(\d+)\]|\[(?:Source:\s*)?(Page|Slide)\s+(\d+)\]/gi;

    while ((match = bracketRegex.exec(text)) !== null) {
        const quotedText = match[1] || null;
        const pageNum = match[3] || match[5];
        allMatches.push({
            index: match.index,
            length: match[0].length,
            page: parseInt(pageNum, 10),
            text: quotedText
        });
    }

    // Sort matches by position
    allMatches.sort((a, b) => a.index - b.index);

    let lastIndex = 0;

    for (const match of allMatches) {
        // Add text before this citation
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                content: text.slice(lastIndex, match.index)
            });
        }

        // Add the citation
        parts.push({
            type: 'citation',
            page: match.page,
            quotedText: match.text,
            pageType: 'page'
        });

        lastIndex = match.index + match.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push({
            type: 'text',
            content: text.slice(lastIndex)
        });
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
