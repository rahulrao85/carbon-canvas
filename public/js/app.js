/**
 * @module app
 * @fileoverview Main application entry point. Initialises all UI components,
 * manages tabs, dashboard updates, and coordinate activity logging,
 * garden rendering, and AI insight fetch.
 */
import { addActivity, getActivities, getTodayActivities, getWeekActivities, getTotalCO2, getTopSource, getStreak, getTheme, setTheme, getOnboardingDone, setOnboardingDone, saveWeeklySnapshot, getWeeklySnapshots, getNudge } from './storage.js';
import { initActivityLog } from './activity-log.js';
import { renderGarden } from './world-render.js';
import { fetchInsight } from './insights.js';
import { initRouteCalculator } from './route-calc.js';

/**
 * Updates the dashboard stat cards (today/week CO₂, top source, streak).
 */
function updateDashboard() {
  const today = getTodayActivities();
  const week = getWeekActivities();
  const all = getActivities();
  const todayCO2 = getTotalCO2(today);
  const weekCO2 = getTotalCO2(week);
  const top = getTopSource(week);
  const streak = getStreak(all);

  document.getElementById('today-co2').textContent = `${todayCO2.toFixed(1)} kg CO₂`;
  document.getElementById('week-co2').textContent = `${weekCO2.toFixed(1)} kg CO₂`;

  if (top) {
    document.getElementById('top-source').textContent = top.category.charAt(0).toUpperCase() + top.category.slice(1);
    document.getElementById('top-source-hint').textContent = `${top.kgCO2.toFixed(1)} kg CO₂ this week`;
  }

  document.getElementById('streak-count').textContent = `🔥 ${streak} day${streak !== 1 ? 's' : ''}`;
  document.getElementById('streak-hint').textContent = streak > 0 ? 'Keep it going!' : 'Log daily to build your streak.';

  showNudge(week);
  updateComparison();
}

/**
 * Re-renders the garden canvas with today's carbon level.
 */
function updateWorld() {
  const today = getTodayActivities();
  const todayCO2 = getTotalCO2(today);
  const streak = getStreak(getActivities());
  renderGarden(todayCO2, streak);
}

/**
 * Fetches and displays an AI insight for the given activity.
 * @param {Object} activity - The most recently logged activity.
 */
function updateInsights(activity) {
  const week = getWeekActivities();
  const weeklyTotal = getTotalCO2(week);
  fetchInsight(activity, weeklyTotal);
}

/**
 * Called when a new activity is logged. Persists it, updates the UI,
 * and switches to the log tab.
 * @param {Object} activity - The activity to save.
 */
function onActivityLogged(activity) {
  addActivity(activity);
  saveWeeklySnapshot(getTotalCO2(getWeekActivities()));
  updateWorld();
  updateDashboard();
  updateInsights(activity);
  switchTab('log');
  document.getElementById('today-insight').textContent = `${activity.label}: ${activity.kgCO2} kg CO₂ logged`;
  document.getElementById('week-equivalent').textContent = `${getWeekActivities().length} activities this week (${getTotalCO2(getWeekActivities()).toFixed(1)} kg total)`;
}

/**
 * Switches the active tab and updates ARIA attributes.
 * @param {string} tabId - The id of the tab to activate.
 */
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach((el) => el.classList.remove('active'));
  document.querySelectorAll('.tab').forEach((el) => {
    el.classList.remove('active');
    el.setAttribute('aria-selected', 'false');
    el.removeAttribute('aria-current');
  });
  document.getElementById(tabId).classList.add('active');
  const tabBtn = document.querySelector(`.tab[data-tab="${tabId}"]`);
  if (tabBtn) {
    tabBtn.classList.add('active');
    tabBtn.setAttribute('aria-selected', 'true');
    tabBtn.setAttribute('aria-current', 'page');
  }
}

/**
 * Initialises the dark/light theme toggle and applies the saved preference.
 */
function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  const current = getTheme();
  document.documentElement.setAttribute('data-theme', current);
  toggle.textContent = current === 'dark' ? '☀️' : '🌙';

  toggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    setTheme(next);
    toggle.textContent = next === 'dark' ? '☀️' : '🌙';
  });
}

/**
 * Binds click handlers to all tab buttons.
 */
function initTabs() {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });
}

/**
 * Fetches challenges from the API and renders them into the challenges list.
 */
function initChallenges() {
  fetch('/api/challenges')
    .then((res) => res.json())
    .then((data) => {
      const list = document.getElementById('challenges-list');
      list.textContent = '';
      data.challenges.forEach((c) => {
        const item = document.createElement('div');
        item.className = 'challenge-item';
        item.setAttribute('role', 'listitem');
        item.innerHTML = `
          <div class="challenge-icon">${c.icon}</div>
          <div class="challenge-info">
            <div class="challenge-title">${escapeHTML(c.title)}</div>
            <div class="challenge-desc">${escapeHTML(c.description)}</div>
          </div>
          <div class="challenge-status">Active</div>
        `;
        list.appendChild(item);
      });
    })
    .catch(() => {
      const el = document.getElementById('challenges-list');
      el.textContent = '';
      const p = document.createElement('p');
      p.className = 'loading-text';
      p.textContent = 'Could not load challenges.';
      el.appendChild(p);
    });
}

/**
 * Escapes HTML in user-provided text to prevent XSS.
 * @param {string} str - Raw user input.
 * @returns {string} Safe HTML string.
 */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Seeds demo data for quick testing.
 */
function initDemoSeed() {
  document.getElementById('btn-demo').addEventListener('click', () => {
    const demos = [
      { label: 'Car (Petrol)', quantity: 10, unit: 'km', kgCO2: 1.2, category: 'transport', date: new Date().toISOString() },
      { label: 'Bus', quantity: 5, unit: 'km', kgCO2: 0.15, category: 'transport', date: new Date().toISOString() },
      { label: 'Rice Bowl', quantity: 1, unit: 'meal', kgCO2: 0.8, category: 'food', date: new Date().toISOString() },
    ];
    demos.forEach(addActivity);
    updateWorld();
    updateDashboard();
    updateInsights(demos[demos.length - 1]);
  });
}

/**
 * Initialises all application components on DOMContentLoaded.
 */
function initOnboarding() {
  if (getOnboardingDone()) return;
  const overlay = document.getElementById('onboarding-overlay');
  const steps = overlay.querySelectorAll('.onboarding-step');
  const dots = overlay.querySelectorAll('.dot');
  const prevBtn = document.getElementById('onboarding-prev');
  const nextBtn = document.getElementById('onboarding-next');
  const finishBtn = document.getElementById('onboarding-finish');
  let currentStep = 0;

  function showStep(idx) {
    steps.forEach((s, i) => { s.style.display = i === idx ? '' : 'none'; });
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    prevBtn.disabled = idx === 0;
    nextBtn.style.display = idx === steps.length - 1 ? 'none' : '';
    finishBtn.style.display = idx === steps.length - 1 ? '' : 'none';
  }

  prevBtn.addEventListener('click', () => { if (currentStep > 0) { currentStep--; showStep(currentStep); } });
  nextBtn.addEventListener('click', () => { if (currentStep < steps.length - 1) { currentStep++; showStep(currentStep); } });
  finishBtn.addEventListener('click', () => { overlay.style.display = 'none'; setOnboardingDone(); });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) { overlay.style.display = 'none'; setOnboardingDone(); } });

  showStep(0);
}

function showNudge(weekActivities) {
  const card = document.getElementById('nudge-card');
  const text = document.getElementById('nudge-text');
  if (weekActivities.length === 0) { card.style.display = 'none'; return; }
  const nudge = getNudge();
  if (nudge) {
    text.textContent = '💡 ' + nudge;
    card.style.display = '';
  } else {
    card.style.display = 'none';
  }
}

function updateComparison() {
  const card = document.getElementById('comparison-card');
  const content = document.getElementById('comparison-content');
  const snapshots = getWeeklySnapshots();
  if (snapshots.length < 2) { card.style.display = 'none'; return; }
  const recent = snapshots.slice(0, Math.min(snapshots.length, 4));
  const maxCO2 = Math.max(...recent.map(s => s.co2), 1);
  content.textContent = '';
  recent.forEach((s) => {
    const bar = document.createElement('div');
    bar.className = 'comparison-bar';
    const label = document.createElement('span');
    label.className = 'comparison-label';
    const d = new Date(s.weekStart);
    const end = new Date(d);
    end.setDate(end.getDate() + 6);
    label.textContent = `${d.getDate()}/${d.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}`;
    const track = document.createElement('div');
    track.className = 'comparison-track';
    const fill = document.createElement('div');
    fill.className = 'comparison-fill';
    const pct = Math.max((s.co2 / maxCO2) * 100, 2);
    fill.style.width = pct + '%';
    fill.style.background = s.co2 <= maxCO2 * 0.5 ? 'var(--color-primary)' : 'var(--color-danger)';
    track.appendChild(fill);
    const val = document.createElement('span');
    val.className = 'comparison-value';
    val.textContent = s.co2.toFixed(1) + ' kg';
    bar.appendChild(label);
    bar.appendChild(track);
    bar.appendChild(val);
    content.appendChild(bar);
  });
  card.style.display = '';
}

function init() {
  initTheme();
  initTabs();
  initActivityLog(onActivityLogged);
  initRouteCalculator();
  initChallenges();
  initDemoSeed();
  initOnboarding();
  updateWorld();
  updateDashboard();
}

document.addEventListener('DOMContentLoaded', init);
