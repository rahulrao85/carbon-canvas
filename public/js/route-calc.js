/**
 * @module route-calc
 * @fileoverview Route carbon comparison tool. Compares 7 transport modes
 * for a given distance and shows the greenest option.
 */

const TRANSPORT_FACTORS = {
  car: { kgPerKm: 0.12, label: 'Car (Petrol)' },
  motorcycle: { kgPerKm: 0.05, label: 'Motorcycle' },
  bus: { kgPerKm: 0.03, label: 'Bus' },
  metro: { kgPerKm: 0.02, label: 'Metro/Train' },
  flight_domestic: { kgPerKm: 0.25, label: 'Domestic Flight' },
  cycle: { kgPerKm: 0, label: 'Cycle' },
  ev_car: { kgPerKm: 0.04, label: 'Electric Car' },
};

/**
 * Initialises the route comparison tool.
 * Listens for clicks on the calculate button, computes emissions
 * for all transport modes, and renders a sorted comparison table.
 */
export function initRouteCalculator() {
  const from = document.getElementById('route-from');
  const to = document.getElementById('route-to');
  const distance = document.getElementById('route-distance');
  const btn = document.getElementById('route-calculate');
  const results = document.getElementById('route-results');

  btn.addEventListener('click', () => {
    const dist = parseFloat(distance.value);
    if (!dist || dist <= 0) {
      results.innerHTML = '<p class="form-error" role="alert">Please enter a valid distance.</p>';
      return;
    }

    const fromText = from.value.trim() || 'your location';
    const toText = to.value.trim() || 'destination';

    const entries = Object.entries(TRANSPORT_FACTORS)
      .map(([key, mode]) => ({
        id: key,
        label: mode.label,
        kgCO2: +(mode.kgPerKm * dist).toFixed(1),
        kgPerKm: mode.kgPerKm,
      }))
      .sort((a, b) => a.kgCO2 - b.kgCO2);

    const lowest = entries[0];
    const html = `<h3 class="route-heading">${escapeHtml(fromText)} → ${escapeHtml(toText)} (${dist} km)</h3>
<table class="route-table" role="table" aria-label="Carbon comparison by transport mode">
<thead>
<tr>
<th scope="col">Mode</th>
<th scope="col">kg CO₂</th>
<th scope="col">vs Best</th>
</tr>
</thead>
<tbody>
${entries.map((e) => {
  const isBest = e.id === lowest.id;
  let vs;
  if (isBest) {
    vs = '✅ Best';
  } else if (lowest.kgCO2 === 0) {
    vs = `+${Math.round(e.kgCO2)} kg`;
  } else {
    vs = `+${Math.round((e.kgCO2 / lowest.kgCO2 - 1) * 100)}%`;
  }
  return `<tr class="${isBest ? 'route-best' : ''}">
<td>${e.label}</td>
<td><strong>${e.kgCO2}</strong></td>
<td>${vs}</td>
</tr>`;
}).join('')}
</tbody>
</table>
<p class="route-footnote">${lowest.label} is the lowest-carbon option for this trip.</p>`;
    results.innerHTML = html;
  });
}

/**
 * Escapes HTML in user-provided text to prevent XSS.
 * @param {string} str - Raw user input.
 * @returns {string} Safe HTML string.
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
