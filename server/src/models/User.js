import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firebaseUid: { type: String, required: true, unique: true, index: true },
    displayName: { type: String },
    email: { type: String, required: true, unique: true },
    photoURL: { type: String },
    password: { type: String }, // Optional for Firebase/Social users
    tier: { type: String, enum: ['free', 'premium'], default: 'free' },
    credits: { type: Number, default: 10 },
    usage: {
        totalFiles: { type: Number, default: 0 },
        totalWords: { type: Number, default: 0 }
    },
    lastLogin: { type: Date, default: Date.now }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
