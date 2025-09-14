import { User } from "../models/User.js";
import { Personnel } from "../models/Personnel.js";
import { Vonage } from "@vonage/server-sdk";

// const vonage = new Vonage({
//   apiKey: process.env.VONAGE_API_KEY || "2a1ff7a6",
//   apiSecret: process.env.VONAGE_SECRET_KEY
// });

// const from = "Vonage APIs";

export const login = async (req, res) => {
  try {
    console.log("Reached login Function")
    const { adharNumber } = req.body;
    
    if (!adharNumber) {
      return res.status(400).json({ error: "Adhar number is required" });
    }

    // Check in User model first
    let user = await User.findOne({ AadharNumber: adharNumber });
    let personnel = null;
    
    // If not found in User, check in Personnel model
    if (!user) {
      personnel = await Personnel.findOne({ aadhaarNumber: adharNumber });
      if (!personnel) {
        return res.status(404).json({ error: "Adhar number not found" });
      }
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Update OTP in respective model
    if (user) {
      await User.findOneAndUpdate(
        { AadharNumber: adharNumber },
        { Otp: otp }
      );
    } else if (personnel) {
      await Personnel.findOneAndUpdate(
        { aadhaarNumber: adharNumber },
        { otp: otp }
      );
    }
    return res.status(200).json({ 
      message: "OTP generated successfully",
      otp: otp, // For testing purposes; remove in production
      userType: user ? "user" : "personnel"
    });
    
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { adharNumber, otp } = req.body;
    
    if (!adharNumber || !otp) {
      return res.status(400).json({ error: "Adhar number and OTP are required" });
    }

    // Check in User model first
    let user = await User.findOne({ AadharNumber: adharNumber });
    let personnel = null;
    
    // If not found in User, check in Personnel model
    if (!user) {
      personnel = await Personnel.findOne({ aadhaarNumber: adharNumber });
      if (!personnel) {
        return res.status(404).json({ error: "Adhar number not found" });
      }
    }

    // Verify OTP
    const storedOtp = user ? user.Otp : personnel.otp;
    
    if (storedOtp !== otp) {
      return res.status(401).json({ error: "Invalid OTP" });
    }

    // Clear OTP after successful verification
    if (user) {
      await User.findOneAndUpdate(
        { AadharNumber: adharNumber },
        { Otp: null }
      );
    } else {
      await Personnel.findOneAndUpdate(
        { aadhaarNumber: adharNumber },
        { otp: null }
      );
    }

    // // Return user data
    // const userData = user ? {
    //   id: user._id,
    //   aadharNumber: user.AadharNumber,
    //   phoneNumber: user.PhoneNumber,
    //   role: user.role || "user",
    //   areaPin: user.AreaPin
    // } : {
    //   id: personnel._id,
    //   aadharNumber: personnel.aadhaarNumber,
    //   phoneNumber: personnel.phoneNumber,
    //   role: personnel.role,
    //   zoneCode: personnel.zoneCode,
    //   districtCode: personnel.districtCode,
    //   mandalCode: personnel.mandalCode,
    //   villageCode: personnel.villageCode
    // };

    return res.status(200).json({ 
      message: "OTP verified successfully",
      // user: userData
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};