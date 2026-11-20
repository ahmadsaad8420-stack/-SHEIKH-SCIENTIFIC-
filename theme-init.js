/* Applies the saved/system theme before first paint to avoid a dark flash. */
(function () {
  'use strict';
  var mode = null;
  try { mode = localStorage.getItem('sheikhCalcTheme'); } catch (e) { /* storage blocked */ }
  var light = mode === 'light' ||
    ((mode !== 'dark') && !!window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
  var root = document.documentElement;
  if (light) root.classList.add('light');
  root.style.colorScheme = light ? 'light' : 'dark';
})();
