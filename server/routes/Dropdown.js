import express from 'express';
import { getDropdownValues, getQuizGroupDropdown, getQuizDropdown, getQuestionGroupDropdown, getModules } from '../controllers/dropdown.js';  // Make sure the path is correct

const router = express.Router();

router.get('/getDropdownValues', getDropdownValues);
router.get('/getQuizGroupDropdown', getQuizGroupDropdown);
router.get('/getQuestionGroupDropdown', getQuestionGroupDropdown);
router.get('/getQuizDropdown', getQuizDropdown);
router.get('/getModules', getModules);




export default router;
