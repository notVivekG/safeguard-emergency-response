import express from 'express';
import { 
  createIncident, 
  getAllIncidents, 
  getIncidentById, 
  updateIncident, 
  deleteIncident, 
  getNearbyIncidents,
  upvoteIncident
} from '../controllers/incidentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, createIncident)
  .get(getAllIncidents);

router.get('/nearby', getNearbyIncidents);

router.route('/:id')
  .get(getIncidentById)
  .put(protect, updateIncident)
  .delete(protect, deleteIncident);

router.post('/:id/upvote', protect, upvoteIncident);

export default router;
