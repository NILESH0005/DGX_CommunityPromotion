import express from "express";
import { fetchUser } from '../middleware/fetchUser.js';


import { updateModule, deleteModule, deleteSubModule, updateSubModule } from "../controllers/lmsEdit.js";

const router = express.Router();

router.post('/updateModule/:id', fetchUser, updateModule)
router.post('/updateSubModule/:id', fetchUser, updateSubModule)
router.post('/deleteModule', fetchUser, deleteModule)
router.post('/deleteSubModule', fetchUser, deleteSubModule)




export default router;