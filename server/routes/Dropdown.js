import express from 'express';
import { getDropdownValues, getQuizGroupDropdown, getQuizDropdown, getQuestionGroupDropdown, getModules, getSubModules, getModuleById } from '../controllers/dropdown.js';  // Make sure the path is correct

const router = express.Router();

router.get('/getDropdownValues', getDropdownValues);
router.get('/getQuizGroupDropdown', getQuizGroupDropdown);
router.get('/getQuestionGroupDropdown', getQuestionGroupDropdown);
router.get('/getQuizDropdown', getQuizDropdown);
router.get('/getModules', getModules);
router.get('/getSubModules', getSubModules);
router.get('/getModuleById', getModuleById);  // For single module by ID





export default router;
