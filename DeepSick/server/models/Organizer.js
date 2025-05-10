import mongoose from 'mongoose';

const organizerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  avatar: { type: String, default: '' },
  // 组织者特有字段
  organization: { type: String },
  // ... 其他字段
});

const Organizer = mongoose.model('Organizer', organizerSchema);
export default Organizer;

// models/Visitor.js
const visitorSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, default: '' },
  // 访客特有字段
  visitHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Visit' }],
  // ... 其他字段
});

// models/LovedOne.js
const lovedOneSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, default: '' },
  // 亲友特有字段
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  // ... 其他字段
});
