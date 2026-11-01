# MFI CBS Admin

Back-office web app for the CBS core banking API (`../cbs`): React, TypeScript, [Refine](https://refine.dev)
and Ant Design, built with Vite.

So far: login with the API's JWT tokens, listing customers, and registering individuals.

## Run it

1. Start the backend with Swagger enabled, from `../cbs`:
   ```bash
   ./mvnw -pl cbs-app -am spring-boot:run -Dspring-boot.run.profiles=dev,memory
   ```
2. Start the admin app:
   ```bash
   npm install
   npm run dev
   ```
3. Open http://localhost:5173 and log in as a dev user, e.g. `officer` / `officer` (can register customers)
   or `teller` / `teller` (can only view them).

The dev server forwards `/api` to the backend, so the browser sees one origin and the backend needs no CORS
settings. To point it elsewhere, copy `.env.example` to `.env.local` and set `CBS_API_URL`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 5173 |
| `npm run build` | Type-check and build to `dist/` |
| `npm run lint` | oxlint |
| `npm run api:fetch` | Download the backend's OpenAPI spec into `openapi/cbs-api.json` (backend must run with the `dev` profile; set `CBS_API_DOCS` for another URL) |
| `npm run api:generate` | Regenerate `src/api/schema.ts` from that spec |

After changing the backend API: `npm run api:fetch && npm run api:generate`, then fix whatever `tsc` reports.

## How it fits together

```
src/
  api/schema.ts                   generated types for every endpoint (do not edit)
  api/client.ts                   typed client (openapi-fetch); adds the bearer token, refreshes it before expiry
  api/errors.ts                   CBS problem+json errors -> Refine notifications
  auth/token.ts                   where the token is kept (sessionStorage)
  auth/authProvider.ts            login, logout (revokes the token on the server), session check, current user
  auth/accessControlProvider.ts   which permission each action needs; hides buttons the user can't use
  providers/dataProvider.ts       maps Refine's list/create/get calls onto the CBS endpoints
  pages/                          login and customer screens
```

**Adding a screen:** add the endpoint calls for its resource in `providers/dataProvider.ts`, its permissions in
`auth/accessControlProvider.ts`, the resource in `App.tsx`, and the page under `pages/`.

**Permissions** in the UI only hide what the backend would refuse with 403; the backend enforces them.

**Money** is sent and received as decimal strings (`{"amount": "1000.00", "currency": "MNT"}`). Keep it that
way; never convert amounts to JavaScript numbers.

## Notes

- The token lives in `sessionStorage`: it survives a reload but not closing the tab. Any script on the page can
  read it, so never render untrusted HTML. An HttpOnly refresh cookie would be stronger later.
- TypeScript is pinned to 5.x: the code generator does not support TypeScript 7 yet.
- antd 5 on React 19 needs `@ant-design/v5-patch-for-react-19`, imported first in `main.tsx`.
- `path-to-regexp` is overridden in `package.json` to a patched version; remove the override once
  `@ant-design/pro-layout` updates its own dependency.
- Browser tests: a login in a browser's default profile triggers its "save password" prompt, which in headless
  mode swallows later clicks; run automated UI tests in a fresh (incognito) browser context.
