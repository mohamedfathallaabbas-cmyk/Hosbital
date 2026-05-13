import path from 'path';
import fs from 'fs';
import { 
  saveFileRecord, 
  getFilesByPatientId, 
  getFileById, 
  deleteFileRecordAndDisk 
} from '../services/patientFilesService.js';

export const uploadPatientFile = async (req, res) => {
  const { category, description } = req.body;
  const patientId = req.user.patientId;

  if (!req.file) return res.status(400).json({ error: 'لم يتم رفع أي ملف' });
  if (!patientId) {
    // حذف الملف المرفوع إذا لم يتم التعرف على المريض
    fs.unlinkSync(req.file.path);
    return res.status(403).json({ error: 'المريض غير معروف' });
  }

  try {
    const saved = await saveFileRecord({
      patientId,
      file: req.file,
      category,
      description,
      createdById: req.user.id
    });
    
    console.log(`[AUDIT LOG] User ${req.user.id} (Role: ${req.user.role}) uploaded file ${saved.id} for patient ${patientId}`);
    
    res.status(201).json({ message: 'تم رفع الملف بنجاح', file: saved });
  } catch (err) {
    console.error(err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path); // تنظيف الملف إذا فشل الحفظ في قاعدة البيانات
    }
    res.status(500).json({ error: 'خطأ في حفظ الملف' });
  }
};

export const getPatientFiles = async (req, res) => {
  const patientId = req.user.patientId;
  if (!patientId) return res.status(403).json({ error: 'المريض غير معروف' });

  try {
    const files = await getFilesByPatientId(patientId);
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في جلب الملفات' });
  }
};

export const deletePatientFile = async (req, res) => {
  const patientId = req.user.patientId;
  if (!patientId) return res.status(403).json({ error: 'المريض غير معروف' });

  try {
    const file = await getFileById(req.params.id);

    if (!file) return res.status(404).json({ error: 'الملف غير موجود' });
    if (file.patientId !== parseInt(patientId)) {
      return res.status(403).json({ error: 'غير مصرح لك بحذف هذا الملف' });
    }

    await deleteFileRecordAndDisk(file);
    
    console.log(`[AUDIT LOG] User ${req.user.id} (Role: ${req.user.role}) deleted file ${file.id} for patient ${patientId}`);
    
    res.json({ message: 'تم حذف الملف بنجاح' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الحذف' });
  }
};

export const downloadPatientFile = async (req, res) => {
  try {
    const file = await getFileById(req.params.id);
    
    if (!file) return res.status(404).json({ error: 'الملف غير موجود' });
    
    // Authorization: Only the patient or Admin/Doctor can access
    const isOwner = req.user.role === 'PATIENT' && req.user.patientId === file.patientId;
    const isStaff = ['ADMIN', 'DOCTOR'].includes(req.user.role);
    
    if (!isOwner && !isStaff) {
      return res.status(403).json({ error: 'غير مصرح لك بتحميل هذا الملف' });
    }

    const fullPath = path.resolve(file.fileUrl.replace(/^\//, ''));
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'الملف الفعلي غير موجود على السيرفر' });
    }

    console.log(`[AUDIT LOG] User ${req.user.id} (Role: ${req.user.role}) downloaded file ${file.id}`);

    // إرسال الملف للتحميل
    res.download(fullPath, file.fileName);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في تحميل الملف' });
  }
};
