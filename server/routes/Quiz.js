import express from "express";
import { fetchUser } from '../middleware/fetchUser.js';
import { createQuiz, getQuizzes, deleteQuiz, createQuestion, deleteQuestion, getQuestionsByGroupAndLevel, updateQuiz, createQuizQuestionMapping, getUserQuizCategory, getQuizQuestions, submitQuiz,getQuestion, unmappQuestion, updateQuestion } from "../controllers/quiz.js";

const router = express.Router();

router.post('/createQuiz', fetchUser, createQuiz)
router.post('/deleteQuiz', fetchUser, deleteQuiz)
router.get('/getQuizzes', fetchUser, getQuizzes)
router.post('/createQuestion', fetchUser, createQuestion)
router.get('/getQuestion', fetchUser, getQuestion)
router.post('/deleteQuestion', fetchUser, deleteQuestion)
router.post('/getQuestionsByGroupAndLevel', fetchUser, getQuestionsByGroupAndLevel)
router.post('/createQuizQuestionMapping', fetchUser, createQuizQuestionMapping)
router.get('/getUserQuizCategory', fetchUser, getUserQuizCategory)
router.post('/getQuizQuestions', fetchUser, getQuizQuestions)
router.post('/submitQuiz', fetchUser, submitQuiz)
router.post('/unmappQuestion', fetchUser, unmappQuestion)

// router.get('/getQuizResults/:quizId', fetchUser, getQuizResults)
router.post('/updateQuiz', fetchUser, updateQuiz)
router.post('/updateQuestion', fetchUser, updateQuestion)








export default router;




























  