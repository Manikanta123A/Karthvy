import express from "express";
import { login, verifyOtp } from "../controllers/AuthController.js";

const router = express.Router();


router.post("/request-otp", login);
router.post("/verify-otp", verifyOtp);

export default router;