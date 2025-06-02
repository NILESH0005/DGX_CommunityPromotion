import express from "express";
import { fetchUser } from '../middleware/fetchUser.js';


import { getUserFileIDs, getSubModuleProgress  } from "../controllers/progressTrack.js";

const router = express.Router();

router.post('/getUserFileIDs', fetchUser ,getUserFileIDs)
router.post('/getSubModuleProgress', fetchUser ,getSubModuleProgress)


export default router;