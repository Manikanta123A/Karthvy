import { User } from "../models/User.js";
import { Personnel } from "../models/Personnel.js";
import { Vonage } from "@vonage/server-sdk";
import { LineMan } from "../models/Lineman.js";
import { generateToken } from "../lib/jwt.js";
import { verifyToken } from "../lib/jwt.js";
// const vonage = new Vonage({
//   apiKey: process.env.VONAGE_API_KEY || "2a1ff7a6",
//   apiSecret: process.env.VONAGE_SECRET_KEY
// });

// const from = "Vonage APIs";

export const login = async (req, res) => {
  try {
    const { adharNumber, role } = req.body;

    if (!adharNumber) {
      return res.status(400).json({ error: "Adhar number is required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    if (role == "user") {
      let user = await User.findOne({ AadharNumber: adharNumber });
      if (!user) {
        return res.status(404).json({ error: "Adhar number not found" });
      }
      await User.findOneAndUpdate(
        { AadharNumber: adharNumber },
        { Otp: otp }
      );

    } else if (role == "lineman") {
      let l1 = await LineMan.findOne({ aadhaarNumber: adharNumber })
      if (!l1) {
        return res.status(404).json({ error: "Adhar number not found" });
      }
      await LineMan.findOneAndUpdate(
        { aadhaarNumber: adharNumber },
        { otp: otp }
      )
    } else {
      let personnel = await Personnel.findOne({ aadhaarNumber: adharNumber });
      if (!personnel) {
        return res.status(404).json({ error: "Adhar number not found" });
      }
      await Personnel.findOneAndUpdate(
        { aadhaarNumber: adharNumber },
        { otp: otp }
      );


    }

    return res.status(200).json({
      message: "OTP generated successfully",
      otp: otp,
      userType: role
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { adharNumber, otp, role } = req.body;
    if (!adharNumber || !otp) {
      return res.status(400).json({ error: "Adhar number and OTP are required" });
    }

    if (role == "user") {
      let user = await User.findOne({ AadharNumber: adharNumber });
      if (!user) {
        return res.status(404).json({ error: "Adhar number not found" });
      }
      if (user.Otp !== otp) {
        return res.status(400).json({ error: "Invalid OTP" });
      }

      await User.findOneAndUpdate(
        { AadharNumber: adharNumber },
        { Otp: null }
      );

      const payload = {
        user:user
      }
      const token = generateToken(payload);

      
      res.cookie('token', token, {
        httpOnly: true,       
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'lax',      
        maxAge: 60 * 60 * 1000 
      });
      res.status(200).json({
        message: "OTP verified successfully",
        kpin: user.Kpin
      });


    } else if (role == "lineman") {
      let l1 = await LineMan.findOne({ aadhaarNumber: adharNumber });
      if (!l1) {
        return res.status(404).json({ error: "Adhar number not found" });
      }
      if (l1.otp !== otp) {
        return res.status(400).json({ error: "Invalid OTP" });
      }
      await LineMan.findOneAndUpdate(
        { aadhaarNumber: adharNumber },
        { otp: null }
      );
      const payload = {
        user:l1
      }

      const token = generateToken(payload);

      // Send JWT in HttpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,     
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',      
        maxAge: 60 * 60 * 1000 
      });

      res.status(200).json({
        message: "OTP verified successfully",
        category: l1.category,
        role: l1.role,
        kpin: l1.kpin
      });
    } else {
      let personnel = await Personnel.findOne({ aadhaarNumber: adharNumber });
      if (!personnel) {
        return res.status(404).json({ error: "Adhar number not found" });
      }
      if (personnel.otp !== otp) {
        return res.status(400).json({ error: "Invalid OTP" });
      }
      await Personnel.findOneAndUpdate(
        { aadhaarNumber: adharNumber },
        { otp: null }
      );

      const payload = {
        user:personnel
      }
      const token = generateToken(payload);

      
      res.cookie('token', token, {
        httpOnly: true,      
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'lax',     
        maxAge: 60 * 60 * 1000 
      });
      res.status(200).json({
        message: "OTP verified successfully",
        category: personnel.category,
        kpin: personnel.pkpin,
        role: personnel.role
      });
    }


  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const logout = (req,res)=>{
  try{
    res.clearCookie('token');
    return res.status(200).json({message:"Logged out successfully"})
  }catch(error){
    console.error("Logout error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}