import mongoose from 'mongoose';

const personnelSchema = new mongoose.Schema({
  aadhaarNumber: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['AEE', 'JE', 'Lineman', 'EE', 'CEE'],
  },
  pkpin:{
    type: String,
    required:true
  },
  hrDepartmentCode: {
    type: Number,
  },
}, { timestamps: true });

export const Personnel = mongoose.model('Personnel', personnelSchema);

