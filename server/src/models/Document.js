import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    documentId: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    originalFile: {
        name: { type: String },
        mime: { type: String },
        processedAt: { type: Date, default: Date.now },
        path: { type: String }
    },
    metadata: {
        title: { type: String },
        pageCount: { type: Number },
        language: { type: String },
        author: { type: String },
        subject: { type: String },
        keywords: { type: [String] }
    },
    structure: { type: mongoose.Schema.Types.Mixed }, // Full DocumentGraph
    chunks: { type: mongoose.Schema.Types.Mixed },     // Array of chunks
    extractedText: { type: String },
    originalFilePath: { type: String },
    convertedPdfPath: { type: String }
}, { timestamps: true });

const Document = mongoose.model('Document', documentSchema);
export default Document;
