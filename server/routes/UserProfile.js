import express from "express";
// import { fetchUser } from '../middleware/fetchUser.js';
import { fetchUser } from '../middleware/fetchUser.js';
import { profileDetail, getUserDiscussion, deleteUserDiscussion, updateProfilePicture } from "../controllers/userProfile.js";

const router = express.Router();

router.post('/profileDetail', fetchUser, profileDetail)
router.post('/getUserDiscussion', fetchUser, getUserDiscussion)
router.post('/deleteUserDiscussion', fetchUser, deleteUserDiscussion)
router.post('/updateProfilePicture', fetchUser, updateProfilePicture)




export default router;