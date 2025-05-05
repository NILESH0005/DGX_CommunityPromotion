import express from "express";
import { fetchUser } from '../middleware/fetchUser.js';
import { LMS } from "../controllers/lms.js"; // Now this will work

const router = express.Router();

// File upload route with authentication
router.post('/api/upload-learning-material', 
  fetchUser, 
  LMS.upload.single('file'),
  LMS.uploadFile
);

export default router;