import express from "express";
// import { fetchUser } from '../middleware/fetchUser.js';
import { fetchUser } from '../middleware/fetchUser.js';
<<<<<<< HEAD
import { profileDetail, getUserDiscussion, deleteUserDiscussion, updateProfilePicture } from "../controllers/userProfile.js";
=======
import { profileDetail, getUserDiscussion, deleteUserDiscussion, uploadUserAvatar } from "../controllers/userProfile.js";
>>>>>>> 88133509591a8537ccf8f847a1b67edffb91e52e

const router = express.Router();

router.post('/profileDetail', fetchUser, profileDetail)
router.post('/getUserDiscussion', fetchUser, getUserDiscussion)
router.post('/deleteUserDiscussion', fetchUser, deleteUserDiscussion)
<<<<<<< HEAD
router.post('/updateProfilePicture', fetchUser, updateProfilePicture)

=======
router.post('/uploadUserAvatar', fetchUser, uploadUserAvatar)
>>>>>>> 88133509591a8537ccf8f847a1b67edffb91e52e



export default router;