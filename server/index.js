// import express from 'express';
// import bodyParser from 'body-parser';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import multer from 'multer';
// import path from 'path';
// import userRoutes from './routes/user.js';
// import userDiscussion from './routes/Discussion.js';
// import userEvent from './routes/EventAndWorkshop.js';
// import userBlog from './routes/Blog.js';
// import userProfile from './routes/UserProfile.js';
// import dropdownRoutes from './routes/Dropdown.js';
// import { connectToDatabase } from './database/mySql.js';
// import homeRoutes from './routes/Home.js';
// import quizRoutes from './routes/Quiz.js';
// import LMS from './routes/LMS.js'
// import lmsEdit from './routes/LmsEdit.js';
// import progressRoute from './routes/ProgressTrack.js';



// dotenv.config();

// const port = process.env.PORT || 8000;
// const app = express();

// app.use(
//   cors({
//     origin: '*',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     credentials: true,
//   })
// );

// app.use(express.json({ limit: '10mb' }));
// app.use(bodyParser.json({ limit: '10mb' }));
// app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// app.use('/gifs', express.static('uploads/gifs'));
// app.use('/lms', LMS)
// app.use('/user', userRoutes);
// app.use('/discussion', userDiscussion);
// app.use('/eventandworkshop', userEvent);
// app.use('/blog', userBlog);
// app.use('/userprofile', userProfile);
// app.use('/dropdown', dropdownRoutes);
// app.use('/addUser', userRoutes);
// app.use('/home', homeRoutes);
// app.use('/quiz', quizRoutes);
// app.use('/lmsEdit', lmsEdit);
// app.use('/progressTrack', progressRoute )


// const learningMaterialStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'D:/dgx_deployed/server/uploads/learning-materials');
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
//     cb(null, uniqueName);
//   },
// });

// const uploadLearningMaterial = multer({ 
//   storage: learningMaterialStorage,
//   limits: {
//     fileSize: 10 * 1024 * 1024 // 10MB limit
//   },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed.'));
//     }
//   }
// });

// connectToDatabase((err) => {
//   if (err) {
//     console.error('Failed to connect to the database. Exiting...');
//     process.exit(1);
//   } else {
//     console.log('Database connection successful.');
//     app.listen(port, () => {
//       console.log(`Server is running at http://localhost:${port}`);
//     });
//   }
// });

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

// app.use('/uploads', express.static('uploads'));


import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/user.js';
import userDiscussion from './routes/Discussion.js';
import userEvent from './routes/EventAndWorkshop.js';
import userBlog from './routes/Blog.js';
import userProfile from './routes/UserProfile.js';
import dropdownRoutes from './routes/Dropdown.js';
import { connectToDatabase } from './database/mySql.js';
import homeRoutes from './routes/Home.js';
import quizRoutes from './routes/Quiz.js';
import LMS from './routes/LMS.js';
import lmsEdit from './routes/LmsEdit.js';
import progressRoute from './routes/ProgressTrack.js';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const port = process.env.PORT || 8000;
const app = express();

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/gifs', express.static('uploads/gifs'));
app.use('/lms', LMS);
app.use('/user', userRoutes);
app.use('/discussion', userDiscussion);
app.use('/eventandworkshop', userEvent);
app.use('/blog', userBlog);
app.use('/userprofile', userProfile);
app.use('/dropdown', dropdownRoutes);
app.use('/addUser', userRoutes);
app.use('/home', homeRoutes);
app.use('/quiz', quizRoutes);
app.use('/lmsEdit', lmsEdit);
app.use('/progressTrack', progressRoute);
app.use('/uploads', express.static('uploads'));

// Serve static files from React build (assuming build is in '../client/build')
app.use(express.static(path.join(__dirname, '../client/build')));

// Catch-all route for client-side routing - MUST COME AFTER API ROUTES
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// File upload configuration
const learningMaterialStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'D:/dgx_deployed/server/uploads/learning-materials');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const uploadLearningMaterial = multer({
  storage: learningMaterialStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed.'));
    }
  }
});

// Database connection and server start
connectToDatabase((err) => {
  if (err) {
    console.error('Failed to connect to the database. Exiting...');
    process.exit(1);
  } else {
    console.log('Database connection successful.');
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  }
});

// Error handling middleware - MUST BE LAST
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});