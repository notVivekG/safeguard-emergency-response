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

router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

router.route('/profile')
  .get(protect, getProfile)
  .patch(protect, updateProfile);

router.post('/sos', protect, triggerSOS);
router.get('/reports', protect, getUserReports);
router.post('/contacts', protect, saveEmergencyContact);

export default router;
