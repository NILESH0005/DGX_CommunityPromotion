import express from "express";
// import { fetchUser } from '../middleware/fetchUser.js';
import { fetchUser } from '../middleware/fetchUser.js';
<<<<<<< Updated upstream
import { profileDetail, getUserDiscussion, deleteUserDiscussion, uploadUserAvatar } from "../controllers/userProfile.js";
=======
import { profileDetail, getUserDiscussion, deleteUserDiscussion, updateProfilePicture } from "../controllers/userProfile.js";
>>>>>>> Stashed changes

const router = express.Router();

router.post('/profileDetail', fetchUser, profileDetail)
router.post('/getUserDiscussion', fetchUser, getUserDiscussion)
router.post('/deleteUserDiscussion', fetchUser, deleteUserDiscussion)
<<<<<<< Updated upstream
router.post('/uploadUserAvatar', fetchUser, uploadUserAvatar)


=======
router.post('/updateProfilePicture', fetchUser, updateProfilePicture)
>>>>>>> Stashed changes

export default router;