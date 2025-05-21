// config/multerConfig.js
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx|mp4|mov|ipynb/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  // Special handling for IPYNB files
  const isIpynb = path.extname(file.originalname).toLowerCase() === '.ipynb';
  
  // Allow IPYNB regardless of MIME type, or other files with matching MIME type
  if (isIpynb || filetypes.test(file.mimetype)) {
    return cb(null, true);
  }
  
  cb(new Error('Only image, PDF, document, presentation, video, and Jupyter Notebook files are allowed'));
};

export const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter
});