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
    solutionReport:{
        type:String,
    },
    Problem:{
        type:String
    },SubProblem:{
        type:String
    },
    AssignedWorker:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Lineman"
    }],
    AssignedJE:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Personnel"
    },
    AssignedAEE:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Personnel"
    },
    AssignedEE:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Personnel"
    },
    category:{
        type: String,
        enum:["Water","Electricity","Municipal","Query"],
        required: true,
    },
    // urgencyLevel:{
    //     type: Number
    // },
    //it says what level is the complain currently in
    currentLevel:{
        type:String,
        default:"JE"
    },
    // Affects:{
    //     type: String,
    //     enum:["Individual","Locality","City"],
    // },
    status:{
        type: String,
        enum:["Pending","Assigned","visited","In-progress","Upshift","Resolved","Closed"],
        default:"Pending"
    },
    currentLevel:{
        type:String,
        enum:["L1","JE","AEE","EE","CE"],
    },
    latitude:{
        type:String
    },
    longitude:{
        type:String
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
    }],
    lastNotified:{
        type: Date
    },lanuage:[{
        type:String,
    }],urgent:{
        type:Boolean
    }
},{timestamps:true, strict:false});
complainSchema.index({kpin:1,status:1,createdAt:1});
export const Complains = mongoose.model("Complains",complainSchema);