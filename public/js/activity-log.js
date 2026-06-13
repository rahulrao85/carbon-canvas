const CATEGORY_ITEMS = {
  transport: [
    { id: 'car', label: 'Car', unit: 'km' },
    { id: 'motorcycle', label: 'Motorcycle', unit: 'km' },
    { id: 'bus', label: 'Bus', unit: 'km' },
    { id: 'metro', label: 'Metro/Train', unit: 'km' },
    { id: 'flight_domestic', label: 'Domestic Flight', unit: 'km' },
    { id: 'flight_international', label: 'International Flight', unit: 'km' },
    { id: 'cycle', label: 'Cycle', unit: 'km' },
    { id: 'walk', label: 'Walking', unit: 'km' },
  ],
  food: [
    { id: 'veg_meal', label: 'Vegetarian Meal', unit: 'meal' },
    { id: 'vegan_meal', label: 'Vegan Meal', unit: 'meal' },
    { id: 'chicken_meal', label: 'Chicken Meal', unit: 'meal' },
    { id: 'mutton_meal', label: 'Mutton/Beef Meal', unit: 'meal' },
    { id: 'dairy_heavy', label: 'Dairy-Heavy Meal', unit: 'meal' },
  ],
  energy: [
    { id: 'ac', label: 'Air Conditioner', unit: 'hour' },
    { id: 'heater', label: 'Room Heater', unit: 'hour' },
    { id: 'fan', label: 'Fan', unit: 'hour' },
    { id: 'washing_machine', label: 'Washing Machine', unit: 'load' },
    { id: 'fridge', label: 'Refrigerator', unit: 'day' },
  ],
  shopping: [
    { id: 'tshirt', label: 'T-shirt', unit: 'item' },
    { id: 'jeans', label: 'Jeans', unit: 'item' },
    { id: 'smartphone', label: 'Smartphone', unit: 'item' },
    { id: 'laptop', label: 'Laptop', unit: 'item' },
    { id: 'furniture', label: 'Small Furniture', unit: 'item' },
    { id: 'books', label: 'Books (per 10)', unit: 'set' },
  ],
};

let onActivityLogged = null;

export function initActivityLog(callback) {
  onActivityLogged = callback;

  const catSelect = document.getElementById('category');
  const itemSelect = document.getElementById('item');
  const unitLabel = document.getElementById('unit-label');
  const form = document.getElementById('activity-form');
  const errorEl = document.getElementById('form-error');

  function resetItems(defaultText) {
    itemSelect.textContent = '';
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = defaultText;
    itemSelect.appendChild(opt);
  }

  catSelect.addEventListener('change', () => {
    const cat = catSelect.value;
    resetItems('Select activity');
    itemSelect.disabled = !cat;
    if (cat && CATEGORY_ITEMS[cat]) {
      CATEGORY_ITEMS[cat].forEach((it) => {
        const opt = document.createElement('option');
        opt.value = it.id;
        opt.textContent = it.label;
        itemSelect.appendChild(opt);
      });
    }
    unitLabel.textContent = cat ? (CATEGORY_ITEMS[cat]?.[0]?.unit || 'units') : 'units';
  });

  itemSelect.addEventListener('change', () => {
    const cat = catSelect.value;
    const itemId = itemSelect.value;
    if (cat && itemId) {
      const item = CATEGORY_ITEMS[cat]?.find((i) => i.id === itemId);
      if (item) unitLabel.textContent = item.unit;
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';

    const category = catSelect.value;
    const item = itemSelect.value;
    const quantity = parseFloat(document.getElementById('quantity').value);

    if (!category) { errorEl.textContent = 'Please select a category.'; return; }
    if (!item) { errorEl.textContent = 'Please select an activity.'; return; }
    if (!quantity || quantity <= 0) { errorEl.textContent = 'Please enter a valid quantity.'; return; }

    try {
      const res = await fetch('/api/carbon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, item, quantity }),
      });

      if (!res.ok) {
        const data = await res.json();
        errorEl.textContent = data.error || 'Failed to calculate carbon footprint.';
        return;
      }

      const data = await res.json();
      const activity = {
        id: Date.now(),
        category,
        item,
        label: data.label,
        quantity,
        unit: data.unit,
        kgCO2: data.kgCO2,
        timestamp: Date.now(),
      };

      if (onActivityLogged) onActivityLogged(activity);

      form.reset();
      resetItems('Select activity');
      itemSelect.disabled = true;
      catSelect.focus();
    } catch (err) {
      errorEl.textContent = 'Network error. Please try again.';
    }
  });
}
