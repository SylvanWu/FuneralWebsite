//定义User数据模型，包含用户名、密码和角色等信息。注册前自动对密码进行 bcrypt 哈希处理，并提供密码校验方法。
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['visitor', 'organizer', 'admin'], default: 'visitor' }
}, {
    timestamps: true
});

// 注册前自动对密码做 bcrypt 哈希
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// 实例方法：校验密码
userSchema.methods.comparePassword = function (candidate) {
    return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;