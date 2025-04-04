import express from 'express';
import { getDropdownValues, getQuestionGroupDropdown, getQuizGroupDropdown } from '../controllers/dropdown.js';  // Make sure the path is correct

const router = express.Router();

router.get('/getDropdownValues', getDropdownValues);
router.get('/getQuizGroupDropdown', getQuizGroupDropdown);
router.get('/getQuestionGroupDropdown', getQuestionGroupDropdown );


export default router;
