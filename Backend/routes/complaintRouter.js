//complain 
//retrieve all complaints
//retrieve based on the filter for linemans, jee,aee,ce, zoneheads 

import express from 'express';
const router = express.Router();
import {getComplaintById, getMyComplaints, submitRating} from '../controllers/ComplaintController.js';

// // Route to retrieve all complaints
// router.get('/', ComplaintController.getAllComplaints);
router.post('/my', getMyComplaints);
router.get('/id/:id', getComplaintById);
router.post('/submit-rating', submitRating);


export default router;