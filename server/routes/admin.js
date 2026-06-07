import express from 'express';
import { 
  getDashboardStats, 
  getAllUsers, 
  updateUserRole, 
  broadcastNotification, 
  exportIncidentsCSV,
  getAllVolunteersAdmin,
  approveVolunteer,
  rejectVolunteer
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { admin as adminMiddleware } from '../middleware/admin.js';

const router = express.Router();

// Apply protect and admin middleware to all admin routes
router.use(protect);
router.use(adminMiddleware);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/volunteers', getAllVolunteersAdmin);
router.patch('/volunteers/:id/approve', approveVolunteer);
router.patch('/volunteers/:id/reject', rejectVolunteer);
router.post('/broadcast', broadcastNotification);
router.get('/export/incidents', exportIncidentsCSV);

export default router;
