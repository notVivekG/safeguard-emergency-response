import express from 'express';
import { 
  getDashboardStats, 
  getAllUsers, 
  updateUserRole, 
  broadcastNotification, 
  exportIncidentsCSV 
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';
import { admin as adminMiddleware } from '../middleware/admin.js';

const router = express.Router();

// Apply protect and admin middleware to all admin routes
router.use(protect);
router.use(adminMiddleware);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.post('/broadcast', broadcastNotification);
router.get('/export/incidents', exportIncidentsCSV);

export default router;
