// Define the User data model, including username, password, role, etc.
// Automatically hash the password using bcrypt before registration, and provide a method for password verification.
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['visitor', 'organizer', 'admin'], default: 'visitor' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    avatar: { type: String, default: '' },
    nickname: { type: String, default: '' }
}, {
    timestamps: true
});

// Automatically hash the password with bcrypt before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Instance method: compare passwords
userSchema.methods.comparePassword = function(candidate) {
    return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
