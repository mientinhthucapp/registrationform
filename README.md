# Registration Form

Retreat registration form (React + TypeScript + Vite + Tailwind CSS).

## Local development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in values as needed:

```bash
cp .env.example .env
```

| Variable                       | Required? | Purpose                                                                 |
| ------------------------------- | --------- | ------------------------------------------------------------------------ |
| `VITE_STRIPE_PUBLISHABLE_KEY`  | Optional  | Enables the Stripe card payment step. If unset, the app shows a "Stripe is not connected" message on that step and the bank-transfer flow still works fully. |

This app talks to a proprietary Zite backend in production (`zite-endpoints-sdk`, `zite-file-upload-sdk`) that has no local/npm equivalent. For local development, `vite.config.ts` aliases those imports to local mocks in `src/mocks/`, so the full form (including phone-uniqueness check, file upload, and registration submission) is click-through-able without any backend or extra setup.

### 3. Run the app locally

```bash
npm run dev
```

### 4. Open the app

The app will be available at **http://localhost:5173/** (Vite will pick the next available port, e.g. `5174`, if `5173` is already in use).

### Other scripts

```bash
npm run build      # type-check + production build
npm run preview     # preview the production build locally
npm run typecheck  # type-check only
```
