import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';

let app;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  const mod = await import('./server.js');
  app = mod.default;
});

describe('GET /', () => {
  it('serves index.html', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });
});

describe('Security headers', () => {
  it('sets helmet security headers', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['x-xss-protection']).toBe('0');
  });
});

describe('Rate limiting', () => {
  it('sets rate limit headers', async () => {
    const res = await request(app).get('/');
    expect(res.headers['ratelimit-limit']).toBeDefined();
    expect(res.headers['ratelimit-remaining']).toBeDefined();
  });
});

describe('POST /api/carbon', () => {
  it('calculates carbon for valid transport input', async () => {
    const res = await request(app)
      .post('/api/carbon')
      .send({ category: 'transport', item: 'car', quantity: 10 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('kgCO2');
    expect(res.body.kgCO2).toBe(1.2);
    expect(res.body).toHaveProperty('label', 'Car');
  });

  it('calculates carbon for food input', async () => {
    const res = await request(app)
      .post('/api/carbon')
      .send({ category: 'food', item: 'chicken_meal', quantity: 2 });
    expect(res.status).toBe(200);
    expect(res.body.kgCO2).toBe(3.0);
  });

  it('returns 400 for missing fields', async () => {
    const res = await request(app)
      .post('/api/carbon')
      .send({ category: 'transport' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for invalid category', async () => {
    const res = await request(app)
      .post('/api/carbon')
      .send({ category: 'invalid', item: 'car', quantity: 1 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for negative quantity', async () => {
    const res = await request(app)
      .post('/api/carbon')
      .send({ category: 'transport', item: 'car', quantity: -5 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/carbon', () => {
  it('returns 404', async () => {
    const res = await request(app).get('/api/carbon');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/carbon/categories', () => {
  it('returns list of categories', async () => {
    const res = await request(app).get('/api/carbon/categories');
    expect(res.status).toBe(200);
    expect(res.body.categories).toContain('transport');
    expect(res.body.categories).toContain('food');
    expect(res.body.categories).toContain('energy');
    expect(res.body.categories).toContain('shopping');
  });
});

describe('GET /api/carbon/items/:category', () => {
  it('returns items for transport category', async () => {
    const res = await request(app).get('/api/carbon/items/transport');
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.items[0]).toHaveProperty('id');
    expect(res.body.items[0]).toHaveProperty('label');
  });

  it('returns 404 for unknown category', async () => {
    const res = await request(app).get('/api/carbon/items/unknown');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/insights', () => {
  it('generates an insight with valid input', async () => {
    const res = await request(app)
      .post('/api/insights')
      .send({
        activities: [{ label: 'Car', quantity: 10, unit: 'km', kgCO2: 1.2 }],
        weeklyTotal: 5.0,
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('insight');
    expect(typeof res.body.insight).toBe('string');
  });

  it('returns 400 for empty activities', async () => {
    const res = await request(app)
      .post('/api/insights')
      .send({ activities: [], weeklyTotal: 0 });
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing weeklyTotal', async () => {
    const res = await request(app)
      .post('/api/insights')
      .send({ activities: [{ label: 'Test', kgCO2: 1 }] });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/challenges', () => {
  it('returns list of challenges', async () => {
    const res = await request(app).get('/api/challenges');
    expect(res.status).toBe(200);
    expect(res.body.challenges.length).toBeGreaterThan(0);
    expect(res.body.challenges[0]).toHaveProperty('title');
    expect(res.body.challenges[0]).toHaveProperty('description');
  });
});

describe('POST /api/challenges/progress', () => {
  it('returns completed status when progress meets target', async () => {
    const res = await request(app)
      .post('/api/challenges/progress')
      .send({ challengeId: 1, progress: 5 });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it('returns not completed when progress is below target', async () => {
    const res = await request(app)
      .post('/api/challenges/progress')
      .send({ challengeId: 1, progress: 1 });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(false);
  });

  it('returns 400 for missing fields', async () => {
    const res = await request(app)
      .post('/api/challenges/progress')
      .send({});
    expect(res.status).toBe(400);
  });

  it('returns 404 for unknown challenge', async () => {
    const res = await request(app)
      .post('/api/challenges/progress')
      .send({ challengeId: 999, progress: 1 });
    expect(res.status).toBe(404);
  });
});

describe('404 handler', () => {
  it('returns JSON error for unknown API routes', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
