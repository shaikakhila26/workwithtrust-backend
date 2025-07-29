import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Store uploads temporarily before sending to Cloudinary
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join('C:/Projects/workwithtrust/workwithtrust-backend/uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log('📂 Created uploads directory:', uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
     cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage ,fileFilter: (req, file, cb) => {
    if (file.fieldname === 'image' && !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only images are allowed for image field'), false);
    }
    if (file.fieldname === 'video' && !file.mimetype.startsWith('video/')) {
      return cb(new Error('Only videos are allowed for video field'), false);
    }
    cb(null, true);
  },
});


export default upload;
