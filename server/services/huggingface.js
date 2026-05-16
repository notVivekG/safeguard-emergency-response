export const predictSeverity = async (description, type) => {
  try {
    const text = `${description} ${type}`.toLowerCase();

    const highKeywords = ['fire','explosion','collapse','flood','tsunami','earthquake','critical','emergency','death','fatality','trapped','severe','massive','destroyed','evacuate','gas leak','multiple casualties'];
    const mediumKeywords = ['accident','injury','injured','damage','blocked','stuck','smoke','spreading','moderate','significant','several','medical','ambulance','rescue'];
    const lowKeywords = ['minor','small','contained','controlled','minimal','slight','low','resolved','single','isolated'];

    let highScore = 0, mediumScore = 0, lowScore = 0;

    highKeywords.forEach(k => { if (text.includes(k)) highScore++; });
    mediumKeywords.forEach(k => { if (text.includes(k)) mediumScore++; });
    lowKeywords.forEach(k => { if (text.includes(k)) lowScore++; });

    const typeBoost = {
      fire: 'high', flood: 'high', earthquake: 'high',
      accident: 'medium', medical: 'medium',
      other: 'low'
    };

    let severity, confidence, reasoning;

    if (highScore >= mediumScore && highScore >= lowScore && highScore > 0) {
      severity = 'high';
      confidence = Math.min(95, 60 + highScore * 8);
      reasoning = `Detected ${highScore} high-severity indicator(s) in the description.`;
    } else if (mediumScore >= lowScore && mediumScore > 0) {
      severity = 'medium';
      confidence = Math.min(90, 55 + mediumScore * 7);
      reasoning = `Detected ${mediumScore} medium-severity indicator(s) in the description.`;
    } else if (lowScore > 0) {
      severity = 'low';
      confidence = Math.min(85, 50 + lowScore * 6);
      reasoning = `Detected ${lowScore} low-severity indicator(s) in the description.`;
    } else {
      severity = typeBoost[type] || 'medium';
      confidence = 60;
      reasoning = `No specific keywords found. Predicted based on incident type: ${type}.`;
    }

    return { severity, confidence, reasoning };

  } catch (error) {
    return { severity: 'medium', confidence: 50, reasoning: 'Fallback prediction.' };
  }
};
