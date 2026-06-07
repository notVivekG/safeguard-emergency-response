import express from 'express';
import { sendSOS, getSOSAlerts, resolveSOS, assignVolunteersToSOS } from '../controllers/sosController.js';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = express.Router();

router.post('/', protect, sendSOS);
router.get('/', protect, admin, getSOSAlerts);
router.patch('/:id/resolve', protect, admin, resolveSOS);
router.patch('/:id/assign', protect, admin, assignVolunteersToSOS);

export default router;
