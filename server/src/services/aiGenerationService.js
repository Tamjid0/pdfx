import genAI from '../config/gemini.js';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { hfEmbeddings } from './embeddingService.js';
import path from 'path';
import fs from 'fs';

const aiModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
});

/**
 * Performs full-document transformation for raw text (e.g., summaries, notes).
 * @param {string} fullText - The raw text content to process.
 * @param {string} promptInstruction - Specific instructions for the AI.
 * @param {object} [options={}] - Additional options.
 * @returns {Promise<string>} - The AI generated content.
 */
export async function generateFullDocumentTransformation(fullText, promptInstruction, options = {}) {
    if (!fullText) {
        throw new Error('Full text must be provided for transformation.');
    }

    const systemPrompt = `
You are an expert AI assistant.
You MUST ONLY use information from the "Document content" below.
Do NOT invent facts. If the answer is not in the document, say so.
Maintain a ${options.outputFormat || 'text'} format for your output.

Document content:
"""
${fullText}
"""

User's specific instruction: "${promptInstruction}"
`;

    try {
        const result = await aiModel.generateContent(systemPrompt);
        return result?.response?.text()?.trim() || "No content generated.";
    } catch (error) {
        console.error('Error in full document transformation:', error);
        throw new Error('Failed to generate full document transformation.');
    }
}

/**
 * Performs chunk-based RAG generation using a FAISS vector index.
 * @param {string} fileId - The ID of the document to query.
 * @param {string} query - The user's query or question.
 * @param {number} [topN=4] - Number of top relevant documents to retrieve.
 * @returns {Promise<string>} - The AI generated content based on relevant documents.
 */
export async function generateChunkBasedTransformation(fileId, query, topN = 8, citationMode = true) {
    const indexesDir = path.join(process.cwd(), 'src', 'database', 'indexes');
    const indexPath = path.join(indexesDir, fileId);

    if (!fs.existsSync(indexPath)) {
        throw new Error(`FAISS index for fileId '${fileId}' not found. Please upload the file again.`);
    }

    // Load the FAISS index from disk
    const vectorStore = await FaissStore.load(indexPath, hfEmbeddings);

    const searchResults = await vectorStore.similaritySearch(query, topN);

    if (searchResults.length === 0) {
        return "Information not found in document. Try rephrasing your question.";
    }

    // Phase 2: Include metadata in context for page/slide citations
    const context = searchResults.map((doc, idx) => {
        const meta = doc.metadata || {};
        let source = '';

        if (meta.pageIndex !== undefined) {
            const displayIndex = meta.pageIndex + 1; // Convert 0-indexed to 1-based for human/prompt
            if (meta.pageType === 'slide') {
                source = `[Source: Slide ${displayIndex}]`;
            } else {
                source = `[Source: Page ${displayIndex}]`;
            }
        }

        return `${source}\n${doc.pageContent}`;
    }).join('\n\n---\n\n');

    const citationRules = citationMode ? `
ZERO-REDUNDANCY CITATION RULES:
- DO NOT repeat info. Integrate citations NATIVELY into your flow.
- Wrap ONLY the extracted keyword/phrase in <cite page="X">...</cite> tags.
- Example: "The **atom** <cite page="1">allows for manipulation of particles</cite> to build elements."
- The page "X" MUST match the [Source: Page X] or [Source: Slide X] tag.
- Citation must be part of the sentence, not an added block.
` : `
CITATION RULES:
- DO NOT Use any <cite> tags.
- DO NOT mention page numbers or slide numbers.
- Return a clean, professional markdown response WITHOUT any source references.
`;

    const systemPrompt = `
You are an elite AI researcher specializing in high-density, structured knowledge extraction. Generate a perfectly organized "Markdown Note" based strictly on the Context.

STRUCTURE:
- Use H2 (##) and H3 (###) headers. Use BOLDING for emphasis.
- Use TABLES for comparisons and LISTS for steps. No conversational filler.

CRITICAL: ZERO REDUNDANCY POLICY:
- DO NOT explain a concept and then "quote" it again separately.
- DO NOT use a format like: Explanation "Quote" [Page X].
- DO NOT repeat the same information twice in a sentence.

${citationRules}

Context:
"""
${context}
"""

User Query: "${query}"

REMINDER: ${citationMode ? 'Integrated <cite> tags for keywords only. No duplicate text.' : 'NO CITATIONS. NO PAGE NUMBERS.'} Perfectly structured Markdown.
`;

    try {
        const result = await aiModel.generateContent(systemPrompt);
        return result?.response?.text()?.trim() || "No content generated.";
    } catch (error) {
        console.error('Error in chunk-based transformation:', error);
        throw new Error('Failed to generate chunk-based transformation.');
    }
}

/**
 * Performs periodic RAG streaming generation using a FAISS vector index.
 * @param {string} fileId - The ID of the document to query.
 * @param {string} query - The user's query or question.
 * @param {number} [topN=4] - Number of top relevant documents to retrieve.
 * @returns {AsyncGenerator<string>} - Async generator yielding AI content chunks.
 */
export async function* generateChunkBasedStreamingTransformation(fileId, query, topN = 8, citationMode = true) {
    const indexesDir = path.join(process.cwd(), 'src', 'database', 'indexes');
    const indexPath = path.join(indexesDir, fileId);

    if (!fs.existsSync(indexPath)) {
        throw new Error(`FAISS index for fileId '${fileId}' not found.`);
    }

    const vectorStore = await FaissStore.load(indexPath, hfEmbeddings);
    const searchResults = await vectorStore.similaritySearch(query, topN);

    if (searchResults.length === 0) {
        yield "Information not found in document.";
        return;
    }

    // Phase 2: Include metadata in context for page/slide citations
    const context = searchResults.map((doc, idx) => {
        const meta = doc.metadata || {};
        let source = '';

        if (meta.pageIndex !== undefined) {
            const displayIndex = meta.pageIndex + 1; // Convert 0-indexed to 1-based
            if (meta.pageType === 'slide') {
                source = `[Source: Slide ${displayIndex}]`;
            } else {
                source = `[Source: Page ${displayIndex}]`;
            }
        }

        return `${source}\n${doc.pageContent}`;
    }).join('\n\n---\n\n');

    const citationRules = citationMode ? `
ZERO-REDUNDANCY CITATION RULES:
- DO NOT repeat info. Integrate citations NATIVELY into your flow.
- Wrap ONLY the extracted keyword/phrase in <cite page="X">...</cite> tags.
- Example: "The **atom** <cite page="1">allows for manipulation of particles</cite> to build elements."
- The page "X" MUST match the [Source: Page X] or [Source: Slide X] tag.
- Citation must be part of the sentence, not an added block.
` : `
CITATION RULES:
- DO NOT Use any <cite> tags.
- DO NOT mention page numbers or slide numbers.
- Return a clean, professional markdown response WITHOUT any source references.
`;

    const systemPrompt = `
You are an elite AI researcher generating high-density "Markdown Notes".

STRUCTURE:
- Use H2/H3 headers. BOLD key terms. Use TABLES/LISTS. No fluff.

CRITICAL: ZERO REDUNDANCY POLICY:
- DO NOT explain a concept and then "quote" it again separately.
- DO NOT repeat the same information twice in a sentence.

${citationRules}

Context:
"""
${context}
"""

User Query: "${query}"

REMINDER: ${citationMode ? 'Integrated <cite> tags for keywords only. No duplicate text.' : 'NO CITATIONS. NO PAGE NUMBERS.'} Perfectly structured Markdown.
`;

    try {
        const result = await aiModel.generateContentStream(systemPrompt);
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
                yield chunkText;
            }
        }
    } catch (error) {
        console.error('Error in streaming transformation:', error);
        throw new Error('Failed to generate streaming response.');
    }
}
