import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    documentId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true }, // Firebase UID or 'guest'
    type: { type: String, required: true },
    storage: {
        type: { type: String, enum: ['local', 'firebase'], default: 'local' },
        key: { type: String }, // Path on disk or cloud key
        bucket: { type: String }, // For cloud storage
        url: { type: String } // Public or signed URL
    },
    originalFile: {
        name: { type: String },
        mime: { type: String },
        size: { type: Number },
        processedAt: { type: Date, default: Date.now },
        path: { type: String } // Local relative path
    },
    metadata: {
        title: { type: String },
        pageCount: { type: Number },
        language: { type: String },
        author: { type: String }
    },
    // AI Generated Content (Persistent Storage)
    summaryData: { type: mongoose.Schema.Types.Mixed, default: null },
    notesData: { type: mongoose.Schema.Types.Mixed, default: null },
    flashcardsData: { type: mongoose.Schema.Types.Mixed, default: null },
    quizData: { type: mongoose.Schema.Types.Mixed, default: null },
    mindmapData: { type: mongoose.Schema.Types.Mixed, default: null },
    insightsData: { type: mongoose.Schema.Types.Mixed, default: null },
    chatHistory: { type: [mongoose.Schema.Types.Mixed], default: [] },

    structure: { type: mongoose.Schema.Types.Mixed }, // Full DocumentGraph (Nodes)
    chunks: { type: mongoose.Schema.Types.Mixed },     // Segmented text for vectoring
    extractedText: { type: String },
    convertedPdfPath: { type: String },
    isArchived: { type: Boolean, default: false },
    lastAccessedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Document = mongoose.model('Document', documentSchema);
export default Document;
