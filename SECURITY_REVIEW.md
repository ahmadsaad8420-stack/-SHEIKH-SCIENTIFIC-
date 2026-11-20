# Security & Quality Review — SHEIKH SCIENTIFIC (Edition 3)

## Scope
Source review plus automated checks of the HTML, CSS, JavaScript, service worker, manifest and documentation. Not a penetration test or formal certification.

## Security result
No exploitable vulnerability was found. The app has no server, no accounts, no third-party code and no network calls.

| Area | Status |
|---|---|
| Code execution | Safe. Expressions are parsed by a tokenizer and recursive-descent parser; no `eval`, `Function` or dynamic code. Inputs such as `alert(1)`, `constructor`, `__proto__` are rejected. |
| XSS | Safe. History and results are written with `textContent`; no `innerHTML`. A tampered legacy history entry containing `<img onerror>` is shown as plain text (tested). |
| CSP | `default-src 'none'` with same-origin scripts, styles, images, manifest and worker only; `connect-src 'none'`, `object-src 'none'`, `base-uri 'none'`, `form-action 'none'`, `frame-src 'none'`. No console CSP violations in testing. |
| Clickjacking | `frame-ancestors` cannot be set by a meta tag. **Fixed** by adding `_headers` with a real response-header CSP and `X-Frame-Options: DENY`. |
| Other headers | Added `_headers`: HSTS, `nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy`, COOP, CORP, correct manifest MIME type, `no-cache` for `sw.js`. |
| Denial of service | Expression length capped at 240 characters, factorial capped at 170, history capped at 40. |
| Storage | LocalStorage access is wrapped in try/catch; stored history is validated for type and length before use. |

## Fixes in this edition
Correctness
- `6.626×10^-34` and any result below 1e-12 were displayed as `0`. Fixed (only floating-point noise such as `sin(180°)` or `0.1+0.2−0.3` is snapped to 0).
- `2e`, `5!4` and `2Ans` returned an error. Parser rewritten with proper tokens and implicit multiplication.
- `round(-2.5)` gave −2; now −3 (half away from zero).
- The ± key broke expressions like `−(2)+(3)`. Fixed with bracket matching.
- MR inserted a negative memory value without brackets (`2` then MR gave `2−5`). Now `2(−5)`.
- Angles are reduced modulo 360° in DEG mode for better accuracy (`sin(390°) = 0.5`).
- Reciprocal can no longer create an expression longer than the limit.

Service worker
- Cache-first for scripts and styles could mix new HTML with old JS/CSS after an update. Replaced by network-first with offline fallback and a versioned cache.

Design and polish
- Keypad rearranged: digits on the left, operators in one column, `=` at bottom right (the old layout wrapped operators unevenly).
- Display shows `×`, `÷`, `−`; added M memory indicator; toast no longer hides behind the privacy dialog.
- No dark flash for light-theme users (`theme-init.js`); `color-scheme` set for native controls.
- Real PNG icons (192, 512, maskable, Apple touch) and a complete manifest, so the app is genuinely installable.
- Accessibility labels for symbol keys, live region only on the result, readable minimum font sizes, hover effects only on devices with hover, `100dvh` for mobile browsers.
- Privacy policy updated (offline cache, hosting logs, parser statement); `<noscript>` message and social/SEO meta tags added.
- Source code reformatted into readable modules; CRLF line endings removed; unused CSS removed.

## Verified by testing
Node unit checks of 60 expressions (precision, precedence, errors, injection strings) and a Chromium end-to-end run: key flows, sign toggle, memory, history reuse, DEG/RAD, theme persistence, privacy dialog focus handling, clear-data, legacy-history injection, service-worker install and offline use, manifest and icon delivery, and zero console errors.

## Remaining notes
- Response headers only apply on a host that reads `_headers` (Netlify, Cloudflare Pages) or has equivalent configuration. Confirm after deployment.
- Legacy history from an older version is still shown until the user clears it; this is documented in the policy.
- The policy shows no contact address by design. Add one if the site is offered publicly.
- Not tested: real-device Safari/Firefox, screen readers, automated accessibility audit.
