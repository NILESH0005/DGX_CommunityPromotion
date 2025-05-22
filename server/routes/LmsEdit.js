import express from "express";
import { fetchUser } from '../middleware/fetchUser.js';


import { updateModule } from "../controllers/lmsEdit.js";

const router = express.Router();

router.post('/updateModule/:id', fetchUser, updateModule)


export default router;