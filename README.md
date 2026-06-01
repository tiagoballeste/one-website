# ONE Shield Preloader

Fresh Next.js scaffold for a cinematic SVG logo preloader.

The loader uses `public/ONE_SHIELD.svg` as the source of truth. Its paths are embedded in `components/LogoPreloader.tsx` so the same geometry can render the outline layer, the bottom-to-top fill layer, and the zooming reveal mask.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Backend

The registration API routes proxy requests to the ONE backend through `ONE_BACKEND_URL`.

```bash
cp .env.example .env.local
```

Local default:

```bash
ONE_BACKEND_URL=http://127.0.0.1:8000
```

The proxy accepts these base formats and resolves the final public endpoints automatically:

- `/v1/publico`
- `/v1`
- root backend URL
