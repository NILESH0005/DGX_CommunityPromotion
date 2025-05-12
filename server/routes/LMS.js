// routes/lmsRoutes.js
import express from "express";
import { fetchUser } from '../middleware/fetchUser.js';
import { LMS } from "../controllers/lms.js";

const router = express.Router();

// File upload route
router.post('/upload-learning-material',
  fetchUser,
  LMS.upload.single('file'), // Handles file storage
  LMS.uploadFile            // Handles database operations
);

// New route for fetching sub-modules
router.get('/sub-modules', 
  fetchUser,
  LMS.getSubModules
);

router.get('/units', 
  fetchUser,
  LMS.getUnits
);

export default router;