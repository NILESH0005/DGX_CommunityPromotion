// src/App.jsx
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './container/Home.jsx';
import Navbar from './component/Navbar.jsx';
import VerifyEmail from './component/VerifyEmail.jsx';
import Register from './component/Register.jsx';
import SignInn from './component/SignInn';
import ForgotPassword from './component/ForgotPassword';
import ChangePassword from './component/ChangePassword.jsx';
import UserProfile from './component/UserProfile.jsx';
import Discussion from './container/Discussion.jsx';
import Blog from './container/Blog.jsx';
import ContactUs from './container/ContactUs.jsx';
import Notfound from './component/Notfound.jsx';
import ResetPassword from './component/ResetPassword.jsx';
// import images from './constant/images.js';
import CommunityGuidelines from './component/CommunityGuidelines.jsx';
import Resources from './component/Resources.jsx';
import Footer from './component/Footer.jsx';
import Survey from './component/Survey.jsx';
// import Quiz from './component/Quiz.jsx';
import EventWorkshopPage from './container/EventWorkshopPage.jsx';
// import MyStoryboard from './component/MyStoryboard.jsx';
// import LoadPage from './component/LoadPage.jsx';
import LoadPage from './component/LoadPage.jsx';
// import Calendar from './component/Calendar.jsx';
import EventRegistrationPage from './component/EventRegistrationPage.jsx';
import GeneralUserCalendar from './component/GeneralUserCalendar.jsx';
import AdminDashboard from './Admin/AdminDashboard.jsx';
import HomeAfterLoginComponent from './component/HomeAfterLoginComponent.jsx';
// import PostCode from './component/PostCode.jsx';
import CreateICSFile from './component/CreateICSFile.jsx';
import ConfirmationModal from './component/ConfirmationModal.jsx';
import DiscussionModal from './component/discussion/DiscussionModal.jsx';
import { ToastContainer } from 'react-toastify';
import ContentSection from './component/ContentSection.jsx';
import ParallaxSection from './component/ParallaxSection.jsx';
import NewsSection from './component/NewsSection.jsx';
import ProjectShowcase from './component/ProjectShowcase.jsx';
import CommunityHighlights from './component/CommunityHighlights.jsx';
import AddUserEvent from './component/AddUserEvent.jsx';
import QuizInterface from './component/QuizInterface.jsx';
import QuizPanel from './Admin/Components/Quiz/QuizPanel.jsx';
import BeforeLogin from './container/BeforeLogin.jsx';
import CreateQuiz from './Admin/Components/Quiz/CreateQuiz.jsx';
import QuizList from './component/quiz/QuizList.jsx';
import Quiz from './component/quiz/Quiz.jsx';
import QuestionBank from './Admin/Components/Quiz/QuestionBank.jsx';
import QuizQuestions from './Admin/Components/Quiz/QuizQuestions.jsx';
import Lms from './component/LMS/Lms.jsx';

// import BlogManager from './Admin/Components/BlogManager.jsx';
import TeachingModules from './component/LMS/TeachingModules.jsx'

// import BlogManager from './Admin/Components/BlogManager.jsx';
import DeepLearningKit from './component/LMS/Modules/DeepLearningKit.jsx';
import AiRoboticsKit from './component/LMS/Modules/AiRoboticsKit.jsx';
import NvidiaIntro from './component/LMS/Modules/NvidiaIntro.jsx';
import IndustrialMetaverseKit from './component/LMS/Modules/IndustrialMetaverseKit.jsx';
import GenAiKit from './component/LMS/Modules/GenAiKit.jsx';
import DatasetModules from './component/LMS/DatasetModules.jsx';
import Regression from './component/LMS/Regression.jsx';
import Pretrained from './component/LMS/Pretrained.jsx';
import ObjectClassification from './component/LMS/ObjectClassification.jsx';
import Generative from './component/LMS/Generative.jsx';
import DigitalLearning from './component/LMS/DigitalLearning.jsx';
import ComputerVision from './component/LMS/ComputerVision.jsx'
import Annotation from './component/LMS/Annotation.jsx';
import Algorithms from './component/LMS/Algorithms.jsx';
import LeaderBoard from './component/LMS/LeaderBoard.jsx';
import Chatbot from './component/LMS/ChatBot.jsx';
import QuizResult from './component/quiz/QuizResult.jsx';




function App() {

  const [blogs, setBlogs] = useState([]);
  const [events, setEvents] = useState([]); 
  


  return (
    <>
      <ToastContainer style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow ">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/" element={<BeforeLogin />} />
            <Route exact path="/VerifyEmail" element={<VerifyEmail />} />
            <Route exact path="/Register" element={<Register />} />
            <Route path="/SignInn" element={<SignInn />} />
            <Route path="/ForgotPassword" element={<ForgotPassword />} />
            <Route path="/ChangePassword" element={<ChangePassword />} />
            <Route path="/UserProfile" element={<UserProfile 
            blogs={blogs} setBlogs={setBlogs} 
            events={events} setEvents={setEvents}/>} />
            <Route path='/Discussion' element={<Discussion />} />
            <Route path='/ContactUs' element={<ContactUs />} />
            <Route path='/Blog' element={<Blog />} />
            {/* <Route path='/DiscussionModal' element={<DiscussionModal />} /> */}
            <Route path='/ResetPassword' element={<ResetPassword />} />
            <Route path='/CommunityGuidelines' element={<CommunityGuidelines />} />
            <Route path='/Resources' element={<Resources />} />
            <Route path='/404' element={<Notfound />} />
            {/* <Route path='/Quiz' element={<Quiz />} /> */}
            <Route path='/Survey' element={<Survey />} />
            <Route path='/ConfirmationModal' element={<ConfirmationModal />} />
            {/* <Route path='/MyStoryboard' element={<MyStoryboard />} /> */}
            <Route path='/EventWorkshopPage' element={<EventWorkshopPage />} />
            <Route path='/EventRegistrationPage' element={<EventRegistrationPage />} />
            <Route path='/HomeAfterLoginComponent' element={<HomeAfterLoginComponent />} />
            {/* <Route path='/PostCode' element={<PostCode />} /> */}
            <Route path='/CreateICSFile' element={<CreateICSFile />} />
            <Route path='/AddUserEvent' element={<AddUserEvent />} />



            {/* //add path for dynamic  homepage */}
            <Route path='/ParallaxSection' element={<ParallaxSection />} />
            <Route path='/ContentSection' element={<ContentSection />} />
            <Route path='/NewsSection' element={<NewsSection />} />
            <Route path='/ProjectShowcase' element={<ProjectShowcase />} />
            <Route path='/CommunityHighlights' element={<CommunityHighlights />} />

            {/* Added Quiz in Navbar */}
            <Route path='/QuizInterface' element={<QuizInterface />} />
            <Route path='../Admin/Components/Quiz/QuizPanel' element={<QuizPanel />} />
            <Route path='/QuizList' element={<QuizList />} />
            <Route path='/Quiz' element={<Quiz/>} />
            <Route path='/QuizQuestions' element={<QuizQuestions/>} />
            <Route path='/quiz-result' element={<QuizResult/>} />
            

            
            <Route path="/CreateQuiz" element={<CreateQuiz />} />
            <Route path="/QuestionBank" element={<QuestionBank />} />
            {  /*-----------ADMIN----------- */}

            <Route path='/AdminDashboard' element={<AdminDashboard 
            blogs={blogs} setBlogs={setBlogs}
            events={events} setEvents={setEvents}/>} />
            {/* <Route path='/Admin/Sidebar' element={<Sidebar />} /> */}
            <Route path='/LoadPage' element={<LoadPage />} />
            {/* <Route path='/Calendar' element={<Calendar />} /> */}
            <Route path='/GeneralUserCalendar' element={<GeneralUserCalendar />} />
            {/* <Route path='/BlogManager' element={<BlogManager/>}/> */}
          
              {/* LMS */}
                          <Route path='/Lms' element={<Lms />} />
                          <Route path='/teaching-modules' element={<TeachingModules />} />
                          <Route path="/edge-ai-robotics-kit" element={<AiRoboticsKit />} />
                          <Route path="/deep-learning-kit" element={<DeepLearningKit />} />
                          <Route path="/generative-ai-kit" element={<GenAiKit />} />
                          <Route path="/industrial-metaverse-kit" element={<IndustrialMetaverseKit />} />
                          <Route path="/nvidia-intro" element={<NvidiaIntro />} />
                          
              
                          <Route path='/data-modules' element={<DatasetModules />} />
                          <Route path='/regression-modules' element={<Regression />} />
                          <Route path='/pretrained-modules' element={<Pretrained />} />
                          <Route path='/object-classification-modules' element={<ObjectClassification />} />
                          <Route path='/generative-ai-modules' element={<Generative />} />
                          <Route path='/digital-learning-modules' element={<DigitalLearning />} />
                          <Route path='/computer-vision-modules' element={<ComputerVision />} />
                          <Route path='/annotation-modules' element={<Annotation />} />
                          <Route path='/algorithms-modules' element={<Algorithms />} />
                          
                          
                          {/* LeaderBoard and Chatabot */}
                          <Route path='/leaderboard' element={<LeaderBoard />} />
                          <Route path='/chatbot' element={<Chatbot />} />
              
          
          </Routes>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default App;
