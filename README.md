# SHEIKH SCIENTIFIC — Professional Scientific Calculator

A responsive, standalone scientific calculator built with plain HTML, CSS, and JavaScript. It has no third-party libraries or runtime network dependency.

## Features
- Basic arithmetic, brackets, remainder (modulo), powers, factorial
- Trigonometry and inverse trigonometry with DEG/RAD modes
- `log`, `ln`, square root, cube root, absolute value
- Constants π and e, previous answer (Ans), scientific notation (`×10ˣ`)
- Memory controls: MC, MR, M+, M−
- Calculation history (up to 40 entries)
- Copy result, keyboard support, dark/light themes
- Responsive layout for phones, tablets, and desktops
- English Privacy Policy, developer contact information, history deletion, and clear-all-local-data control
- Local-only operation; no analytics, ads, remote scripts, external fonts, or app-operated API calls

## Run
1. Extract the ZIP.
2. Open `index.html` in a current browser.
3. Keep `index.html`, `styles.css`, and `app.js` in the same folder.

No installation or build step is required. Clipboard copy is best supported on HTTPS or localhost; a fallback is attempted where available.

The `%` key calculates the remainder (modulo), not a percentage. A new number entered after `=` starts a new calculation; an operator continues from the displayed result.

## Developer
**Saad Sheikh**  
Phone: [+880 1622-792592](tel:+8801622792592)  
Email: [ahmad.saad.8420@gmail.com](mailto:ahmad.saad.8420@gmail.com)

The developer's name, phone number, and email are displayed in the app and will be public if you publish it online.

## Privacy
The app stores up to 40 calculation history entries and the theme preference in the browser's LocalStorage. These values remain in that browser profile unless the user clears them. LocalStorage is not encrypted. The app code does not send this data to an app-operated server.

## Concurrent use
Each visitor's browser performs calculations and stores its own history locally. Many visitors can use the same static deployment independently; there are no shared accounts or synchronized histories. People sharing the same browser profile also share its local history. Actual traffic capacity depends on the static hosting provider.

## Security and deployment
The HTML includes a restrictive meta Content Security Policy. JavaScript and CSS are in separate same-origin files, so the policy does not need `unsafe-inline`. The policy blocks network connections, remote scripts, plugins, forms, and base-URL changes.

If deploying to a public website:
- Serve only over HTTPS.
- Configure server response headers: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy`, and `Content-Security-Policy` with `frame-ancestors 'none'`.
- Consider `X-Frame-Options: DENY` as an additional legacy-browser defense.
- Keep the three app files on the same trusted origin and review any future dependencies.
- Update the Privacy Policy before introducing analytics, advertising, accounts, cloud sync, or any data collection. Publish a real support contact if the website is offered publicly.

## Limitations
This is a static calculator, not a formal security certification or penetration test. Browser/device access can expose LocalStorage. Mathematical results should be independently verified before use in safety-critical, financial, engineering, or other high-stakes decisions.
