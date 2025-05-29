import express from "express";
import { fetchUser } from '../middleware/fetchUser.js';


import { getUserFileIDs  } from "../controllers/progressTrack.js";

const router = express.Router();

router.post('/getUserFileIDs', fetchUser ,getUserFileIDs)

export default router;