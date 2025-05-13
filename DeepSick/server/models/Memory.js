//Defines the Memory data model for storing user-uploaded memory content, including uploader's name, upload time, memory type (image, video, or text), and memory content.
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