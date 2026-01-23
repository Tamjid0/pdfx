import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    id: { type: String, required: true }, // Keeping for migration purposes if needed
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
