/**
 * @module routes/insights
 * @fileoverview AI-powered insight generation endpoint. POST /api/insights
 * accepts an activities array and weeklyTotal, returns a short relatable
 * comparison in Indian context.
 */
import { Router } from 'express';
import { generateInsight } from '../services/ai.js';

const router = Router();

/**
 * Generates an AI insight for the latest activity.
 * @param {Object} req.body - { activities, weeklyTotal }
 */
router.post('/', async (req, res) => {
  const { activities, weeklyTotal } = req.body;

  if (!activities || !Array.isArray(activities) || activities.length === 0) {
    return res.status(400).json({ error: 'Activities array is required and must not be empty' });
  }

  if (weeklyTotal === null || weeklyTotal === undefined || typeof weeklyTotal !== 'number') {
    return res.status(400).json({ error: 'Weekly total must be a number' });
  }

  try {
    const latest = activities[activities.length - 1];
    const insight = await generateInsight({
      activity: latest,
      kgCO2: latest.kgCO2 || 0,
      weeklyTotal,
    });

    res.json({ insight });
  } catch (err) {
    console.error('Insight generation error:', err.message);
    res.status(500).json({ error: 'Failed to generate insight' });
  }
});

export default router;
