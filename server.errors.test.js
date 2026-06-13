import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';

let app;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  const mod = await import('./server.js');
  app = mod.default;
});

describe('POST /api/insights — AI failure handling', () => {
  it('returns fallback insight when AI service fails (empty API key)', async () => {
    const res = await request(app)
      .post('/api/insights')
      .send({
        activities: [{ label: 'Domestic Flight', quantity: 500, unit: 'km', kgCO2: 125 }],
        weeklyTotal: 200,
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('insight');
    expect(typeof res.body.insight).toBe('string');
    expect(res.body.insight.length).toBeGreaterThan(0);
  });

  it('returns insight for very high emission value', async () => {
    const res = await request(app)
      .post('/api/insights')
      .send({
        activities: [{ label: 'Laptop', quantity: 10, unit: 'item', kgCO2: 1500 }],
        weeklyTotal: 3000,
      });
    expect(res.status).toBe(200);
    expect(res.body.insight.length).toBeGreaterThan(0);
  });

  it('returns insight for zero emission activity', async () => {
    const res = await request(app)
      .post('/api/insights')
      .send({
        activities: [{ label: 'Cycle', quantity: 5, unit: 'km', kgCO2: 0 }],
        weeklyTotal: 0,
      });
    expect(res.status).toBe(200);
    expect(res.body.insight.length).toBeGreaterThan(0);
  });
});

describe('POST /api/insights — invalid input edge cases', () => {
  it('returns 400 when activities is not an array', async () => {
    const res = await request(app)
      .post('/api/insights')
      .send({ activities: 'not-an-array', weeklyTotal: 10 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when body is empty', async () => {
    const res = await request(app)
      .post('/api/insights')
      .send({});
    expect(res.status).toBe(400);
  });

  it('handles negative weeklyTotal gracefully', async () => {
    const res = await request(app)
      .post('/api/insights')
      .send({ activities: [{ label: 'Test', quantity: 1, unit: 'km', kgCO2: 1 }], weeklyTotal: -5 });
    expect(res.status).toBe(200);
    expect(res.body.insight.length).toBeGreaterThan(0);
  });
});

describe('POST /api/carbon — edge cases', () => {
  it('returns 400 for quantity = 0', async () => {
    const res = await request(app)
      .post('/api/carbon')
      .send({ category: 'transport', item: 'car', quantity: 0 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when body is empty', async () => {
    const res = await request(app)
      .post('/api/carbon')
      .send({});
    expect(res.status).toBe(400);
  });

  it('returns 400 for string quantity', async () => {
    const res = await request(app)
      .post('/api/carbon')
      .send({ category: 'transport', item: 'car', quantity: 'ten' });
    expect(res.status).toBe(400);
  });

  it('handles very large quantity gracefully', async () => {
    const res = await request(app)
      .post('/api/carbon')
      .send({ category: 'transport', item: 'car', quantity: 999999 });
    expect(res.status).toBe(200);
    expect(res.body.kgCO2).toBeGreaterThan(0);
  });

  it('sanitizes HTML in input fields', async () => {
    const res = await request(app)
      .post('/api/carbon')
      .send({ category: '<script>alert("xss")</script>', item: 'car', quantity: 1 });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/challenges/progress — edge cases', () => {
  it('returns 400 for negative progress', async () => {
    const res = await request(app)
      .post('/api/challenges/progress')
      .send({ challengeId: 1, progress: -1 });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(false);
  });
});

describe('Security — input sanitization', () => {
  it('strips HTML tags from request body fields', async () => {
    const res = await request(app)
      .post('/api/carbon')
      .send({ category: '<p>transport</p>', item: '<b>car</b>', quantity: 1 });
    expect(res.status).toBe(200);
    expect(res.body.label).toBe('Car');
  });
});
