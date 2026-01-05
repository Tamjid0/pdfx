import express from 'express';
import { uploadFile, multerUpload } from '../controllers/fileUploadController.js';

const router = express.Router();

router.post('/upload-document', multerUpload.single('file'), uploadFile);

export default router;
