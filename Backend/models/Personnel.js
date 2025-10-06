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
    enum: ['AEE', 'JE', 'EE', 'CEE'],
  },
  pkpin:{
    type: String,
    required:true
  },
  category:{
    type:String,
    enum:["Water","Electricity","Municipal"]
  },
  hrDepartmentCode: {
    type: Number,
  },
}, { timestamps: true });

personnelSchema.index({pkpin:1})
export const Personnel = mongoose.model('Personnel', personnelSchema);

