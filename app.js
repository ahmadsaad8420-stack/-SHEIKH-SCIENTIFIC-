/* SHEIKH SCIENTIFIC — UI controller (requires engine.js) */
(() => {
  'use strict';

  const { evaluate, format, MAX_EXPRESSION_LENGTH } = window.SheikhMath;
  const $ = id => document.getElementById(id);

  const STORAGE_THEME = 'sheikhCalcTheme';
  const LEGACY_STORAGE_HISTORY = 'sheikhCalcHistory';
  const MAX_HISTORY = 40;
  const OPERATORS_AFTER_RESULT = ['+', '-', '*', '/', '%', '^', '^2', '!', '×10^'];
  const ERROR_MESSAGES = ['Math error', 'Domain error', 'Division by zero', 'Invalid factorial'];

  let expression = '';
  let answer = 0;
  let memory = 0;
  let angleMode = 'DEG';
  let justEvaluated = false;

  /* ---------- storage (always guarded: it can be blocked or full) ---------- */
  const safeGet = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const safeSet = (key, value) => { try { localStorage.setItem(key, value); } catch { /* ignore */ } };
  const safeRemove = key => { try { localStorage.removeItem(key); } catch { /* ignore */ } };

  /* ---------- helpers ---------- */
  const calc = (expr, mode = angleMode) => evaluate(expr, { angleMode: mode, answer });
  const pretty = text => text.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−');

  let toastTimer = null;
  function toast(message) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1600);
  }

  // true when the "(" at index 1 is closed by the very last ")"
  function isWrappedByNegation(text) {
    if (!text.startsWith('-(') || !text.endsWith(')')) return false;
    let depth = 0;
    for (let k = 1; k < text.length; k++) {
      if (text[k] === '(') depth++;
      else if (text[k] === ')') {
        depth--;
        if (depth === 0) return k === text.length - 1;
      }
    }
    return false;
  }

  /* ---------- history (session only; legacy key is imported read-only) ---------- */
  function loadLegacyHistory() {
    try {
      const raw = safeGet(LEGACY_STORAGE_HISTORY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.slice(0, MAX_HISTORY)
        .filter(x => x && typeof x.expr === 'string' && typeof x.res === 'string' &&
          x.expr.length <= MAX_EXPRESSION_LENGTH && x.res.length <= 80)
        .map(x => ({ expr: x.expr, res: x.res }));
    } catch { return []; }
  }
  let history = loadLegacyHistory();

  function addHistory(expr, res) {
    history.unshift({ expr: String(expr).slice(0, MAX_EXPRESSION_LENGTH), res: String(res).slice(0, 80) });
    history = history.slice(0, MAX_HISTORY);
    renderHistory();
  }

  function renderHistory() {
    const list = $('historyList');
    list.replaceChildren();
    if (!history.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.append('Your calculations will appear here.', document.createElement('br'), 'Start calculating ✦');
      list.appendChild(empty);
      return;
    }
    history.forEach(item => {
      const el = document.createElement('button');
      el.className = 'history-item';
      el.type = 'button';
      el.setAttribute('aria-label', `Reuse calculation ${pretty(item.expr)} equals ${item.res}`);
      const hx = document.createElement('div');
      hx.className = 'hx';
      hx.textContent = pretty(item.expr);
      const hr = document.createElement('div');
      hr.className = 'hr';
      hr.textContent = '= ' + item.res;
      el.append(hx, hr);
      el.addEventListener('click', () => { expression = item.expr; justEvaluated = false; display(); });
      list.appendChild(el);
    });
  }

  /* ---------- display ---------- */
  function preview() {
    try { return format(calc(expression)); } catch { return '…'; }
  }
  function display() {
    $('expression').textContent = expression ? pretty(expression) : 'Ready for calculation';
    $('result').textContent = expression ? preview() : '0';
    $('memIndicator').hidden = memory === 0;
  }

  /* ---------- core actions ---------- */
  function calculate() {
    if (!expression) return;
    try {
      const value = calc(expression);
      const formatted = format(value);
      answer = value;
      addHistory(expression, formatted);
      $('result').textContent = formatted;
      $('expression').textContent = '= ' + formatted;
      expression = formatted;
      justEvaluated = true;
    } catch (e) {
      toast(ERROR_MESSAGES.includes(e.message) ? e.message : 'Check expression');
    }
  }

  function insert(value) {
    if (justEvaluated) {
      if (!OPERATORS_AFTER_RESULT.includes(value)) expression = '';
      justEvaluated = false;
    }
    if (expression.length + String(value).length > MAX_EXPRESSION_LENGTH) { toast('Expression is too long'); return; }
    if (value === '.' && (!expression || /[^0-9.]$/.test(expression))) value = '0.';
    expression += value;
    display();
  }

  function clearAll() {
    expression = '';
    justEvaluated = false;
    $('expression').textContent = 'Cleared';
    $('result').textContent = '0';
    $('memIndicator').hidden = memory === 0;
  }
  function deleteLast() {
    expression = expression.slice(0, -1);
    justEvaluated = false;
    display();
  }
  function toggleSign() {
    if (!expression) return;
    expression = isWrappedByNegation(expression) ? expression.slice(2, -1) : `-(${expression})`;
    justEvaluated = false;
    display();
  }
  function reciprocal() {
    try {
      const source = expression || format(answer);
      const n = calc(source);
      if (n === 0) throw new Error('Division by zero');
      const next = `1/(${source})`;
      if (next.length > MAX_EXPRESSION_LENGTH) throw new Error('Expression is too long');
      expression = next;
      justEvaluated = false;
      calculate();
    } catch (e) {
      toast(['Division by zero', 'Expression is too long'].includes(e.message) ? e.message : 'Enter a valid value first');
    }
  }
  function memoryRecall() {
    const text = format(memory);
    insert(memory < 0 ? `(${text})` : text);
  }
  function memoryAdjust(sign) {
    try {
      const n = expression ? calc(expression) : answer;
      memory += sign * n;
      if (Math.abs(memory) < 1e-15) memory = 0;
      display();
      toast('Memory updated');
    } catch { toast('Enter a valid value first'); }
  }

  const ACTIONS = {
    clear: clearAll,
    delete: deleteLast,
    equals: calculate,
    'toggle-sign': toggleSign,
    reciprocal,
    'memory-clear': () => { memory = 0; display(); toast('Memory cleared'); },
    'memory-recall': memoryRecall,
    'memory-add': () => memoryAdjust(1),
    'memory-subtract': () => memoryAdjust(-1)
  };

  $('keys').addEventListener('click', e => {
    const button = e.target.closest('button');
    if (!button) return;
    const { action, value } = button.dataset;
    if (action && ACTIONS[action]) ACTIONS[action]();
    else if (value !== undefined) insert(value);
  });

  function setMode(mode) {
    angleMode = mode;
    $('degBtn').classList.toggle('active', mode === 'DEG');
    $('radBtn').classList.toggle('active', mode === 'RAD');
    $('degBtn').setAttribute('aria-pressed', String(mode === 'DEG'));
    $('radBtn').setAttribute('aria-pressed', String(mode === 'RAD'));
    display();
  }
  $('degBtn').addEventListener('click', () => setMode('DEG'));
  $('radBtn').addEventListener('click', () => setMode('RAD'));

  /* ---------- theme ---------- */
  const systemColorScheme = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
  let themeMode = safeGet(STORAGE_THEME);
  if (!['system', 'light', 'dark'].includes(themeMode)) themeMode = 'system';

  function applyTheme(isLight) {
    const root = document.documentElement;
    root.classList.toggle('light', isLight);
    root.style.colorScheme = isLight ? 'light' : 'dark';
    $('themeBtn').textContent = isLight ? '☾' : '☀';
    $('themeBtn').setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    document.querySelector('meta[name="theme-color"]').setAttribute('content', isLight ? '#f3f6fb' : '#0b1220');
  }
  function setThemeMode(mode, persist = true) {
    themeMode = mode;
    applyTheme(mode === 'system' ? Boolean(systemColorScheme && systemColorScheme.matches) : mode === 'light');
    $('autoThemeBtn').setAttribute('aria-pressed', String(mode === 'system'));
    if (persist) safeSet(STORAGE_THEME, mode);
  }
  $('themeBtn').addEventListener('click', () =>
    setThemeMode(document.documentElement.classList.contains('light') ? 'dark' : 'light'));
  $('autoThemeBtn').addEventListener('click', () => setThemeMode('system'));
  if (systemColorScheme) {
    const onChange = () => { if (themeMode === 'system') applyTheme(systemColorScheme.matches); };
    if (systemColorScheme.addEventListener) systemColorScheme.addEventListener('change', onChange);
    else if (systemColorScheme.addListener) systemColorScheme.addListener(onChange);
  }
  setThemeMode(themeMode, false);

  /* ---------- copy result ---------- */
  $('copyResult').addEventListener('click', async () => {
    const text = $('result').textContent;
    if (!text || text === '…') { toast('Nothing to copy'); return; }
    let fallback = null;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        fallback = document.createElement('textarea');
        fallback.value = text;
        fallback.setAttribute('readonly', '');
        fallback.style.position = 'fixed';
        fallback.style.opacity = '0';
        document.body.appendChild(fallback);
        fallback.select();
        if (!document.execCommand('copy')) throw new Error('copy failed');
      }
      toast('Result copied');
    } catch {
      toast('Copy not available in this browser');
    } finally {
      if (fallback) fallback.remove();
    }
  });

  /* ---------- clear data ---------- */
  $('clearHistory').addEventListener('click', () => {
    history = [];
    safeRemove(LEGACY_STORAGE_HISTORY);
    renderHistory();
    toast('History cleared');
  });
  $('clearAllData').addEventListener('click', () => {
    history = [];
    memory = 0;
    safeRemove(LEGACY_STORAGE_HISTORY);
    safeRemove(STORAGE_THEME);
    setThemeMode('system', false);
    renderHistory();
    display();
    toast('All local app data cleared');
  });

  /* ---------- keyboard ---------- */
  const KEY_VALUES = new Set(['+', '-', '*', '/', '(', ')', '%', '^', '!', 'e', 'E']);
  document.addEventListener('keydown', e => {
    if (!$('privacyDialog').hidden || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
    const interactive = e.target instanceof Element &&
      e.target.closest('button,a,input,textarea,select,[contenteditable="true"]');

    if (/^[0-9.]$/.test(e.key)) { e.preventDefault(); insert(e.key); }
    else if (KEY_VALUES.has(e.key)) { e.preventDefault(); insert(e.key === 'E' ? 'e' : e.key); }
    else if ((e.key === 'Enter' || e.key === '=') && !interactive) { e.preventDefault(); calculate(); }
    else if (e.key === 'Backspace' && !interactive) { e.preventDefault(); deleteLast(); }
    else if (e.key === 'Escape') { clearAll(); }
  });

  /* ---------- privacy dialog ---------- */
  let privacyOpener = null;
  function openPrivacy() {
    privacyOpener = document.activeElement;
    $('privacyDialog').hidden = false;
    $('calculatorApp').inert = true;
    document.body.classList.add('modal-open');
    $('closePrivacy').focus();
  }
  function closePrivacy() {
    $('privacyDialog').hidden = true;
    $('calculatorApp').inert = false;
    document.body.classList.remove('modal-open');
    if (privacyOpener instanceof HTMLElement) privacyOpener.focus();
    else $('privacyBtn').focus();
  }
  $('privacyBtn').addEventListener('click', openPrivacy);
  $('footerPrivacy').addEventListener('click', openPrivacy);
  $('closePrivacy').addEventListener('click', closePrivacy);
  $('privacyDialog').addEventListener('click', e => { if (e.target === $('privacyDialog')) closePrivacy(); });
  $('privacyDialog').addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); closePrivacy(); return; }
    if (e.key !== 'Tab') return;
    const focusable = Array.from($('privacyDialog').querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter(el => !el.disabled);
    if (!focusable.length) { e.preventDefault(); return; }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------- start ---------- */
  renderHistory();
  display();

  if ('serviceWorker' in navigator && ['http:', 'https:'].includes(location.protocol)) {
    navigator.serviceWorker.register('./sw.js').catch(error => {
      console.warn('Offline mode unavailable:', error);
    });
  }
})();
