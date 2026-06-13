/**
 * @module services/emission-factors
 * @fileoverview Carbon emission factors for all tracked activities.
 */

const factors = {
  transport: {
    car: { kgPerUnit: 0.12, unit: 'km', label: 'Car' },
    motorcycle: { kgPerUnit: 0.05, unit: 'km', label: 'Motorcycle' },
    bus: { kgPerUnit: 0.03, unit: 'km', label: 'Bus' },
    metro: { kgPerUnit: 0.02, unit: 'km', label: 'Metro/Train' },
    flight_domestic: { kgPerUnit: 0.25, unit: 'km', label: 'Domestic Flight' },
    flight_international: { kgPerUnit: 0.20, unit: 'km', label: 'International Flight' },
    cycle: { kgPerUnit: 0, unit: 'km', label: 'Cycle' },
    walk: { kgPerUnit: 0, unit: 'km', label: 'Walking' },
  },
  food: {
    veg_meal: { kgPerUnit: 0.5, unit: 'meal', label: 'Vegetarian Meal' },
    vegan_meal: { kgPerUnit: 0.3, unit: 'meal', label: 'Vegan Meal' },
    chicken_meal: { kgPerUnit: 1.5, unit: 'meal', label: 'Chicken Meal' },
    mutton_meal: { kgPerUnit: 3.0, unit: 'meal', label: 'Mutton/Beef Meal' },
    dairy_heavy: { kgPerUnit: 1.0, unit: 'meal', label: 'Dairy-Heavy Meal' },
  },
  energy: {
    ac: { kgPerUnit: 0.5, unit: 'hour', label: 'Air Conditioner' },
    heater: { kgPerUnit: 0.8, unit: 'hour', label: 'Room Heater' },
    fan: { kgPerUnit: 0.05, unit: 'hour', label: 'Fan' },
    washing_machine: { kgPerUnit: 0.2, unit: 'load', label: 'Washing Machine' },
    fridge: { kgPerUnit: 1.0, unit: 'day', label: 'Refrigerator' },
  },
  shopping: {
    tshirt: { kgPerUnit: 5, unit: 'item', label: 'T-shirt' },
    jeans: { kgPerUnit: 15, unit: 'item', label: 'Jeans' },
    smartphone: { kgPerUnit: 50, unit: 'item', label: 'Smartphone' },
    laptop: { kgPerUnit: 150, unit: 'item', label: 'Laptop' },
    furniture: { kgPerUnit: 30, unit: 'item', label: 'Small Furniture' },
    books: { kgPerUnit: 0.5, unit: 'book', label: 'Books' },
  },
};

/**
 * Calculates CO2 emissions for a given activity.
 * @param {string} category - Activity category (transport, food, energy, shopping).
 * @param {string} item - Specific item ID within the category.
 * @param {number} quantity - Number of units.
 * @returns {Object|null} { kgCO2, label, unit, quantity } or null if invalid.
 */
export function getEmission(category, item, quantity) {
  const cat = factors[category];
  if (!cat) return null;
  const factor = cat[item];
  if (!factor) return null;
  return {
    kgCO2: +(factor.kgPerUnit * quantity).toFixed(2),
    label: factor.label,
    unit: factor.unit,
    quantity,
  };
}

/**
 * Returns all available category names.
 * @returns {string[]} Array of category keys (transport, food, energy, shopping).
 */
export function getCategories() {
  return Object.keys(factors);
}

/**
 * Returns items for a given category.
 * @param {string} category - The category to look up.
 * @returns {Array} Array of { id, label, unit } objects. Empty if category not found.
 */
export function getItems(category) {
  const cat = factors[category];
  if (!cat) return [];
  return Object.entries(cat).map(([key, val]) => ({
    id: key,
    label: val.label,
    unit: val.unit,
  }));
}
