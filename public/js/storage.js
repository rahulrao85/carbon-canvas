const STORAGE_KEYS = {
  activities: 'cc_activities',
  challenges: 'cc_challenges',
  theme: 'cc_theme',
};

export function getActivities() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.activities)) || [];
  } catch {
    return [];
  }
}

export function addActivity(activity) {
  const activities = getActivities();
  activities.push(activity);
  localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(activities));
  return activities;
}

export function clearActivities() {
  localStorage.removeItem(STORAGE_KEYS.activities);
}

export function getTodayActivities() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return getActivities().filter((a) => a.timestamp >= today.getTime());
}

export function getWeekActivities() {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return getActivities().filter((a) => a.timestamp >= weekAgo);
}

export function getTotalCO2(activities) {
  return activities.reduce((sum, a) => sum + (a.kgCO2 || 0), 0);
}

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

export function getChallengeProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.challenges)) || {};
  } catch {
    return {};
  }
}

export function updateChallengeProgress(challengeId, progress) {
  const data = getChallengeProgress();
  data[challengeId] = Math.max(progress, data[challengeId] || 0);
  localStorage.setItem(STORAGE_KEYS.challenges, JSON.stringify(data));
  return data;
}

export function getTheme() {
  return localStorage.getItem(STORAGE_KEYS.theme) || 'light';
}

export function setTheme(theme) {
  localStorage.setItem(STORAGE_KEYS.theme, theme);
}
