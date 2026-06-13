import { OPENROUTER_API_KEY, OPENROUTER_MODEL, OPENROUTER_BASE_URL, AI_TIMEOUT } from '../config/constants.js';

const SYSTEM_PROMPT = `You are a carbon awareness assistant. Your job is to make emission data feel personal and emotional. Never lecture. Never use jargon like "kg CO₂e" without explaining it. Always use relatable comparisons in Indian context (rupees, local foods, common activities). Keep responses to 1-2 sentences. Be warm, not preachy. Examples of good responses:
- "This flight emitted as much CO₂ as running your AC for 3 months straight."
- "That's equivalent to charging your smartphone 8,000 times."
- "Switching to metro for this trip would have saved 80% of these emissions."`;

export async function generateInsight(activityData) {
  const { activity, kgCO2, weeklyTotal } = activityData;

  if (!OPENROUTER_API_KEY) {
    return fallbackInsight(kgCO2, activity);
  }

  const userPrompt = `A user just logged: "${activity.label}: ${activity.quantity} ${activity.unit}" which emitted ~${kgCO2} kg CO₂. Their weekly total is ${weeklyTotal} kg. Generate one short, relatable comparison that makes this real for them. Use Indian context.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT);

  try {
    const res = await fetch(OPENROUTER_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://carbon-canvas.app',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error('OpenRouter API error:', res.status, await res.text());
      return fallbackInsight(kgCO2, activity);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    return text || fallbackInsight(kgCO2, activity);
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('OpenRouter timeout');
    } else {
      console.error('OpenRouter fetch error:', err.message);
    }
    return fallbackInsight(kgCO2, activity);
  }
}

function fallbackInsight(kgCO2, activity) {
  const equivalents = [
    { threshold: 100, text: (n) => `That's equivalent to driving a car for ${Math.round(n / 0.12)} km.` },
    { threshold: 10, text: (n) => `That's like running your AC for ${Math.round(n / 0.5)} hours straight.` },
    { threshold: 1, text: (n) => `That's about the same as charging your phone ${Math.round(n / 0.005)} times.` },
    { threshold: 0, text: (n) => `Great choice — this activity had minimal carbon impact!` },
  ];

  const match = equivalents.find((e) => kgCO2 >= e.threshold);
  return match.text(kgCO2);
}
