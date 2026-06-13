/**
 * @module storage
 * @fileoverview localStorage abstraction for activities, challenges, and theme.
 * All data is stored under prefixed keys (cc_*) to avoid collisions.
 */

const STORAGE_KEYS = {
  activities: 'cc_activities',
  challenges: 'cc_challenges',
  theme: 'cc_theme',
};

/**
 * Returns all logged activities from localStorage.
 * @returns {Array} Array of activity objects.
 */
export function getActivities() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.activities)) || [];
  } catch {
    return [];
  }
}

/**
 * Adds a new activity to the stored list.
 * @param {Object} activity - The activity to save (label, kgCO2, timestamp, etc).
 * @returns {Array} Updated full list of activities.
 */
export function addActivity(activity) {
  const activities = getActivities();
  activities.push(activity);
  localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(activities));
  return activities;
}

/**
 * Removes all stored activities.
 */
export function clearActivities() {
  localStorage.removeItem(STORAGE_KEYS.activities);
}

/**
 * Returns activities logged today (since midnight).
 * @returns {Array} Today's activity objects.
 */
export function getTodayActivities() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return getActivities().filter((a) => a.timestamp >= today.getTime());
}

/**
 * Returns activities from the last 7 days.
 * @returns {Array} Weekly activity objects.
 */
export function getWeekActivities() {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return getActivities().filter((a) => a.timestamp >= weekAgo);
}

/**
 * Calculates total CO2 for a filtered activity list.
 * @param {Array} activities - List of activity objects with kgCO2.
 * @returns {number} Sum of kgCO2 values.
 */
export function getTotalCO2(activities) {
  return activities.reduce((sum, a) => sum + (a.kgCO2 || 0), 0);
}

/**
 * Finds the category contributing the most CO2.
 * @param {Array} activities - List of activity objects.
 * @returns {Object|null} { category, kgCO2 } or null if empty.
 */
export function getTopSource(activities) {
  const groups = {};
  activities.forEach((a) => {
    groups[a.category] = (groups[a.category] || 0) + (a.kgCO2 || 0);
  });
  let top = null;
  let topVal = 0;
  for (const [cat, val] of Object.entries(groups)) {
    if (val > topVal) {
      top = cat;
      topVal = val;
    }
  }
  return top ? { category: top, kgCO2: topVal } : null;
}

/**
 * Returns the current consecutive-day streak.
 * @param {Array} activities - List of activity objects.
 * @returns {number} Number of consecutive days with at least one activity.
 */
export function getStreak(activities) {
  if (activities.length === 0) return 0;
  const dates = [...new Set(activities.map((a) => {
    const d = new Date(a.timestamp);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }))].sort().reverse();
  let streak = 0;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  let checkDate = new Date(today);
  for (let i = 0; i < dates.length; i++) {
    const expected = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
    if (dates[i] === expected) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return dates[0] === todayStr ? streak : 0;
}

/**
 * Returns saved challenge progress from localStorage.
 * @returns {Object} Map of challengeId → progress number.
 */
export function getChallengeProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.challenges)) || {};
  } catch {
    return {};
  }
}

/**
 * Updates progress for a specific challenge.
 * @param {number|string} challengeId - The challenge identifier.
 * @param {number} progress - Progress value (0 to target).
 * @returns {Object} Updated challenge progress map.
 */
export function updateChallengeProgress(challengeId, progress) {
  const data = getChallengeProgress();
  data[challengeId] = Math.max(progress, data[challengeId] || 0);
  localStorage.setItem(STORAGE_KEYS.challenges, JSON.stringify(data));
  return data;
}

/**
 * Returns the stored theme preference.
 * @returns {string} 'light' or 'dark'.
 */
export function getTheme() {
  return localStorage.getItem(STORAGE_KEYS.theme) || 'light';
}

/**
 * Persists the theme preference.
 * @param {string} theme - 'light' or 'dark'.
 */
export function setTheme(theme) {
  localStorage.setItem(STORAGE_KEYS.theme, theme);
}

export function getOnboardingDone() {
  return localStorage.getItem('cc_onboarding') === '1';
}

export function setOnboardingDone() {
  localStorage.setItem('cc_onboarding', '1');
}

export function getWeeklySnapshots() {
  try {
    return JSON.parse(localStorage.getItem('cc_snapshots')) || [];
  } catch {
    return [];
  }
}

export function saveWeeklySnapshot(co2) {
  const snapshots = getWeeklySnapshots();
  const day = new Date().getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date();
  monday.setDate(monday.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  const weekStart = monday.getTime();
  const entry = { weekStart, co2 };
  const idx = snapshots.findIndex(s => s.weekStart === weekStart);
  if (idx >= 0) snapshots[idx] = entry;
  else snapshots.push(entry);
  snapshots.sort((a, b) => b.weekStart - a.weekStart);
  localStorage.setItem('cc_snapshots', JSON.stringify(snapshots.slice(0, 8)));
  return snapshots;
}

export function getCategoryCounts() {
  const week = getWeekActivities();
  const counts = {};
  week.forEach(a => { counts[a.category] = (counts[a.category] || 0) + 1; });
  return counts;
}

export function getNudge() {
  const counts = getCategoryCounts();
  const entries = Object.entries(counts).filter(([, c]) => c >= 3);
  if (entries.length === 0) return null;
  const [cat] = entries.sort((a, b) => b[1] - a[1])[0];
  const tips = {
    transport: 'Try taking the metro or bus instead of driving. Switching could save up to 80% emissions on your commute.',
    food: 'Consider adding more plant-based meals to your week. A single vegetarian day saves ~8 kg CO₂.',
    energy: 'Unplug devices when not in use and switch to LED bulbs. Reducing AC by 1°C saves ~10% energy.',
    shopping: 'Try the 24-hour rule before buying non-essentials. Opt for second-hand or local products.',
  };
  return tips[cat] || null;
}
