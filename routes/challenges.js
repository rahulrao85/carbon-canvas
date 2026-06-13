import { Router } from 'express';

const router = Router();

const challenges = [
  { id: 1, title: 'Meatless Week', description: 'Go vegetarian for 3 days this week', targetDays: 3, icon: '🥦' },
  { id: 2, title: 'Metro Rider', description: 'Take the metro instead of a cab 5 times', targetCount: 5, icon: '🚇' },
  { id: 3, title: 'No-AC Day', description: 'Survive one full day without AC', targetDays: 1, icon: '🌬️' },
  { id: 4, title: 'Budget Shopper', description: 'Buy nothing new for 7 days', targetDays: 7, icon: '♻️' },
  { id: 5, title: 'Cycle Commuter', description: 'Cycle to work/school 3 times', targetCount: 3, icon: '🚲' },
  { id: 6, title: 'Low-Energy Evening', description: 'Keep lights & fans off for 2 hours before bed', targetDays: 3, icon: '🕯️' },
];

router.get('/', (_req, res) => {
  res.json({ challenges });
});

router.post('/progress', (req, res) => {
  const { challengeId, progress } = req.body;

  if (!challengeId || progress == null) {
    return res.status(400).json({ error: 'Missing required fields: challengeId, progress' });
  }

  const challenge = challenges.find((c) => c.id === challengeId);
  if (!challenge) {
    return res.status(404).json({ error: `Challenge not found: ${challengeId}` });
  }

  const target = challenge.targetDays || challenge.targetCount;
  const completed = progress >= target;

  res.json({ challengeId, progress, target, completed });
});

export default router;
