// config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage setup for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "complaints", 
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

// Multer middleware
const upload = multer({ storage });

export { cloudinary, upload };
