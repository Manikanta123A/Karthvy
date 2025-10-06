//complain 
//retrieve all complaints
//retrieve based on the filter for linemans, jee,aee,ce, zoneheads 

import express from 'express';
import { upload } from '../lib/cloudinary.js';
const router = express.Router();
import { AddJE,AssignLineman,ChangeStatus,createComplaint,getComplaintById, getMyComplaints, submitRating, UpshiftProblem, ViewAllJEComplaints, ViewAllLinemanComplaints, viewAllSpecificAEEComplaints, ViewJEComplaint, ViewLinemanComplaint, WriteComment, WriteSolution} from '../controllers/ComplaintController.js';
import { authenticate, authorizeRole } from '../lib/Authenticate.js';

router.post('/my', authenticate,authorizeRole("user"),getMyComplaints);
router.post('/id/:id',authenticate, authorizeRole("user") ,getComplaintById);
router.post('/submit-rating',authenticate, authorizeRole("user") ,submitRating);
router.post('/addJE',AddJE);

router.post('/createComplaint',authenticate,authorizeRole("user"),upload.array("images", 5),createComplaint);

router.post('/viewallje', authenticate,authorizeRole("JE"),ViewAllJEComplaints);
router.post('/viewJeCompalint/:id',authenticate,authorizeRole("JE"),ViewJEComplaint);
router.post('/writeComment',authenticate,authorizeRole("JE"),WriteComment);
router.post('/changeStatus',authenticate,authorizeRole('JE'),ChangeStatus);
router.post('/writeSolution',authenticate,authorizeRole('JE'),WriteSolution);
router.post('/assignLine',authenticate,authorizeRole('JE'),AssignLineman);
router.post('/upshift',authenticate,authorizeRole('JE'),UpshiftProblem)




router.post('/viewallaee', authenticate,authorizeRole("AEE"),ViewAllJEComplaints);
router.post('/viewAeeCompalint/:id',authenticate,authorizeRole("AEE"),ViewJEComplaint);
router.post('/Aee/writeComment',authenticate,authorizeRole("AEE"),WriteComment);
router.post('/Aee/changeStatus',authenticate,authorizeRole('AEE'),ChangeStatus);
router.post('/Aee/writeSolution',authenticate,authorizeRole('AEE'),WriteSolution);
router.post('/Aee/specificComplaints',authenticate,authorizeRole("AEE"),viewAllSpecificAEEComplaints);


router.post('/Lineman/All',authenticate,authorizeRole("lineman"),ViewAllLinemanComplaints);
router.post('/Lineman/complaints/:id',authenticate,authorizeRole("lineman"),ViewLinemanComplaint);
export default router;


