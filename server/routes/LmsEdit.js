import express from "express";
import { fetchUser } from '../middleware/fetchUser.js';


import { updateModule, deleteModule, deleteSubModule, updateSubModule, addSubmodule } from "../controllers/lmsEdit.js";

const router = express.Router();

router.post('/updateModule/:id', fetchUser, updateModule)
router.post('/updateSubModule/:id', fetchUser, updateSubModule)
router.post('/deleteModule', fetchUser, deleteModule)
router.post('/deleteSubModule', fetchUser, deleteSubModule)
router.post('/addSubmodule', fetchUser, addSubmodule)





export default router;