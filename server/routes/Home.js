import express from "express";
import { fetchUser } from '../middleware/fetchUser.js';
import {
  addParallaxText,
  getParallaxContent,
  setActiveParallaxText, 
  addContentSection,
  getContent,
  addNewsSection,
  updateContentSection,
  addProjectShowcase,
  getProjectShowcase,


  getAllCMSContent,
} from "../controllers/home.js";

const router = express.Router();

router.post('/addParallaxText', fetchUser, addParallaxText);
router.post('/getParallaxContent',  getParallaxContent);
router.post('/setActiveParallaxText', fetchUser, setActiveParallaxText);
router.post('/addContentSection', fetchUser, addContentSection);
router.get('/getContent',  getContent);
router.get('/getProjectShowcase',  getProjectShowcase);
router.post('/updateContentSection', fetchUser, updateContentSection);
router.post('/addNewsSection', fetchUser, addNewsSection);
router.post('/addNewsSection', fetchUser, addNewsSection);
router.post('/addProjectShowcase', fetchUser, addProjectShowcase);



router.get('/getAllCMSContent',  getAllCMSContent);





export default router;