//complain 
//retrieve all complaints
//retrieve based on the filter for linemans, jee,aee,ce, zoneheads 

import express from 'express';
const router = express.Router();
import ComplaintController from '../controllers/ComplaintController.js';

// Route to retrieve all complaints
router.get('/', ComplaintController.getAllComplaints);
router.post('/complaints', ComplaintController.getMyComplaints);


export default router;