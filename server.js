/**
 * @module server
 * @fileoverview Express application entry point for Carbon Canvas.
 * Configures security middleware, input sanitization, static file
 * serving, and API route mounting.
 */
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { PORT, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX, PAYLOAD_LIMIT } from './config/constants.js';
import carbonRoutes from './routes/carbon.js';
import insightsRoutes from './routes/insights.js';
import challengesRoutes from './routes/challenges.js';

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'https://openrouter.ai'],
      fontSrc: ["'self'"],
    },
  },
}));
app.use(compression());
app.use(rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: process.env.NODE_ENV === 'test' ? 1000 : RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
}));
app.use(express.json({ limit: PAYLOAD_LIMIT }));

/**
 * Recursively sanitize an object by stripping HTML tags.
 * Prevents XSS injection in request body fields.
 * @param {*} obj - The value to sanitize.
 * @returns {*} The sanitized value.
 */
function sanitize(obj) {
  if (typeof obj === 'string') {
    return obj
      .replace(/<[^>]*>/g, '')
      .replace(/javascript\s*:/gi, '')
      .replace(/vbscript\s*:/gi, '')
      .replace(/data\s*:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/&#x?\d+;|\\u00[0-9a-f]{2}/gi, '');
  }
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

app.get('/', (_req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile('index.html', { root: 'public' });
});

app.use(express.static('public', {
  maxAge: '1y',
  immutable: true,
  etag: true,
  lastModified: true,
}));

app.use('/api/carbon', carbonRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/challenges', challengesRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.message);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Carbon Canvas running on port ${PORT}`);
  });
}

export default app;
