import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import authRouter from "./routes/authRouter.js";
import assestRouter from './routes/assestRouter.js'
import complaintRouter from './routes/complaintRouter.js'
import cookieParser from "cookie-parser";
import { authenticate } from "./lib/Authenticate.js";
import { Personnel } from "./models/Personnel.js";
import { LineMan } from "./models/Lineman.js";
import { User } from "./models/User.js";


const app = express();
const PORT = Number(process.env.PORT) || 4000;

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};


app.use(express.json());
app.use(cookieParser());
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
}
app.use(cors(corsOptions));


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/assets", assestRouter);
app.use("/api/complaints", complaintRouter);


app.get("/authenticate", authenticate, async (req, res) => {
  try {
   
    let userData;
    if (req.user.role === "user") {
      userData = await User.findById(req.user._id);
    } else if (req.user.role === "lineman") {
      userData = await LineMan.findById(req.user._id);
    } else {
      userData = await Personnel.findById(req.user._id);
    }

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user: userData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});
