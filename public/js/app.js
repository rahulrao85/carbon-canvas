/**
 * @module app
 * @fileoverview Main application entry point. Initialises all UI components,
 * manages tabs, dashboard updates, and coordinate activity logging,
 * garden rendering, and AI insight fetch.
 */
import { addActivity, getActivities, getTodayActivities, getWeekActivities, getTotalCO2, getTopSource, getStreak, getTheme, setTheme } from './storage.js';
import { initActivityLog } from './activity-log.js';
import { renderGarden, getCarbonLevel } from './world-render.js';
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
}

/**
 * Re-renders the garden canvas with today's carbon level.
 */
function updateWorld() {
  const today = getTodayActivities();
  const todayCO2 = getTotalCO2(today);
  renderGarden(todayCO2);
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
 * Initialises all application components on DOMContentLoaded.
 */
function init() {
  initTheme();
  initTabs();
  initActivityLog(onActivityLogged);
  initRouteCalculator();
  initChallenges();
  updateWorld();
  updateDashboard();
}

document.addEventListener('DOMContentLoaded', init);
