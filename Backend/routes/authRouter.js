import express from "express";
import { login, verifyOtp ,logout} from "../controllers/AuthController.js";
import { authenticate } from "../lib/Authenticate.js";

const router = express.Router();


router.post("/request-otp", login);
router.post("/verify-otp", verifyOtp);
router.get("/logout",authenticate,logout);

export default router;