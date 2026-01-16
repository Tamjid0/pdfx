// Enhanced citation parser that extracts surrounding context when no quoted text is provided
// This helps with highlighting even when AI doesn't use proper cite tags

export interface CitationPart {
    type: 'text' | 'citation';
    content?: string;
    page?: number;
    quotedText?: string | null;
    pageType?: string;
    contextBefore?: string; // Text before citation
    contextAfter?: string;  // Text after citation
}

/**
 * Parses AI response text to extract citations and surrounding context
 */
export function parseCitations(text: string): CitationPart[] {
    const parts: CitationPart[] = [];
    const allMatches: Array<{
        index: number,
        length: number,
        page: number,
        text: string | null,
        fullMatch: string
    }> = [];

    // Find cite tags: <cite page="3">text</cite>
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

    // Find parentheses citations: (Page 3)
    const parenRegex = /\((?:Source:\s*)?(Page|Slide)\s+(\d+)\)/gi;

    while ((match = parenRegex.exec(text)) !== null) {
        // Extract surrounding context (20 words before citation)
        const beforeText = text.substring(Math.max(0, match.index - 150), match.index).trim();
        const words = beforeText.split(/\s+/).slice(-20).join(' ');

        allMatches.push({
            index: match.index,
            length: match[0].length,
            page: parseInt(match[2], 10),
            text: words || null, // Use surrounding context as search text
            fullMatch: match[0]
        });
    }

    // Find square bracket citations: [Page 3]
    const bracketRegex = /"([^"]+)"\s*\[(?:Source:\s*)?(Page|Slide)\s+(\d+)\]|\[(?:Source:\s*)?(Page|Slide)\s+(\d+)\]/gi;

    while ((match = bracketRegex.exec(text)) !== null) {
        const quotedText = match[1] || null;
        const pageNum = match[3] || match[5];

        // If no quoted text, extract surrounding context
        let searchText = quotedText;
        if (!searchText) {
            const beforeText = text.substring(Math.max(0, match.index - 150), match.index).trim();
            searchText = beforeText.split(/\s+/).slice(-20).join(' ') || null;
        }

        allMatches.push({
            index: match.index,
            length: match[0].length,
            page: parseInt(pageNum, 10),
            text: searchText,
            fullMatch: match[0]
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
