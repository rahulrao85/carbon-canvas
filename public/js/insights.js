const insightContent = document.getElementById('insight-content');

function setInsightText(text) {
  insightContent.textContent = '';
  const p = document.createElement('p');
  p.textContent = text;
  insightContent.appendChild(p);
}

function setInsightPlaceholder(text) {
  insightContent.textContent = '';
  const p = document.createElement('p');
  p.className = 'insight-placeholder';
  p.textContent = text;
  insightContent.appendChild(p);
}

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

function getFallbackInsight(kgCO2) {
  if (kgCO2 >= 100) return `That's equivalent to driving a car for ${Math.round(kgCO2 / 0.12)} km.`;
  if (kgCO2 >= 10) return `That's like running your AC for ${Math.round(kgCO2 / 0.5)} hours straight.`;
  if (kgCO2 >= 1) return `That's about the same as charging your phone ${Math.round(kgCO2 / 0.005)} times.`;
  return 'Great choice — this activity had minimal carbon impact!';
}
