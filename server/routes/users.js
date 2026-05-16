import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  triggerSOS, 
  getUserReports,
  saveEmergencyContact 
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.post('/sos', protect, triggerSOS);
router.get('/reports', protect, getUserReports);
router.post('/contacts', protect, saveEmergencyContact);

export default router;
