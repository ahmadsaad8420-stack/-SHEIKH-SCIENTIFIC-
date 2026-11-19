# SHEIKH SCIENTIFIC — Professional Scientific Calculator

A responsive, standalone scientific calculator built with plain HTML, CSS, and JavaScript. It has no third-party libraries or runtime network dependency.

## Features
- Basic arithmetic, brackets, remainder (modulo), powers, factorial
- Trigonometry and inverse trigonometry with DEG/RAD modes
- `log`, `ln`, square root, cube root, absolute value, floor, ceiling, rounding, exponential, reciprocal
- Constants π and e, previous answer (Ans), scientific notation (`×10ˣ`)
- Memory controls: MC, MR, M+, M−
- Calculation history for the current page session only (up to 40 entries; never persisted)
- Copy result, keyboard support, dark/light themes with automatic device-theme detection and manual override
- Responsive layout for phones, tablets, and desktops
- Offline app-shell caching through a same-origin service worker after HTTPS/localhost deployment
- Matching Σ brand icon in the page header and browser tab
- Sign-toggle key and improved implicit multiplication (for example, `(2+3)4`)
- English Privacy Policy, history deletion, and clear-all-local-data control
- Local-only operation; no analytics, ads, remote scripts, external fonts, or app-operated API calls

## Run
1. Extract the ZIP.
2. Open `index.html` in a current browser.
3. Keep `index.html`, `styles.css`, `app.js`, `sw.js`, `favicon.svg`, and `site.webmanifest` together in the same folder.

No installation or build step is required. Clipboard copy is best supported on HTTPS or localhost; a fallback is attempted where available.

The `%` key calculates the remainder (modulo), not a percentage. A new number entered after `=` starts a new calculation; an operator continues from the displayed result.

## Privacy
The app keeps up to 40 calculation history entries in memory for the current page session. Refreshing or closing the page discards new entries. A legacy `sheikhCalcHistory` key from an earlier version is imported into the session for preservation but is not deleted automatically. “CLEAR HISTORY” or “Clear all local data” explicitly removes that legacy key. The theme mode is stored in LocalStorage; Auto follows the device's light/dark appearance setting, and manual light/dark choices remain selected until Auto is chosen. “Clear all local data” or clearing the site's browser data resets the app to Auto. LocalStorage is not encrypted. The app code does not send either value to an app-operated server.

## Concurrent use
Each visitor's browser performs calculations and keeps new history in memory for that page session. Many visitors can use the same static deployment independently; there are no shared accounts or synchronized histories. Legacy browser-local history may be imported from an earlier app version but is not rewritten or sent anywhere. Actual traffic capacity depends on the static hosting provider.

## Security and deployment
The HTML includes a restrictive meta Content Security Policy. JavaScript and CSS are in separate same-origin files, so the policy does not need `unsafe-inline`. The policy blocks network connections, remote scripts, plugins, forms, and base-URL changes.

If deploying to a public website:
- Serve only over HTTPS.
- Configure server response headers: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy`, and `Content-Security-Policy` with `frame-ancestors 'none'`.
- Match the CSP to the actual deployed file set. A meta CSP is not enough for `frame-ancestors`, and some browsers enforce response-header CSP first or do not allow service workers under a restrictive meta policy. Set an HTTP CSP response header if your host supports it; for static hosts that do not support custom headers, document that limitation rather than claiming header protection.
- Service workers require HTTPS except for `localhost`. Offline caching is a PWA convenience and cannot by itself ensure privacy or security. Cache updates and hosting behavior depend on the host, and a host that strips service-worker MIME types or rewrites paths needs a matching deployment configuration.
- Consider `X-Frame-Options: DENY` as an additional legacy-browser defense.
- Keep the app files on the same trusted origin and review any future dependencies.
- Update the Privacy Policy before introducing analytics, advertising, accounts, cloud sync, or any data collection. Publish a real support contact if the website is offered publicly.

## Limitations
This is a static calculator, not a formal security certification or penetration test. PNG install icons are not included, so the app does not claim full cross-browser installability or Play/App Store-style PWA packaging. The manifest remains for basic web-app metadata and the service worker provides offline caching. Browser/device access can expose LocalStorage. Mathematical results should be independently verified before use in safety-critical, financial, engineering, or other high-stakes decisions.
