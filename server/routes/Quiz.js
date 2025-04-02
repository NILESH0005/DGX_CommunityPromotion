import express from "express";
import { fetchUser } from '../middleware/fetchUser.js';
import { createQuiz, getQuizzes, deleteQuiz, createQuestion, getQuestion, deleteQuestion, getQuestionsByGroup, createQuizQuestionMapping, getUserQuizCategory, getQuizQuestions, submitQuiz, updateQuiz } from "../controllers/quiz.js";

const router = express.Router();

router.post('/createQuiz', fetchUser, createQuiz)
router.post('/deleteQuiz', fetchUser, deleteQuiz)
router.get('/getQuizzes', fetchUser, getQuizzes)
router.post('/createQuestion', fetchUser, createQuestion)
router.get('/getQuestion', fetchUser, getQuestion)
router.post('/deleteQuestion', fetchUser, deleteQuestion)
router.post('/getQuestionsByGroup', fetchUser, getQuestionsByGroup)
router.post('/createQuizQuestionMapping', fetchUser, createQuizQuestionMapping)
router.get('/getUserQuizCategory', fetchUser, getUserQuizCategory)
router.post('/getQuizQuestions', fetchUser, getQuizQuestions)
router.post('/submitQuiz', fetchUser, submitQuiz)
router.post('/updateQuiz', fetchUser, updateQuiz)









export default router;




























  