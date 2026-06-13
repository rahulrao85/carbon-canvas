/**
 * @module ui-helpers
 * @fileoverview Onboarding overlay, reduction nudge, and week-over-week
 * comparison bar chart. Extracted from app.js to keep each file <200 lines.
 */
import { getOnboardingDone, setOnboardingDone, getWeeklySnapshots, getNudge } from './storage.js';

export function initOnboarding() {
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

export function showNudge(weekActivities) {
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

export function updateComparison() {
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
