/// Define the schema structure for the dream list
import mongoose from 'mongoose';

const dreamSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  roomId: {
    type: String,
    required: true
  },

  content: {
    type: String,
    required: true
  },

  order: {
    type: Number,
    default: () => Date.now()
  },
  position: { // Floating position
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  }
},
  { timestamps: true });

export default mongoose.model('Dream', dreamSchema);