# CloudCart — Sample Web App for Autonomous QA Agent Testing

Minimal, zero-external-dependency Node.js storefront mockup designed to evaluate **Autonomous Web App QA Agents** running inside ephemeral **Gemini Enterprise Agent Platform (GEAP)** `gVisor` sandboxes.

## Routes (`http://localhost:3000`)

- `/` — Product catalog (`Add to Cart` interactive counter)
- `/login` — Customer sign-in form (`POST /api/login`)
- `/checkout` — Order summary & `Complete Order` submission (`POST /api/checkout`)
- `/api/health` — Readiness probe (`200 OK`)

## Branches for QA Agent Testing

| Branch | Unit Tests (`npm test`) | Browser E2E (`Playwright`) | Expected `go_for_merge` | Purpose |
| :--- | :---: | :---: | :---: | :--- |
| **`main`** | Pass (`3/3`) | Pass (`0` errors) | `true` | Clean baseline storefront |
| **`feat/checkout-redesign`** | Pass (`3/3`) | **Fail** (`Uncaught TypeError` in `public/checkout.js`) | `false` | Simulates a PR where unit tests pass, a debug log leaks dummy credentials, and clicking `#complete-order-btn` on `/checkout` throws an uncaught `TypeError` |

## Local Quickstart

```bash
npm test
npm run dev -- --port 3000
```
