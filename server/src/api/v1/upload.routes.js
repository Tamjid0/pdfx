import express from 'express';
import { uploadFile, embedText, multerUpload } from '../../controllers/fileUploadController.js';

const router = express.Router();

router.post('/upload-document', multerUpload.single('file'), uploadFile);
router.post('/embed-text', embedText);

export default router;
