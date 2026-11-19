# Security & Quality Review — SHEIKH SCIENTIFIC

## Scope
This is a source review of the standalone HTML, CSS, JavaScript, and documentation. It is not a penetration test, formal security certification, or mathematical conformance test.

## Fixes in this edition
- Recognize the `e` constant from the calculator button and keyboard.
- Add a matching Σ browser-tab favicon and same-origin manifest metadata.
- Expand scientific functions with floor, ceiling, rounding, exponential, and reciprocal operations.
- Add a sign-toggle key and support implicit multiplication after a closing parenthesis (for example, `(2+3)4`).
- Build history entries using DOM text nodes rather than HTML string insertion.
- Start a fresh expression when a number is entered after `=` while allowing operators to continue from the result.
- Treat tangent values at vertical asymptotes as a domain error instead of displaying a misleading floating-point result.
- Clarify that `%` means remainder (modulo), not percentage.
- Distinguish clearing calculation history from clearing all local app data.
- Use an English Privacy Policy and keep keyboard focus inside the policy dialog while open.
- Remove personal contact details and avoid public exposure of personal information.
- Synchronize the browser theme-color metadata with the selected theme and expose angle-mode state to assistive technology.
- Follow the device's `prefers-color-scheme` setting by default and when it changes, while keeping manual light/dark choices available and adding an explicit Auto control.

## Privacy and deployment notes
- Calculation history (up to 40 entries) is memory-only and disappears on refresh or close. Legacy `sheikhCalcHistory` entries are imported into memory on startup and are preserved until the user explicitly uses “CLEAR HISTORY” or “Clear all local data,” either of which removes the legacy key. The theme preference is stored in LocalStorage and is not encrypted.
- Service-worker registration failures are logged to the browser console and shown with a brief status message instead of being silently ignored.
- Scientific notation results are reusable as expressions, and the reciprocal key operates on the current value or previous answer with division-by-zero protection.
- The Enter shortcut does not activate while keyboard focus is on an interactive control, and it is blocked while the privacy dialog is open.
- The privacy dialog uses `aria-modal`, sets the rest of the app inert while open, restores focus on close, traps Tab focus, and supports Escape.
- A same-origin service worker caches the app shell for offline use, with network-first navigation and cache-first static assets.
- The app has no analytics, advertising, remote scripts, or app-operated API calls.
- The meta CSP is defense-in-depth and is consistent with same-origin scripts, styles, manifest, and service worker. It cannot set `frame-ancestors`; public deployment therefore requires an HTTP response header because meta CSP support and host capabilities vary.
- HTTPS is required for service workers outside localhost. Static hosting must serve `sw.js` and `site.webmanifest` with valid JavaScript/JSON MIME types and same-origin paths.
- The web manifest contains no unsupported SVG-only install icon claim and no PNG install icons are packaged. This limits cross-browser installability and should not be described as a complete installable PWA; offline caching remains supported.
- Clipboard support varies by browser and is best supported on HTTPS or localhost.
- If data collection or server-side features are introduced, reassess the threat model and update the Privacy Policy before release.
- The app is a static, client-side calculator: each visitor uses a separate browser-local history. Simultaneous visitor capacity depends on the chosen static host; the app itself does not provide accounts or shared cloud data.

## Limitations
A focused source and JavaScript syntax test was run, covering file references and the added privacy/offline implementation. No full browser compatibility, PWA install, CSP response-header, clipboard, or mathematical conformance suite has been run. Verify deployment headers and results independently before relying on them for safety-critical, financial, medical, or engineering decisions.
