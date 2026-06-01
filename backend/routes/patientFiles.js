import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadMiddleware, handleUploadError } from '../middleware/uploadMiddleware.js';
import { 
  uploadPatientFile, 
  getPatientFiles, 
  deletePatientFile, 
  downloadPatientFile 
} from '../controllers/patientFilesController.js';

const router = express.Router();

router.use(authenticate);

// رفع ملف جديد
router.post('/', uploadMiddleware.single('file'), handleUploadError, uploadPatientFile);

// جلب قائمة ملفات المريض
router.get('/', getPatientFiles);

// حذف ملف
router.delete('/:id', deletePatientFile);

// تحميل ملف
router.get('/:id/download', downloadPatientFile);

export default router;
