import { Complains } from "../models/Complains.js";
import { User } from "../models/User.js";
import { Personnel } from "../models/Personnel.js"
import { LineMan } from "../models/Lineman.js";


const clearTokenCookie = (res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
};
//Get All Complains of the Users usign their userid 
export const getMyComplaints = async (req, res) => {
  try {
    const { filter, category, language, page = 1, limit = 6 } = req.body;

    if (!req.user._id) {
      clearTokenCookie(res)
      return res.status(400).json({ error: "UserId is required" });
    }

    //Checking user
    const user = await User.findOne({ _id: req.user._id })
    if (!user) {
      clearTokenCookie(res)
      return res.status(404).json({ message: "User not found" });
    }

    //Retrieving all Complaints
    let query = { UserId: req.user._id }; // Changed to UserId to directly query by user ID


    if (filter !== "ALL") {
      query.status = filter;
    } if (category !== "All") {
      query.category = category;
    }

    const skip = (page - 1) * limit;
    
    const complaints = await Complains.find(query)
      .select('-UserId -kpin -AssignedWorker -AssetId -AssignedJE -AssignedADE -AssignedCE')
      .skip(skip)
      .limit(limit + 1); // Fetch one extra to check if there are more
    
    const hasMore = complaints.length > limit;
    const complaintsToSend = hasMore ? complaints.slice(0, limit) : complaints;

    if (!complaintsToSend || complaintsToSend.length === 0) {
      return res.status(404).json({ message: "No complaints Registered" });
    }
    if (!language || language === "en" || language === "english") {
      return res.status(200).json({ complaints: complaintsToSend, hasMore: hasMore });
      
    }
    const translateResponse = await axios.post("http://127.0.0.1:8000/translate", {
      from_lang: "en",        
      to_lang: language || "hi", 
      json_data: complaintsToSend
    });

    const translatedComplaints = translateResponse.data.translated_json;


    return res.status(200).json({ complaints: translatedComplaints, hasMore });

  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


//Submittin the FeedBack after Resolving
export const submitRating = async (req, res) => {
  try {
    const { complaintId, rating } = req.body;
    if (!complaintId || !rating) {
      clearTokenCookie(res)
      return res.status(400).json({ error: "complaintId and rating are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ "message": "Rating must be between 1 and 5" });
    }
    const complaint = await Complains.findById(complaintId);
    if (!complaint) {
      clearTokenCookie(res)
      return res.status(404).json({ error: "Complaint not found" });
    }
    complaint.rating = rating;
    await complaint.save();
    return res.status(200).json({ message: "Rating submitted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


//Get the Complaint using their ComplaintId
export const getComplaintById = async (req, res) => {
  try {
    const { language } = req.body;
    const { id } = req.params;
    if (!id) {
      clearTokenCookie(res)
      return res.status(400).json({ error: "ComplaintId is required" });
    }
    let complaint = await Complains.findById(id).select('-UserId -kpin -AssignedWorker -AssetId -AssignedJE -AssignedADE -AssignedCE');
    if (!complaint) {
      clearTokenCookie(res)
      return res.status(404).json({ error: "Complaint not found" });
    }
    if(language && language === "en" && language === "english"){
      return res.status(200).json(complaint);
    }
    const translateResponse = await axios.post("http://127.0.0.1:8000/translate", {
      from_lang: "en",        
      to_lang: language || "hi", 
      json_data: [complaint]
    });

    complaint = translateResponse.data.translated_json;

    return res.status(200).json(complaint[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
//AllSpecific complaints of the AEE
export const viewAllSpecificAEEComplaints = async (req, res) => {
  try {
    const { language, status, page = 1, limit = 6 } = req.body;

    const user = await Personnel.findById(req.user._id);  
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    let query = { kpin: { $regex: `^${user.pkpin}` }, category: user.category }
    if (user.role === "AEE") {
      query.AssignedAEE = user._id;
    } 
    if (status !== "ALL") {
      query.status = status
    }

    const skip = (page - 1) * limit;
    let complains = await Complains.find(query)
      .skip(skip)
      .limit(limit + 1);

    const hasMore = complains.length > limit;
    const complaintsToSend = hasMore ? complains.slice(0, limit) : complains;

    if (!complaintsToSend || complaintsToSend.length === 0) {
      return res.status(200).json({ message: "No Complains Registered", complains: [], hasMore: false })
    }

    if (!language || language === "en" || language === "english") {
      return res.status(200).json({ complains: complaintsToSend, hasMore: hasMore });
    }

    // Translate complaints if language is not English
    const translateResponse = await axios.post("http://127.0.0.1:8000/translate", {
      from_lang: "en",
      to_lang: language,
      json_data: complaintsToSend
    });
    console.log(complaintsToSend)
    console.log(language)
    console.log(translateResponse.data)

    const translatedComplaints = translateResponse.data.translated_json;
    res.status(200).json({ complains: translatedComplaints, hasMore });

  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" })
  }
}

//All About Junior Engineer/ AEE
export const ViewAllJEComplaints = async (req, res) => {
  try {
    const { language, status, role, page = 1, limit = 6 } = req.body;

    const user = await Personnel.findById(req.user._id);


    let query = { kpin: { $regex: `^${user.pkpin}` }, category: user.category }
    if (user.role === "JE") {
      query.AssignedJE = user._id;
    } 
    if (status !== "ALL") {
      query.status = status
    }

    const skip = (page - 1) * limit;
    let complains = await Complains.find(query)
      .skip(skip)
      .limit(limit + 1);

    const hasMore = complains.length > limit;
    const complaintsToSend = hasMore ? complains.slice(0, limit) : complains;

    if (!complaintsToSend || complaintsToSend.length === 0) {
      return res.status(200).json({ message: "No Complains Registered", complains: [], hasMore: false })
    }

    if (!language || language === "en" || language === "english") {
      return res.status(200).json({ complains: complaintsToSend, hasMore: hasMore });
    }

    // Translate complaints if language is not English
    const translateResponse = await axios.post("http://127.0.0.1:8000/translate", {
      from_lang: "en",
      to_lang: language,
      json_data: complaintsToSend
    });
    console.log(complaintsToSend)
    console.log(language)
    console.log(translateResponse.data)

    const translatedComplaints = translateResponse.data.translated_json;
    res.status(200).json({ complains: translatedComplaints, hasMore });

  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" })
  }
}

export const ViewJEComplaint = async (req, res) => {
  try {
    const { language } = req.body;
    const { id } = req.params;
    if (!id) {
      clearTokenCookie(res);
      res.status(400).json({ error: "No Complaint is Selected" })
    }
    let result = await Complains.findOne({ _id: id });
    if (!result) {
      clearTokenCookie(res)
      res.status(500).json({ error: "No Complaint is Registered" })
    }

    const complaintKPIN = result.kpin;
    const prefix8 = complaintKPIN.substring(0, 8);


    const linemen = await LineMan.find({
      kpin: { $regex: `^${prefix8}` },
      category: req.user.category
    }).exec();

    if (!language || language === "en" || language === "english") {

      return res.status(200).json({ complaint: result, linemen: linemen });
    }

    const translateComplaintResponse = await axios.post("http://127.0.0.1:8000/translate", {
      from_lang: "en",
      to_lang: language,
      json_data: [result]
    });

    const translatedComplaint = translateComplaintResponse.data.translated_json[0];

    res.status(200).json({ complaint: translatedComplaint, linemen: linemen })
  } catch (err) {
    res.status(500).json({ Message: "Internal Server Error" })
  }
}

export const ViewAllLinemanComplaints = async (req, res) => {
  try {
    console.log("hello reached till here")
    const { language, status, page = 1, limit = 6 } = req.body;
    const lineman = await LineMan.findById(req.user._id);

    if (!lineman) {
      return res.status(404).json({ message: "Lineman not found" });
    }

    let query = { _id: { $in: lineman.complainId } };

    if (status !== "ALL") {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    let complains = await Complains.find(query)
      .skip(skip)
      .limit(limit + 1);

    const hasMore = complains.length > limit;
    const complaintsToSend = hasMore ? complains.slice(0, limit) : complains;

    if (!complaintsToSend || complaintsToSend.length === 0) {
      return res.status(200).json({ message: "No Complains Registered", complains: [], hasMore: false });
    }

    if (!language || language === "en" || language === "english") {
      return res.status(200).json({ complains: complaintsToSend, hasMore: hasMore });
    }

    const translateResponse = await axios.post("http://127.0.0.1:8000/translate", {
      from_lang: "en",
      to_lang: language,
      json_data: complaintsToSend,
    });

    const translatedComplaints = translateResponse.data.translated_json;

    res.status(200).json({ complains: translatedComplaints, hasMore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const ViewLinemanComplaint = async (req, res) => {
  try {
    const { language } = req.body;
    const { id } = req.params;
    if (!id) {
      clearTokenCookie(res);
      return res.status(400).json({ error: "No Complaint is Selected" });
    }
    let result = await Complains.findOne({ _id: id });
    if (!result) {
      clearTokenCookie(res);
      return res.status(500).json({ error: "No Complaint is Registered" });
    }

    if (!language || language === "en" || language === "english") {
      return res.status(200).json({ complaint: result });
    }

    const translateComplaintResponse = await axios.post("http://127.0.0.1:8000/translate", {
      from_lang: "en",
      to_lang: language,
      json_data: [result],
    });

    const translatedComplaint = translateComplaintResponse.data.translated_json[0];

    res.status(200).json({ complaint: translatedComplaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Message: "Internal Server Error" });
  }
};
//JE/AEE Writing the Solution to the Complaint (if current level and accesser level is same its fine else error)
export const WriteSolution = async (req, res) => {
  try {
    const { id, solution } = req.body;
    const complain = await Complains.findById(id);
    if (!complain) {
      clearTokenCookie(res)
      return res.status(404).json({ error: "Complaint not found" });
    }
    complain.solutionReport = solution;
    await complain.save();
    return res.status(200).json({ message: "Solution updated successfully", compalint: complain });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//Changing the Status of the complain for ADE and JE
export const ChangeStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    const complain = await Complains.findById(id);
    if (!complain) {
      clearTokenCookie(res)
      return res.status(404).json({ error: "Complaint not found" });
    }
    complain.status = status;
    if (status === "Closed") {
      complain.closedAt = Date.now()
    }
    await complain.save();
    return res.status(200).json({ message: "Status updated successfully", compalint: complain });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//Writing the Comments for ADE and AE
export const WriteComment = async (req, res) => {
  try {
    const { id, comment } = req.body;
    const complain = await Complains.findById(id);
    if (!complain) {
      clearTokenCookie(res);
      return res.status(404).json({ error: "Complaint not found" });
    }

    complain.comments.push(comment);

    await complain.save();
    return res.status(200).json({ message: "Comment added successfully", complaint: complain });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
//Assign a Lineman to the Complain
export const AssignLineman = async (req, res) => {
  try {
    const { id, AssignedId } = req.body;
    const complain = await Complains.findById(id);
    if (!complain) {
      clearTokenCookie(res);
      return res.status(404).json({ error: "Complaint not found" });
    }

    const lineman = await LineMan.findById(AssignedId);
    if (!lineman) {
      clearTokenCookie(res)
      return res.status(404).json({ error: "Lineman not found" });
    }

    complain.AssignedWorker.push(AssignedId);
    await complain.save();

    lineman.complainId.push(id);
    await lineman.save();

    return res.status(200).json({ message: "Lineman assigned successfully", complaint: complain });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
//JE upshift Api 
export const UpshiftProblem = async (req, res) => {
  try {
    const { id, upshiftReason } = req.body;
    const complaint = await Complains.findById(id);

    if (!complaint) {
      return res.status(404).json({ error: "Complaint Not Found" });
    }


    const prefix = complaint.kpin.substring(0, 4);


    const personnel = await Personnel.findOne({
      pkpin: { $regex: `^${prefix}` },
      category: complaint.category,
      role: "AEE",
    });

    if (!personnel) {
      return res.status(404).json({ error: "No matching AEE found" });
    }

    // update complaint
    complaint.status = "Upshift"
    complaint.AssignedAEE = personnel._id;
    complaint.upShiftReason = upshiftReason;
    complaint.currentLevel = "AEE";

    await complaint.save();

    res.status(200).json({
      message: "Complaint upshifted successfully",
      complaint,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};













//See All Available LineMans for that complain


//Code to all the junior Engineers of different states and different districts
export const AddJE = async (req, res) => {
  try {
    const result = await Personnel.updateMany(
      { pkpin: { $exists: true, $type: "string" } },
      [
        {
          $set: {
            pkpin: {
              $concat: [
                { $substrCP: ["$pkpin", 0, 2] }, // keep first 2 chars
                { $substrCP: ["$pkpin", 4, { $subtract: [{ $strLenCP: "$pkpin" }, 4] }] } // skip 3rd and 4th
              ]
            }
          }
        }
      ]
    );

    res.status(200).json({
      message: "All Aadhaar numbers updated successfully",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error updating Aadhaar numbers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createComplaint = async (req, res) => {
  try {
    const { problemReport, category, Problem, SubProblem, latitude, longitude, currentLevel } = req.body;
    const imageUrls = req.files.map(file => file.path);

    // Step 1: Get embedding from FastAPI
    const embeddingResponse = await axios.post("http://127.0.0.1:8000/embed", { text: problemReport });
    const newEmbedding = embeddingResponse.data.embedding;

    // Step 2: Search for similar complaints in Prisma
    const complaints = await prisma.$queryRaw`
  SELECT "complaintId", embedding::text AS embedding_text, "userId"
  FROM "ModeComplaint"
`;

    // Compute cosine similarity
    const cosineSimilarity = (vecA, vecB) => {
      const dot = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
      const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
      const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
      return dot / (magA * magB);
    };

    let similarComplaint = null;
    for (let c of complaints) {
      const embeddingArray = JSON.parse(c.embedding_text);
      const sim = cosineSimilarity(embeddingArray, newEmbedding);
      if (sim > 0.85) {  // threshold can be tuned
        similarComplaint = c;
        break;
      }
    }

    if (similarComplaint) {
      const user = await User.findById(req.user._id);

      const complain = await Complains.findById(similarComplaint.complaintId);


      if (complain.UserId.includes(req.user._id)) {
        return res.status(200).json({
          message: "Already complained, no repetition",
          complaintId: similarComplaint.complaintId
        });
      }

      if (complain.Problem === Problem && complain.SubProblem === SubProblem) {
        user.complainIds.push(similarComplaint.complaintId);
        complain.UserId.push(req.user._id)
        await user.save();
        await complain.save();


        return res.status(200).json({
          message: "Similar Complain Exists",
          complaintId: similarComplaint.complaintId,
          userId: similarComplaint.userId
        });
      }
    }

    // Step 3: No similar complaint, create new one
    const userKpinPrefix = req.user.Kpin.substring(0, 6);
    const personnel = await Personnel.findOne({ pkpin: { $regex: `^${userKpinPrefix}` } ,category:category,role:"JE"});

    const complaint = new Complains({
      UserId: req.user?._id,
      problemReport,
      category,
      Problem,
      SubProblem,
      Images: imageUrls,
      latitude,
      longitude,
      kpin: req.user.Kpin,
      AssignedJE: personnel?._id,
      currentLevel: currentLevel || "JE"
    });
    await complaint.save();

    const [inserted] = await prisma.$queryRaw`
  INSERT INTO "ModeComplaint" ("complaintId", "embedding", "userId")
  VALUES (
    ${complaint._id.toString()},
    ${newEmbedding},
    ${req.user._id.toString()}
  )
  RETURNING id;
`;


    // Add complaint ID to user
    const user = await User.findById(req.user._id);
    if (user) {
      user.complainIds.push(complaint._id);
      await user.save();
    }

    res.status(201).json({ message: "Complaint created successfully" });
  } catch (err) {
    console.error("Error creating complaint:", err);
    res.status(500).json({ error: "Failed to create complaint" });
  }
};











