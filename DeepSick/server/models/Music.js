import mongoose from 'mongoose';

// Music schema for uploaded music files
const musicSchema = new mongoose.Schema({
  originalname: { type: String, required: true }, // Original file name
  filename: { type: String, required: true },     // Saved file name
  url: { type: String, required: true },          // Accessible URL
  uploadTime: { type: Date, default: Date.now }   // Upload timestamp
});

const Music = mongoose.model('Music', musicSchema);
export default Music; 