# Lumé

Lumé is an editorial skin, style, and virtual try-on companion built with React, Vite, and Express. It turns a real Perfect Corp YouCam Skin AI v2.1 result into a readable report, routine, looks edit, AI Clothes v4 fitting room, and a seven-day browser planner.

Live analysis is honest by design: when no API key is configured, Lumé disables paid actions and offers a clearly labelled sample report instead of inventing a result.

## Features

- Skin AI v2.1 portrait analysis with essential and complete study depths
- Personal report with scores, regional readings, skin type, and a routine
- Editorial looks with filters and local preference ordering
- AI Clothes v4 virtual try-on with person, garment, and category controls
- Seven-day planner stored in the browser
- Responsive desktop, tablet, and mobile layouts
- Print / Save PDF layout for skin reports
- Explicit preview, loading, error, and unconfigured states
- Sample report at `/report?sample=1` when demo fixtures are enabled

## Requirements

- Node.js 22.12 or newer (tested with Node 22.23.4)
- npm 10 or newer
- A Perfect Corp YouCam API key for live skin analysis and virtual try-on

## Install

```bash
npm install
cp .env.example .env
```

Add your credentials to `.env`:

```dotenv
YOUCAM_API_KEY=your_server_side_key
```

The API key is read only by the Express server. Never rename it with a `VITE_` prefix, expose it in browser code, or commit `.env`.

## Development

```bash
npm run dev
```

This starts:

- Web app: http://localhost:5173
- API: http://localhost:3001

Vite proxies `/api` requests to the API server. The sample report is available during development by default.

Without a key, the app remains usable for the report preview, looks, planner, and interface review. Live scan and try-on buttons stay unavailable; no successful provider response is simulated.

## Production

```bash
npm run build
NODE_ENV=production npm start
```

The Express server serves `client/dist` on http://localhost:3001, including the API and client-side route fallback.

Set `DEV_FIXTURES=false` to hide the sample report in production. Set `PORT`, `CLIENT_ORIGIN`, and other values in `.env` as needed.

## Quality checks

```bash
npm run lint
npm test
npm run build
```

`npm test` runs the Node server tests, including the Skin AI response parser. The build outputs hashed assets under `client/dist`.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3001` | Express server port |
| `YOUCAM_API_KEY` | empty | Server-side Perfect Corp API key |
| `YOUCAM_API_HOST` | `https://yce-api-01.makeupar.com` | Validated YouCam API origin |
| `DEV_FIXTURES` | `true` in development, `false` in production | Enables the clearly labelled sample report |
| `MAX_UPLOAD_MB` | `10` | Per-image upload limit, capped at 10 MB |
| `SKIN_POLL_INTERVAL_MS` | `5000` | Skin task polling interval |
| `SKIN_TASK_MAX_WAIT_MS` | `300000` | Maximum skin task wait |
| `TRYON_TASK_MAX_WAIT_MS` | `300000` | Maximum try-on task wait |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Browser origin allowed for direct API development |

## API

- `GET /api/health` — process health
- `GET /api/status` — browser-safe configuration, provider status, limits, and docs
- `GET /api/skin/options` — study depths and upload limits
- `POST /api/skin/analyze` — multipart portrait plus `depth`; starts a Skin AI task
- `GET /api/skin/tasks/:taskId` — skin task status and verified result
- `GET /api/tryon/options` — garment categories and upload limits
- `POST /api/tryon` — multipart person and garment images plus `category`
- `GET /api/tryon/tasks/:taskId` — try-on task status and temporary result URL

Uploaded files use server memory and are not written to disk. Paid task starts are rate-limited by client and can fail when provider units are exhausted.

## Privacy and limitations

- Lumé does not persist uploads, result images, or planner data on the server.
- Reports are kept in the browser tab only. The planner uses `localStorage`; clearing browser data removes it.
- Perfect Corp documents a 24-hour processing retention window for AI results.
- Try-on result URLs are provider-hosted and temporary. Open or save a copy before leaving.
- Looks ordering is deterministic editorial guidance, not an AI skin recommendation.
- Skin readings are cosmetic observations, not medical advice.
- Live provider flows cannot be verified without a valid API key and available units.

## Project structure

```text
lume/
├── client/                 React + Vite application
│   ├── src/components/     Shared UI, dialogs, uploads, navigation
│   ├── src/contexts/       Config, report, try-on, planner, toast state
│   ├── src/pages/          Home, report, looks, try-on, planner, 404
│   ├── src/services/       API client, image/report/look/planner helpers
│   └── src/styles/         Tokens, shared styles, page styles, responsive/print
├── server/
│   ├── src/middleware/     Upload, configuration, rate-limit, error handling
│   ├── src/routes/         Status, skin, and try-on APIs
│   ├── src/services/       YouCam client and skin parser
│   └── test/               Node tests
└── .env.example
```
# Lume
