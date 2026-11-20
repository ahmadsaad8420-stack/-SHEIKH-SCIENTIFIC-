# SHEIKH SCIENTIFIC — Private Scientific Calculator

A responsive, installable scientific calculator built with plain HTML, CSS and JavaScript. No third-party libraries, no build step, no network calls.

## Features
- Arithmetic, brackets, remainder (modulo), powers, factorial, implicit multiplication (`2π`, `(2+3)4`, `5!4`)
- Trigonometry and inverse trigonometry with DEG/RAD modes; `log`, `ln`, `√`, `∛`, `abs`, `floor`, `ceil`, `round`, `eˣ`, reciprocal
- Constants π and e, previous answer (`Ans`), scientific notation (`×10ˣ`), sign toggle
- Memory (MC, MR, M+, M−) with an **M** indicator
- Calculation history for the current page session only (up to 40 entries, never persisted)
- Copy result, full keyboard support, dark / light / auto theme (no flash on load)
- Responsive layout, accessible labels, focus-trapped privacy dialog
- Offline support and installable as an app (PNG icons + manifest + service worker)

## Files
| File | Purpose |
|---|---|
| `index.html` | Page, key layout, privacy policy |
| `styles.css` | Styling (dark/light, responsive) |
| `engine.js` | Safe math parser (tokenizer + recursive descent; no `eval`) |
| `app.js` | UI logic, history, theme, keyboard, dialog |
| `theme-init.js` | Applies saved theme before first paint |
| `sw.js` | Service worker (network-first, offline fallback) |
| `site.webmanifest`, `icons/`, `favicon.svg` | App metadata and icons |
| `_headers` | Security headers for Netlify / Cloudflare Pages |

Keep all files and the `icons/` folder together.

## Run
Open `index.html` in a current browser, or deploy the folder to any static host. The service worker and clipboard API need HTTPS (or `localhost`); the calculator itself works from a plain file.

Notes on behaviour: `%` is the remainder (modulo), not a percentage. A number typed after `=` starts a new calculation; an operator continues from the result. Implicit multiplication has the same priority as `×` (so `1/2π` is `(1/2)×π`). `e` is Euler's number, so `1e5` means `1 × e × 5`; use the `×10ˣ` key for scientific notation.

## Deploy (Netlify)
1. Drag the whole folder into Netlify (or connect a repo). The `_headers` file is applied automatically.
2. Use HTTPS only (Netlify does this by default).
3. After deploying, check the response headers (browser DevTools → Network → `index.html`) or use securityheaders.com. You should see `Content-Security-Policy` with `frame-ancestors 'none'`, `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy`.
4. On other hosts that ignore `_headers`, copy the same headers into the host's own configuration. The CSP meta tag still protects scripts, but cannot block framing.
5. When you change any file, increase `CACHE_NAME` in `sw.js` (for example `v4`) so returning visitors refresh their offline copy.

## Privacy
History lives in memory for the page session only. The theme choice is saved in LocalStorage. A legacy `sheikhCalcHistory` key from an older version is imported into the session and removed only when you press “CLEAR HISTORY” or “Clear all local data”. For offline use the browser caches the app's own files. LocalStorage is not encrypted. Nothing is sent to any server by the app.

## Limitations
This is a static calculator, not a certified security product or a penetration-tested system. Results use standard double-precision floating point (about 15 significant digits, displayed with 12). Verify results independently before relying on them for safety-critical, financial, medical or engineering decisions. The privacy policy lists no personal contact on purpose; add a support address if you publish this commercially.
