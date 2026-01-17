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
 */
export async function generateChunkBasedTransformation(fileId, query, topN = 10, citationMode = true) {
    const indexesDir = path.join(process.cwd(), 'src', 'database', 'indexes');
    const indexPath = path.join(indexesDir, fileId);

    if (!fs.existsSync(indexPath)) {
        throw new Error(`FAISS index for fileId '${fileId}' not found.`);
    }

    const vectorStore = await FaissStore.load(indexPath, hfEmbeddings);
    const searchResults = await vectorStore.similaritySearch(query, topN);

    if (searchResults.length === 0) {
        return "Information not found in document.";
    }

    const context = searchResults.map((doc) => {
        const meta = doc.metadata || {};
        const displayIndex = (meta.pageIndex !== undefined) ? meta.pageIndex + 1 : 'Unknown';
        const type = meta.pageType || 'Page';
        return `[Source: ${type} ${displayIndex}]\n${doc.pageContent}`;
    }).join('\n\n---\n\n');

    const citationRules = citationMode ? `
SEAMLESS INLINE CITATIONS:
- Use <cite page="X">phrase</cite> for direct quotes or highly specific facts.
- Use (Page X) or P1 for general references at the end of sentences.
- X is the Source Page number from the context below.
` : "DO NOT use any <cite> tags or mention page numbers.";

    const systemPrompt = `
You are an advanced Research Assistant Insight Engine. Your goal is to provide deep, analytical, and highly structured responses based strictly on the provided document context.

COMPOSITE RESPONSE ARCHITECTURE:
You MUST dynamically choose the best "blocks" to structure your reply based on the intent of the User Query. You can mix and match any of these blocks:
- <text>...</text>: For natural language explanations, deep reasoning, and prose. Use Markdown (##, ###, **bold**) inside.
- <list>...</list>: For summaries, features, or multi-point observations.
- <table>...</table>: For data comparisons, pros/cons, or structured feature matrices.
- <steps>...</steps>: For processes, how-to guides, or sequential logic.
- <qa>...</qa>: For addressing potential clarifications or FAQ-style drill-downs.
- <insight>...</insight>: For analytical takeaways, expert evaluations, or non-obvious conclusions.
- <code>...</code>: For technical specifications, JSON, code, or configuration snippets.

RULES:
1. Intent-Driven: If the user asks for a comparison, heavily use <table>. If they ask for a summary, use <list> and <insight>.
2. High Density: Provide as much detail as possible from the context.
3. Formatting: Use rich Markdown (bolding, headers, sub-lists) INSIDE the tags.
4. ${citationRules}
5. Zero Hallucination: If the answer isn't in the context, state it clearly.

Context:
"""
${context}
"""

User Query: "${query}"
`;

    try {
        const result = await aiModel.generateContent(systemPrompt);
        return result?.response?.text()?.trim() || "No content generated.";
    } catch (error) {
        console.error('Error in transformation:', error);
        throw new Error('Failed to generate response.');
    }
}

/**
 * Performs periodic RAG streaming generation using a FAISS vector index.
 */
export async function* generateChunkBasedStreamingTransformation(fileId, query, topN = 10, citationMode = true) {
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

    const context = searchResults.map((doc) => {
        const meta = doc.metadata || {};
        const displayIndex = (meta.pageIndex !== undefined) ? meta.pageIndex + 1 : 'Unknown';
        const type = meta.pageType || 'Page';
        return `[Source: ${type} ${displayIndex}]\n${doc.pageContent}`;
    }).join('\n\n---\n\n');

    const citationRules = citationMode ? `
SEAMLESS INLINE CITATIONS:
- Use <cite page="X">phrase</cite> for direct quotes or highly specific facts.
- Use (Page X) or P1 for general references at the end of sentences.
- X is the Source Page number from the context below.
` : "DO NOT use any <cite> tags or mention page numbers.";

    const systemPrompt = `
You are an advanced Research Assistant Insight Engine. Your goal is to provide deep, analytical, and highly structured responses based strictly on the provided document context.

COMPOSITE RESPONSE ARCHITECTURE:
You MUST dynamically choose the best "blocks" to structure your reply based on the intent of the User Query. You can mix and match any of these blocks:
- <text>...</text>: For natural language explanations, deep reasoning, and prose. Use Markdown (##, ###, **bold**) inside.
- <list>...</list>: For summaries, features, or multi-point observations.
- <table>...</table>: For data comparisons, pros/cons, or structured feature matrices.
- <steps>...</steps>: For processes, how-to guides, or sequential logic.
- <qa>...</qa>: For addressing potential clarifications or FAQ-style drill-downs.
- <insight>...</insight>: For analytical takeaways, expert evaluations, or non-obvious conclusions.
- <code>...</code>: For technical specifications, JSON, code, or configuration snippets.

RULES:
1. Intent-Driven: If the user asks for a comparison, heavily use <table>. If they ask for a summary, use <list> and <insight>.
2. High Density: Provide as much detail as possible from the context.
3. Formatting: Use rich Markdown (bolding, headers, sub-lists) INSIDE the tags.
4. ${citationRules}
5. Zero Hallucination: If the answer isn't in the context, state it clearly.

Context:
"""
${context}
"""

User Query: "${query}"
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
