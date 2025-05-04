// 定义梦想清单的数据模型结构
import mongoose from 'mongoose';

const dreamSchema = new mongoose.Schema({
  // 用户ID，ref关联User.js
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,  // 存储富文本HTML 不够长 后期需要控制长度
    required: true
  },
  order: {        // 拖拽排序字段
    type: Number,
    default: () => Date.now() // 使用当前时间戳作为默认值
  },
  position: {     // 悬浮位置
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  }
},
  { timestamps: true });//追踪记录的创建时间和最后更新时间

export default mongoose.model('Dream', dreamSchema);