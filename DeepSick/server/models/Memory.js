//定义Memory数据模型，用于存储用户上传的记忆内容，包括上传者姓名、上传时间、记忆类型（图片、视频或文本）和记忆内容等信息。
import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema({
  uploaderName: {
    type: String,
    required: true
  },
  uploadTime: {
    type: Date,
    default: Date.now
  },
  memoryType: {
    type: String,
    enum: ['image', 'video', 'text'],
    required: true
  },
  memoryContent: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const Memory = mongoose.model('Memory', memorySchema);

export default Memory; 