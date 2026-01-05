import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

if (!process.env.HF_API_KEY) {
    throw new Error('Hugging Face API key (HF_API_KEY) is missing from .env file.');
}

export const hfEmbeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HF_API_KEY,
    model: 'sentence-transformers/all-MiniLM-L6-v2',
});
