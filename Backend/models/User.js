import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    AadharNumber:{
        type: String,
        required: true,
    },
    PhoneNumber:{
        type: String,
        required: true,
    },
    Kpin:{
        type: String,
        required: true,
    },
    AreaPin:{
        type: String,
        required: true,     
    },
    Otp:{
        type: String,
    },
    complainIds:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Complains"
    }],
    role:{
        type:String,
        default:"user"
    }

});

userSchema.index({AadharNumber:1,kpin:1})
export const User = mongoose.model('User', userSchema);