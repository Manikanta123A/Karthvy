import { Complains } from "../models/Complains.js";
import { User } from "../models/User.js";



//Get All Complains of the Users usign their userid 
export const getMyComplaints = async (req, res) => {
    try {
        const { userid, filter, category } = req.body;

        if (!userid) {
            return res.status(400).json({ error: "UserId is required" });
        }

        //Checking user
        const user = await User.findOne({ _id: userid })
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        //Retrieving all Complaints
        let query = { _id: { $in: user.complainIds } };


        if (filter !== "ALL") {
            query.status = filter;
        } if (category !== "All") {
            query.category = category;
        }

        const complaints = await Complains.find(query)
            .select('-UserId -kpin -AssignedWorker -AssetId');
        if (!complaints || complaints.length === 0) {
            return res.status(404).json({ message: "No complaints found for the given kpin" });
        }
        return res.status(200).json({ complaints: complaints });

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
            return res.status(400).json({ error: "complaintId and rating are required" });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5" });
        }
        const complaint = await Complains.findById(complaintId);
        if (!complaint) {
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
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "ComplaintId is required" });
        }
        const complaint = await Complains.findById(id).select('-UserId -kpin -AssignedWorker -AssetId');
        if (!complaint) {
            return res.status(404).json({ error: "Complaint not found" });
        }
        return res.status(200).json(complaint);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

















//Complaints Fetched for lineman
export const getComplaintsUnderPersonnel = async (req, res) => {
    try {
        const { role, pkpin, category, filter } = req.body;

        if (pkpin) {
            const regex = new RegExp(`^${pkpin}`);  
            query.kpin = { $regex: regex };
        }
        if (filter !== "ALL") {
            query.status = filter;
        }

        const complains = await Complains.find(query);

        res.status(200).json({ complains });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}