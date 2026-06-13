import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
let app;
beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  const mod = await import('./server.js');
  app = mod.default;
});
describe('GET / and basic server capabilities', () => {
  it('serves index.html with compression, security, and rate limit headers', async () => {
    const res = await request(app).get('/').set('Accept-Encoding', 'gzip');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['x-xss-protection']).toBe('0');
    expect(res.headers['ratelimit-limit']).toBeDefined();
    expect(res.headers['ratelimit-remaining']).toBeDefined();
  });
});
describe('POST /api/carbon', () => {
  it('calculates carbon for valid inputs', async () => {
    const res1 = await request(app)
      .post('/api/carbon')
      .send({ category: 'transport', item: 'car', quantity: 10 });
    expect(res1.status).toBe(200);
    expect(res1.body.kgCO2).toBe(1.2);
    expect(res1.body.label).toBe('Car');

    const res2 = await request(app)
      .post('/api/carbon')
      .send({ category: 'food', item: 'chicken_meal', quantity: 2 });
    expect(res2.status).toBe(200);
    expect(res2.body.kgCO2).toBe(3.0);
  });
  it('returns 400 for invalid carbon requests', async () => {
    for (const payload of [
      { category: 'transport' },
      { category: 'invalid', item: 'car', quantity: 1 },
      { category: 'transport', item: 'car', quantity: -5 }
    ]) {
      const res = await request(app).post('/api/carbon').send(payload);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    }
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
    const res = await request(app).post('/api/insights').send({ activities: [{ label: 'Test', kgCO2: 1 }] });
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
  it('handles progress validation and completion correctly', async () => {
    const res1 = await request(app).post('/api/challenges/progress').send({ challengeId: 1, progress: 5 });
    expect(res1.status).toBe(200);
    expect(res1.body.completed).toBe(true);

    const res2 = await request(app).post('/api/challenges/progress').send({ challengeId: 1, progress: 1 });
    expect(res2.status).toBe(200);
    expect(res2.body.completed).toBe(false);

    const res3 = await request(app).post('/api/challenges/progress').send({});
    expect(res3.status).toBe(400);

    const res4 = await request(app).post('/api/challenges/progress').send({ challengeId: 999, progress: 1 });
    expect(res4.status).toBe(404);
  });
});
describe('404 handler', () => {
  it('returns JSON error for unknown API routes', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
describe('Request body limits', () => {
  it('rejects payloads exceeding 16kb', async () => {
    const large = 'x'.repeat(20000);
    const res = await request(app)
      .post('/api/carbon')
      .send({ category: large, item: 'car', quantity: 1 });
    expect(res.status).toBe(413);
  });
});
describe('Static file serving', () => {
  it('serves CSS/JS files with immutable cache headers', async () => {
    const cssRes = await request(app).get('/css/tokens.css');
    expect(cssRes.status).toBe(200);
    expect(cssRes.headers['content-type']).toMatch(/css/);
    expect(cssRes.headers['cache-control']).toMatch(/max-age/);

    const jsRes = await request(app).get('/js/app.js');
    expect(jsRes.status).toBe(200);
  });
});
describe('Method validation', () => {
  it('returns 404 for POST /api/carbon/categories', async () => {
    const res = await request(app).post('/api/carbon/categories');
    expect(res.status).toBe(404);
  });
});
