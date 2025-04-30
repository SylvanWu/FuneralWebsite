import mongoose from 'mongoose';

const willSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true            // JWT 验证后从 req.userId 填入
    },
    uploaderName: {
        type: String,
        required: true,            // 前端传来的姓名
        trim: true
    },
    farewellMessage: {
        type: String,
        default: ''                // 留言文字
    },
    videoFilename: {
        type: String,
        default: ''                // multer 存盘后的文件名
    }
}, {
    timestamps: true             // 自动添加 createdAt / updatedAt
});

export default mongoose.model('Will', willSchema);