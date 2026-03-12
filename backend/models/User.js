import { Schema, model, Types } from 'mongoose';

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  password: { type: String, required: true }, // Hashed with bcrypt
  role: {
    type: String,
    enum: ['student', 'recruiter', 'faculty', 'admin'],
    required: true
  },
  isActive: { type: Boolean, default: true },
  resumes: [{
    type: Types.ObjectId,
    ref: "Resume"
  }]
}, { timestamps: true, strict: "throw", versionKey: false });

const User = model('User', userSchema);
export default User