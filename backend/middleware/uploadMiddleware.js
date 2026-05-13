import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    // استخدم UUID لتسمية الملف مع الحفاظ على الامتداد
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uuidv4() + ext);
  }
});

// الحد الأقصى للأحجام
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: Math.max(MAX_PDF_SIZE, MAX_IMAGE_SIZE) }, // الحد الأقصى المطلق
  fileFilter: (req, file, cb) => {
    // التحقق من نوع الملف (mimetype)
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('نوع الملف غير مدعوم. المسموح فقط: PDF, JPG, PNG'));
    }

    // التحقق من الحجم حسب النوع
    // multer limits applies globally, so we check specific sizes here if we can,
    // but `fileFilter` doesn't have file size yet. We will check it after upload, 
    // or we just trust multer limits for the max (10MB) and do a secondary check in the controller.
    
    cb(null, true);
  }
});

// Middleware لمعالجة الأخطاء الخاصة بـ multer
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'حجم الملف تجاوز الحد المسموح به' });
    }
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};
