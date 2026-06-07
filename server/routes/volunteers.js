import express from 'express';
import { 
  registerAsVolunteer, 
  getAllVolunteers, 
  updateVolunteerStatus,
  getVolunteerMe,
  updateVolunteerSettings
} from '../controllers/volunteerController.js';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = express.Router();

router.post('/register', protect, registerAsVolunteer);
router.put('/status', protect, updateVolunteerStatus);
router.get('/me', protect, getVolunteerMe);
router.patch('/:id', protect, updateVolunteerSettings);
router.get('/', protect, admin, getAllVolunteers);

export default router;
