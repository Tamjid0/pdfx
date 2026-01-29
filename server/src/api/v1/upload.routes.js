import express from 'express';
import { uploadFile, embedText, multerUpload } from '../../controllers/fileUploadController.js';
import validate from '../../middleware/validate.js';
import { uploadSchema, embedTextSchema } from '../../validations/upload.validation.js';

const router = express.Router();

router.post('/upload-document', multerUpload.single('file'), validate(uploadSchema), uploadFile);
router.post('/embed-text', validate(embedTextSchema), embedText);

export default router;
