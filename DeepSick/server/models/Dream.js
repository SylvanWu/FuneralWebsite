// Define the schema structure for the dream list
import mongoose from 'mongoose';

const dreamSchema = new mongoose.Schema({
  // User ID, references User.js
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true   // Currently not enforced for easier testing
  },
  content: {
    type: String,  // Stores rich text HTML; consider limiting length in future
    required: true
  },
  order: {        // Field for drag-and-drop sorting
    type: Number,
    default: () => Date.now() // Use current timestamp as default
  },
  position: {     // Floating position
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  }
},
  { timestamps: true }); // Track creation and last update times

export default mongoose.model('Dream', dreamSchema);
