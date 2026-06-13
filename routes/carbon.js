/**
 * @module routes/carbon
 * @fileoverview Carbon calculation endpoints. POST /api/carbon calculates
 * CO₂ emissions for a given activity. GET /api/carbon/categories and
 * /api/carbon/items/:category return available options.
 */
import { Router } from 'express';
import { getEmission, getItems } from '../services/emission-factors.js';

const router = Router();

/** Returns the list of activity categories. */
router.get('/categories', (_req, res) => {
  res.json({ categories: ['transport', 'food', 'energy', 'shopping'] });
});

/** Returns items for a given category. @param {string} req.params.category */
router.get('/items/:category', (req, res) => {
  const items = getItems(req.params.category);
  if (!items.length) {
    return res.status(404).json({ error: `Unknown category: ${req.params.category}` });
  }
  res.json({ category: req.params.category, items });
});

/**
 * Calculates CO₂ emissions for a logged activity.
 * @param {Object} req.body - { category, item, quantity }
 */
router.post('/', (req, res) => {
  const { category, item, quantity } = req.body;

  if (!category || !item || quantity === null || quantity === undefined) {
    return res.status(400).json({ error: 'Missing required fields: category, item, quantity' });
  }

  if (typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({ error: 'Quantity must be a positive number' });
  }

  const result = getEmission(category, item, quantity);
  if (!result) {
    return res.status(400).json({ error: `Invalid category/item combination: ${category}/${item}` });
  }

  res.json(result);
});

export default router;
