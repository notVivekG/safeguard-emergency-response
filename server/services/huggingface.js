import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const predictIncidentSeverity = async (description, type) => {
  try {
    // using a zero-shot classification model from HF
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/bart-large-mnli',
      {
        inputs: `Incident type: ${type}. Description: ${description}`,
        parameters: {
          candidate_labels: ["low severity", "medium severity", "high severity"]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`
        }
      }
    );

    if (response.data && response.data.labels) {
      const bestLabel = response.data.labels[0];
      const bestScore = response.data.scores[0];

      let severity = 'low';
      if (bestLabel.includes('medium')) severity = 'medium';
      if (bestLabel.includes('high')) severity = 'high';

      return {
        severity,
        confidence: bestScore * 100,
        reasoning: `Predicted as ${severity} severity based on description analysis with ${Math.round(bestScore * 100)}% confidence.`
      };
    }
    
    return { severity: 'medium', confidence: 50, reasoning: 'Fallback due to unexpected API response' };
  } catch (error) {
    console.error('Hugging Face API Error:', error.response?.data || error.message);
    // Fallback if API fails
    return {
      severity: 'medium',
      confidence: 50,
      reasoning: 'Fallback prediction due to AI service unavailability.'
    };
  }
};
