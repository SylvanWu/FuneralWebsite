import mongoose from 'mongoose';

const canvasSchema = new mongoose.Schema({
  canvasId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  roomId: {
    type: String,
    required: true,
    index: true
  },
  width: { 
    type: Number, 
    default: 800 
  },
  height: { 
    type: Number, 
    default: 600 
  },
  backgroundColor: { 
    type: String, 
    default: '#ffffff' 
  },
  drawings: {
    type: Array,
    default: []
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Automatically update updatedAt on modification
canvasSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Canvas = mongoose.model('Canvas', canvasSchema);

export default Canvas; 