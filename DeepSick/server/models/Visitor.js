import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const visitorSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  avatar: { type: String, default: '' },
  // 可以根据需要添加更多字段
});

const Visitor = mongoose.model('Visitor', visitorSchema);
export default Visitor;