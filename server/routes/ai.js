import express from 'express';
import { predictSeverity } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/predict-severity', protect, predictSeverity);

export default router;
