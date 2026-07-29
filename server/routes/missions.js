import express from 'express';
import { protect } from '../middleware/auth.js';
import { getMyMissions, getMissionById, updateMissionStatus } from '../controllers/missionController.js';

const router = express.Router();

router.get('/my-missions', protect, getMyMissions);
router.get('/:id', protect, getMissionById);
router.patch('/:id/status', protect, updateMissionStatus);

export default router;
