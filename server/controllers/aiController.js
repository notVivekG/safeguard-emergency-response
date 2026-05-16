import { predictIncidentSeverity } from '../services/huggingface.js';

export const predictSeverity = async (req, res) => {
  try {
    const { description, type } = req.body;
    
    if (!description || !type) {
      return res.status(400).json({ message: 'Description and type are required' });
    }

    const prediction = await predictIncidentSeverity(description, type);
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
