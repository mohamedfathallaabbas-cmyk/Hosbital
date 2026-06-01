import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../index.js';

import crypto from 'crypto';

export const calculateFileHash = async (filePath) => {
  const fileBuffer = await fs.readFile(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
};

export const checkDuplicateFile = async (patientId, fileHash) => {
  return await prisma.patientFile.findFirst({
    where: { patientId: parseInt(patientId), fileHash }
  });
};

export const saveFileRecord = async ({ patientId, file, fileHash, category, description, createdById }) => {
  const ext = path.extname(file.originalname).replace('.', '').toLowerCase();
  
  return await prisma.patientFile.create({
    data: {
      patientId: parseInt(patientId),
      fileName: file.originalname,
      fileType: ext,
      fileUrl: `/uploads/${file.filename}`,
      fileSize: file.size,
      fileHash,
      category: category || 'OTHER',
      description: description || null,
      createdById: parseInt(createdById)
    }
  });
};

export const getFilesByPatientId = async (patientId) => {
  return await prisma.patientFile.findMany({
    where: { patientId: parseInt(patientId) },
    orderBy: { uploadedAt: 'desc' }
  });
};

export const getFileById = async (fileId) => {
  return await prisma.patientFile.findUnique({
    where: { id: parseInt(fileId) }
  });
};

export const deleteFileRecordAndDisk = async (file) => {
  // 1. Delete from disk
  const fullPath = path.resolve(file.fileUrl.replace(/^\//, ''));
  try {
    await fs.unlink(fullPath);
  } catch (error) {
    if (error.code !== 'ENOENT') { // ENOENT means file doesn't exist, we can still delete the DB record
      throw new Error('فشل حذف الملف من السيرفر');
    }
  }

  // 2. Delete from database
  await prisma.patientFile.delete({
    where: { id: file.id }
  });
};
