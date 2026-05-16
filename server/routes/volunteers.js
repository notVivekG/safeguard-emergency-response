import express from 'express';
import { 
  registerAsVolunteer, 
  getAllVolunteers, 
  updateVolunteerStatus 
} from '../controllers/volunteerController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', protect, registerAsVolunteer);
router.put('/status', protect, updateVolunteerStatus);
router.get('/', protect, admin, getAllVolunteers);

export default router;
