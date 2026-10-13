<p align="center">
	<a href="https://taplist.aimuzov.online"><img src=".github/assets/banner.jpg" alt="Taplist: a digital tap board for a craft beer bar" width="100%"></a>
</p>

<p align="center">
	<a href="https://github.com/aimuzov-projects/community-taplist/actions/workflows/deploy.yml"><img src="https://img.shields.io/github/actions/workflow/status/aimuzov-projects/community-taplist/deploy.yml?branch=main&label=deploy" alt="Deploy"></a>
	<a href="https://taplist.aimuzov.online"><img src="https://img.shields.io/website?url=https%3A%2F%2Ftaplist.aimuzov.online&label=site" alt="Site status"></a>
	<a href="package.json"><img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Faimuzov-projects%2Fcommunity-taplist%2Fmain%2Fpackage.json&query=%24.engines.node&label=node&logo=nodedotjs&logoColor=white&color=5fa04e" alt="Node"></a>
	<a href="https://astro.build"><img src="https://img.shields.io/github/package-json/dependency-version/aimuzov-projects/community-taplist/dev/astro?logo=astro&logoColor=white&color=bc52ee" alt="Astro"></a>
	<a href="https://svelte.dev"><img src="https://img.shields.io/github/package-json/dependency-version/aimuzov-projects/community-taplist/dev/svelte?logo=svelte&logoColor=white&color=ff3e00" alt="Svelte"></a>
	<a href="LICENSE"><img src="https://img.shields.io/github/license/aimuzov-projects/community-taplist" alt="License"></a>
</p>

> **English** · [Русский](README.ru.md)

A digital tap list for a craft beer bar: [taplist.aimuzov.online](https://taplist.aimuzov.online). Two TVs show what is on tap, bartenders edit the list in a password-protected web editor, and the list itself lives in a GitHub Gist, so there is no database.

A static [Astro](https://astro.build) site with Svelte islands plus a small dependency-free Node API (`src/backend/`) that reads and writes the gist and keeps the list in memory, so the TVs never hit GitHub rate limits.

## What's inside

- **Screen picker** (`/`): left/right on the remote to choose, OK to open.
- **Boards** (`/tv/1`, `/tv/2`): 1920×1080, 12 taps per screen. RETURN goes back to the picker. Boards pick up a fresh list in place, without a reload, and reload once after a deploy. The 25th tap alternates with the last slot of the second screen.
- **Editor** (`/editor`): names, breweries, styles, IBU, ABV and prices, drag-and-drop reordering, covers (shrunk in the browser to 250 px and stored in the gist itself).
- **API**: `GET /api/items` for the boards, `PUT /api/items` for the editor, `GET /api/health`.

## Running

Requires Node 26.11.1, the same version is pinned in `package.json` and the Dockerfile.

```sh
cp .env.example .env   # may stay empty: the API serves a sample tap list
npm ci
npm run dev            # site, /api is proxied to localhost:8787
npm run api            # API
```

Before committing:

```sh
npm run format:check && npm run lint:js && npm run lint:css && npm run check && npm test
```

### Gist

1. Create a secret gist with a file such as `taplist.json` containing `{ "record": [] }`.
2. Create a [fine-grained token](https://github.com/settings/personal-access-tokens/new) with only **Gists: Read and write**.
3. Put the token, the gist ID (the end of its URL) and the file name into `.env`, see [`.env.example`](.env.example).

The editor overwrites the whole file. With `CACHE=1`, edits made directly in the gist show up only after the API restarts.

## TVs

The boards run in the LG webOS 5 browser, which is Chromium 68. Hence:

- the client build lowers syntax to `chrome68` (the `client-target` plugin in `astro.config.mjs`: Astro itself forces `esnext` on the client);
- `globalThis`, `queueMicrotask` and `String.prototype.replaceAll`, missing there, are polyfilled by an inline script in `src/frontend/layouts/base.astro`;
- no flex `gap`, no `min()` outside `@supports`, no `Array.prototype.at` or other post-2019 APIs in browser code.

Check the bundle after a build: `npx es-check es2019 'dist/_astro/*.js' --module`.

## Content Security Policy

The build puts a CSP with hashes of Astro scripts and styles into every page (`security.csp` in `astro.config.mjs`). `npm run dev` has no policy, so violations only show up in `npm run build && npm run preview` and in production. Images are allowed from any `https:` origin because covers may link to external hosts.

## Deployment

A push to `main` runs GitHub Actions: checks first, then SSH into the `projects` server. There the key is bound to [`deploy/remote.sh`](deploy/remote.sh), which pulls `main` and rebuilds the containers from [`deploy/docker-compose.yml`](deploy/docker-compose.yml): nginx with the static site and the API. The domain, TLS and the editor password (`basic_auth` on `/editor` and `PUT /api/items`) are handled by the shared Caddy from `aimuzov-projects/infra-server`. `.env` lives on the server in `/srv/community-taplist`.

To roll back, `git revert` the bad commit on `main` and push. `remote.sh` runs compose with `--remove-orphans`, so containers the previous version did not have go away on their own.

## License

[MIT](LICENSE)
