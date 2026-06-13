/**
 * @module insights
 * @fileoverview Handles AI-powered insight display. Fetches from /api/insights
 * and falls back to hardcoded equivalences on failure.
 */

let insightContent;
if (typeof document !== 'undefined') {
  insightContent = document.getElementById('insight-content');
}

/** Sets the insight container to show a result. @param {string} text */
function setInsightText(text) {
  insightContent.textContent = '';
  const p = document.createElement('p');
  p.textContent = text;
  insightContent.appendChild(p);
}

/** Sets the insight container to show a placeholder. @param {string} text */
function setInsightPlaceholder(text) {
  insightContent.textContent = '';
  const p = document.createElement('p');
  p.className = 'insight-placeholder';
  p.textContent = text;
  insightContent.appendChild(p);
}

/**
 * Fetches an AI insight for the given activity and weekly total.
 * Falls back to hardcoded text on network or server error.
 * @param {Object} activity - The most recently logged activity.
 * @param {number} weeklyTotal - Total CO2 for the current week in kg.
 */
export async function fetchInsight(activity, weeklyTotal) {
  setInsightPlaceholder('Generating insight...');

  try {
    const res = await fetch('/api/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activities: [activity],
        weeklyTotal,
      }),
    });

    if (!res.ok) {
      setInsightText(getFallbackInsight(activity.kgCO2));
      return;
    }

    const data = await res.json();
    setInsightText(data.insight);
  } catch {
    setInsightText(getFallbackInsight(activity.kgCO2));
  }
}

/**
 * Generates a hardcoded equivalence based on CO2 amount.
 * @param {number} kgCO2 - CO2 in kg.
 * @returns {string} Human-readable comparison string.
 */
function getFallbackInsight(kgCO2) {
  if (kgCO2 >= 100) return `That's equivalent to driving a car for ${Math.round(kgCO2 / 0.12)} km.`;
  if (kgCO2 >= 10) return `That's like running your AC for ${Math.round(kgCO2 / 0.5)} hours straight.`;
  if (kgCO2 >= 1) return `That's about the same as charging your phone ${Math.round(kgCO2 / 0.005)} times.`;
  return 'Great choice — this activity had minimal carbon impact!';
}
