import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import authRouter from "./routes/authRouter.js";
import assestRouter from './routes/assestRouter.js'
import complaintRouter from './routes/complaintRouter.js'



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
const corsOptions = {
    origin:"http://localhost:5173",
    credentials:true,
}
app.use(cors(corsOptions));


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    message: 'Backend is running successfully!',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/assets",assestRouter);
app.use("/api/complaints",complaintRouter);
