import mongoose from 'mongoose';

const organizerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  avatar: { type: String, default: '' },
  // Organizer-specific field
  organization: { type: String },
  // ... other fields
});

const Organizer = mongoose.model('Organizer', organizerSchema);
export default Organizer;

// models/Visitor.js
const visitorSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, default: '' },
  // Visitor-specific field
  visitHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Visit' }],
  // ... other fields
});

// models/LovedOne.js
const lovedOneSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, default: '' },
  // Loved-one-specific field
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  // ... other fields
});
