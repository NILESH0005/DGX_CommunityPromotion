import express from "express";
import { fetchUser } from '../middleware/fetchUser.js';


import { updateModule, deleteModule, deleteSubModule, updateSubModule, addSubmodule, deleteUnit, updateUnit, deleteFile, addUnit, recordFileView } from "../controllers/lmsEdit.js";

const router = express.Router();

router.post('/updateModule/:id', fetchUser, updateModule)
router.post('/updateSubModule/:id', fetchUser, updateSubModule)
router.post('/updateUnit/:id', fetchUser, updateUnit)
router.post('/deleteModule', fetchUser, deleteModule)
router.post('/deleteUnit', fetchUser, deleteUnit)
router.post('/deleteFile', fetchUser, deleteFile)
router.post('/deleteSubModule', fetchUser, deleteSubModule)
router.post('/addSubmodule', fetchUser, addSubmodule)
router.post('/addUnit', fetchUser, addUnit)
router.post('/recordFileView', fetchUser, recordFileView)







export default router;