import mongoose from 'mongoose';

const lovedOneSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  avatar: { type: String, default: '' }
});

const LovedOne = mongoose.model('LovedOne', lovedOneSchema);
export default LovedOne;