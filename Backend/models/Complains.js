import mongoose from "mongoose";

const complainSchema = new mongoose.Schema({
    UserId:[{
        type: mongoose.Schema.Types.ObjectId,   //keep same for given array 
        ref:"User"
    }],
    kpin:{
        type: String,            //keep same for given array of kpin
        required: true,
    },
    Images:[{
        type: String}],            //lite keep dummy data
    problemReport:{
        type: String,             //keep any appropriate solutiona and problem report respectively 
        required: true,
    },
    solutionReport:{
        type:String,
    },
    Problem:{
        type:String                      //i will give you the dictinary so please follow the rules of the hireachy fo the category , problem ,subproblem 
    },SubProblem:{
        type:String
    },
    AssignedWorker:[{
        type:mongoose.Schema.Types.ObjectId,   //choose in the array 
        ref:"Lineman"
    }],
    AssignedJE:{
        type:mongoose.Schema.Types.ObjectId,       //choose in the array 
        ref:"Personnel"
    },
    AssignedAEE:{
        type:mongoose.Schema.Types.ObjectId,      //if the problem is upshift choose in the array 
        ref:"Personnel"
    },
    AssignedEE:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Personnel"       
    },
    category:{
        type: String,
        enum:["Water","Electricity","Municipal","Query"],        //take anything and follow the rules 
        required: true,
    },
    status:{
        type: String,
        enum:["Pending","Assigned","visited","In-progress","Upshift","Resolved","Closed"],     // keep anything
        default:"Pending"
    },
    currentLevel:{
        type:String,
        enum:["L1","JE","AEE","EE","CE"],    
    },
    latitude:{
        type:String               //any specific place of 200 m radius for my the given location 
    },
    longitude:{
        type:String
    },
    comments:[{
        type: String        //keep any relvant comments 
    }],
    rating:{
        type: Number,       //give rating 1 to 5
        min:1,
        max:5
    },
    createdAt:{    
        type: Date,                     //if the status is closed then choose the closed Date else keep only open dat make if it is in last two months 
        default: Date.now
    },
    upShiftReason:{
        type: String            //if the current level is  Aee or status is upshift then keep any approopritate 
    },
    closedAt:{
        type: Date
    },
    AssetId:{
        type:String                 //keep the things from the given array 
    },
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