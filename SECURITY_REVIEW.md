# Security & Quality Review — SHEIKH SCIENTIFIC

## Scope
This is a source review of the standalone HTML, CSS, JavaScript, and documentation. It is not a penetration test, formal security certification, or mathematical conformance test.

## Fixes in this edition
- Recognize the `e` constant from the calculator button and keyboard.
- Start a fresh expression when a number is entered after `=` while allowing operators to continue from the result.
- Treat tangent values at vertical asymptotes as a domain error instead of displaying a misleading floating-point result.
- Clarify that `%` means remainder (modulo), not percentage.
- Distinguish clearing calculation history from clearing all local app data.
- Use an English Privacy Policy and keep keyboard focus inside the policy dialog while open.
- Add developer contact details and clarify that they are public on a hosted site.
- Synchronize the browser theme-color metadata with the selected theme and expose angle-mode state to assistive technology.

## Privacy and deployment notes
- Calculation history (up to 40 entries) and theme preference are stored in LocalStorage. LocalStorage is not encrypted.
- The app has no analytics, advertising, remote scripts, or app-operated API calls.
- The meta Content Security Policy is defense-in-depth; it cannot replace server response headers. For public deployment, use HTTPS and configure appropriate HTTP security headers, including `frame-ancestors`.
- Clipboard support varies by browser and is best supported on HTTPS or localhost.
- If data collection or server-side features are introduced, reassess the threat model and update the Privacy Policy before release.
- The app is a static, client-side calculator: each visitor uses a separate browser-local history. Simultaneous visitor capacity depends on the chosen static host; the app itself does not provide accounts or shared cloud data.

## Limitations
No automated browser compatibility or full mathematical conformance suite has been run. Verify results independently before relying on them for safety-critical, financial, medical, or engineering decisions.
