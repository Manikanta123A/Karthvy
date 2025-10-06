import mongoose  from "mongoose";
 const LinemanSchema = new mongoose.Schema({
    name:{
        type:String,
    },
    aadhaarNumber:{
        type: String,
        required: true,
    },
    otp:{
        type: String,
    },
    phoneNumber:{
        type: String,
    },
    complainId:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Complains"
    }],
    kpin:{
        type:String
    },
    category:{
        type:String,
        enum:["Water","Electricity","Municipal"]
    },
    role:{
        type:String, 
        default:"lineman"
    }

})
LinemanSchema.index({pkpin:1,aadhaarNumber:1})
export const LineMan =  mongoose.model("LineMan",LinemanSchema)
//kpin is 16 digits 
