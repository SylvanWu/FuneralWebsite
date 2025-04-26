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