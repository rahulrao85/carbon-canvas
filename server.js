import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { PORT, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX, PAYLOAD_LIMIT } from './config/constants.js';
import carbonRoutes from './routes/carbon.js';
import insightsRoutes from './routes/insights.js';
import challengesRoutes from './routes/challenges.js';

const app = express();

app.use(helmet());
app.use(compression());
app.use(rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: process.env.NODE_ENV === 'test' ? 1000 : RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
}));
app.use(express.json({ limit: PAYLOAD_LIMIT }));

function sanitize(obj) {
  if (typeof obj === 'string') return obj.replace(/<[^>]*>/g, '');
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      obj[key] = sanitize(obj[key]);
    }
  }
  return obj;
}

app.use((req, _res, next) => {
  if (req.body) req.body = sanitize(req.body);
  next();
});

app.use(express.static('public', {
  maxAge: '1y',
  immutable: true,
}));

app.use('/api/carbon', carbonRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/challenges', challengesRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Carbon Canvas running on port ${PORT}`);
  });
}

export default app;
