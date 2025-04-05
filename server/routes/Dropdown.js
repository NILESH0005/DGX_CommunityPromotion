import express from 'express';
import { getDropdownValues, getQuizGroupDropdown, getQuizDropdown, getQuestionGroupDropdown } from '../controllers/dropdown.js';  // Make sure the path is correct

const router = express.Router();

router.get('/getDropdownValues', getDropdownValues);
router.get('/getQuizGroupDropdown', getQuizGroupDropdown);
router.get('/getQuestionGroupDropdown', getQuestionGroupDropdown);
router.get('/getQuizDropdown', getQuizDropdown);



export default router;
