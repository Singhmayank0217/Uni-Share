import multer from 'multer';
import path from 'path';

// Allowed file extensions (normalized to lowercase)
const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.zip', '.jpg', '.png', '.gif','.txt'];

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const fileExt = path.extname(file.originalname || '').toLowerCase();

  console.log(`📂 Uploading file: ${file.originalname} (${fileExt})`); // Debug log

  if (!fileExt) {
    console.error('❌ File has no extension');
    return cb(new Error('File must have an extension'), false);
  }

  if (allowedExtensions.includes(fileExt)) {
    cb(null, true);
  } else {
    console.error(`❌ Rejected file: ${file.originalname} (type: ${fileExt})`);
    cb(new Error('Invalid file type. Allowed types: ' + allowedExtensions.join(', ')), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export default upload;
