//to access all assests in their location for lineman,jee,aee,ce,zonehead
// to access assests around 500m of location 
//to add an assest
//to update an assest 
//to delete an assest
//to approve the assests 
//to reject the assests
//to show all the assests which are not approved to their respective ae



import express from 'express';
const router = express.Router();
import AssestController from '../controllers/AssestsController.js';
import { authenticate, authorizeRole } from '../lib/Authenticate.js';
import { upload } from '../lib/cloudinary.js';

router.post('/point',authenticate,authorizeRole("JE") ,upload.array("Images", 1),AssestController.addPointAsset);
router.post('/linestring',authenticate,authorizeRole("JE"),upload.array("Images", 1), AssestController.addLineStringAsset);
router.post('/fetchMap',authenticate,authorizeRole("JE"), AssestController.fetchMapAssets);
router.post('/delete',authenticate,authorizeRole('JE'),AssestController.deleteAsset)

export default router;