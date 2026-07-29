import express from 'express';
import { protect } from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// GET all global broadcast notifications (for bell persistence)
router.get('/broadcasts', async (req, res) => {
  try {
    const notifications = await Notification.find({ isGlobal: true })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a notification by id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH dismiss a notification for the current user
router.patch('/:id/dismiss', protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      $addToSet: { dismissedBy: req.user._id }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
