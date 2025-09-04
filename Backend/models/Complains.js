import mongoose from "mongoose";

const complainSchema = new mongoose.Schema({
    UserId:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    kpin:{
        type: String,
        required: true,
    },
    Images:[{
        type: String}],
    problemReport:{
        type: String,
        required: true,
    },
    AssignedWorker:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Personnel"
    },
    solutionReport:{
        type: String,
    },
    category:{
        type: String,
        enum:["Water","Electricity","Municipal","Query"],
        required: true,
    },
    urgencyLevel:{
        type: Number
    },
    Affects:{
        type: String,
        enum:["Individual","Locality","City"],
    },
    status:{
        type: String,
        enum:["Pending","Assigned","visited","In-progress","Upshift","Resolved","Closed"],
        default:"Pending"
    },
    currentLevel:{
        type:String,
        enum:["L1/JE","AEE","EE","CE"],
    },
    comments:[{
        type: String
    }],
    rating:{
        type: Number,
        min:1,
        max:5
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    upShiftReason:{
        type: String
    },
    closedAt:{
        type: Date
    },
    AssetId:[{
        type:String
    }]
});

export const Complains = mongoose.model("Complains",complainSchema);