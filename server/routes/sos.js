import express from 'express';
import {
  sendSOS,
  getSOSAlerts,
  resolveSOS,
  assignVolunteersToSOS,
  clearSOS,
  bulkClearSOS,
  deleteSOS,
  updateVolunteerStatus,
  getMissionBySOS,
  updateVolunteerLocation
} from '../controllers/sosController.js';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = express.Router();

router.post('/', protect, sendSOS);
router.get('/', protect, admin, getSOSAlerts);
router.patch('/:id/resolve', protect, admin, resolveSOS);
router.patch('/:id/assign', protect, admin, assignVolunteersToSOS);
router.patch('/:id/clear', protect, admin, clearSOS);
router.patch('/:id/bulk-clear', protect, admin, bulkClearSOS);
router.delete('/:id', protect, admin, deleteSOS);
router.patch('/:id/volunteer-status', protect, updateVolunteerStatus);
router.get('/:id/mission', protect, getMissionBySOS);
router.post('/:id/location-update', protect, updateVolunteerLocation);

export default router;
