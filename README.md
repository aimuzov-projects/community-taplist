<p align="center">
	<img src="https://img.shields.io/badge/English-e0a458?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MCAzMCI+PGNsaXBQYXRoIGlkPSJ0Ij48cGF0aCBkPSJNMzAsMTVoMzB2MTV6djE1aC0zMHpoLTMwdi0xNXp2LTE1aDMweiIvPjwvY2xpcFBhdGg+PHBhdGggZD0iTTAsMHYzMGg2MHYtMzB6IiBmaWxsPSIjMDEyMTY5Ii8+PHBhdGggZD0iTTAsMCA2MCwzME02MCwwIDAsMzAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI2Ii8+PHBhdGggZD0iTTAsMCA2MCwzME02MCwwIDAsMzAiIGNsaXAtcGF0aD0idXJsKCN0KSIgc3Ryb2tlPSIjQzgxMDJFIiBzdHJva2Utd2lkdGg9IjQiLz48cGF0aCBkPSJNMzAsMHYzME0wLDE1aDYwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMTAiLz48cGF0aCBkPSJNMzAsMHYzME0wLDE1aDYwIiBzdHJva2U9IiNDODEwMkUiIHN0cm9rZS13aWR0aD0iNiIvPjwvc3ZnPg==" alt="English">
	<a href="README.ru.md"><img src="https://img.shields.io/badge/%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-555?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5IDYiPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0wIDBoOXYzSDB6Ii8+PHBhdGggZmlsbD0iIzAwMzlhNiIgZD0iTTAgMmg5djJIMHoiLz48cGF0aCBmaWxsPSIjZDUyYjFlIiBkPSJNMCA0aDl2MkgweiIvPjwvc3ZnPg==" alt="Русский"></a>
</p>

<p align="center">
	<a href="https://taplist.aimuzov.online"><img src=".github/assets/banner.en.jpg" alt="Taplist: a digital tap board for a craft beer bar" width="100%"></a>
</p>

<p align="center">
	<a href="https://github.com/aimuzov-projects/community-taplist/actions/workflows/deploy.yml"><img src="https://img.shields.io/github/actions/workflow/status/aimuzov-projects/community-taplist/deploy.yml?branch=main&label=deploy" alt="Deploy"></a>
	<a href="https://taplist.aimuzov.online"><img src="https://img.shields.io/website?url=https%3A%2F%2Ftaplist.aimuzov.online&label=site" alt="Site status"></a>
	<a href="package.json"><img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Faimuzov-projects%2Fcommunity-taplist%2Fmain%2Fpackage.json&query=%24.engines.node&label=node&logo=nodedotjs&logoColor=white&color=5fa04e" alt="Node"></a>
	<a href="https://astro.build"><img src="https://img.shields.io/github/package-json/dependency-version/aimuzov-projects/community-taplist/dev/astro?logo=astro&logoColor=white&color=bc52ee" alt="Astro"></a>
	<a href="https://svelte.dev"><img src="https://img.shields.io/github/package-json/dependency-version/aimuzov-projects/community-taplist/dev/svelte?logo=svelte&logoColor=white&color=ff3e00" alt="Svelte"></a>
	<a href="LICENSE"><img src="https://img.shields.io/github/license/aimuzov-projects/community-taplist" alt="License"></a>
</p>

<h3 align="center">A digital tap list for a craft beer bar</h3>
<p align="center">Boards on the TVs, an editor for bartenders, the list in a JSON file with no database</p>

<table>
	<tr>
		<td width="50%" align="center"><img src=".github/assets/board.jpg" alt="Board"><br><b>Board</b> on the TVs</td>
		<td width="50%" align="center"><img src=".github/assets/editor.jpg" alt="Editor"><br><b>Editor</b> for bartenders</td>
	</tr>
</table>

Lives at [taplist.aimuzov.online](https://taplist.aimuzov.online). A static [Astro](https://astro.build) site with Svelte islands plus a small dependency-free Node API (`src/backend/`) that stores the list in a JSON file on the server and keeps it in memory.

## What's inside

- **Screen picker** (`/`): two links, one per TV.
- **Boards** (`/tv/1`, `/tv/2`): 1920×1080, 12 taps per screen. Boards pick up a fresh list in place, without a reload, and reload once after a deploy. The 25th tap alternates with the last slot of the second screen. A tap without a name shows as free: a dashed frame and a "coming soon" line instead of dashes and empty prices.
- **Editor** (`/editor`): names, breweries, styles, IBU, ABV and prices, drag-and-drop reordering, covers (shrunk in the browser to 250 px and stored in the list itself). Taps are grouped by screen and changed ones are highlighted. A tap can be wiped with one button and brought back until the page reloads, and all unsaved edits can be reverted at once.
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

The e2e tests in [`e2e`](e2e) build the site, start the API on the sample list next to it and open the start page, both TVs and the editor in Chromium with the checks of [infra-site-kit](https://github.com/aimuzov-projects/infra-site-kit): the pages answer without console errors and pass axe. The browser is installed once with `npx playwright install chromium`, then `npm run test:e2e`.

### Data

The tap list is a single JSON file, `taplist.json`, in `DATA_DIR`: on the server that is the `community-taplist-data` volume mounted at `/data`, locally `.data/` in the repo root. Locally the API creates the file from the sample on first run; in production it refuses to start without it.

The editor overwrites the whole file and moves the previous version to `history/`, which keeps the last 30 saves. To restore one:

```sh
ssh projects 'docker exec community-taplist-api ls /data/history'
ssh projects 'docker exec community-taplist-api cp /data/history/<version>.json /data/taplist.json && docker restart community-taplist-api'
```

## TVs

The boards run in the LG webOS 5 browser, which is Chromium 68. Hence:

- the client build lowers syntax to `chrome68` (the `client-target` plugin in `astro.config.mjs`: Astro itself forces `esnext` on the client);
- `globalThis`, `queueMicrotask` and `String.prototype.replaceAll`, missing there, are polyfilled by an inline script in `src/frontend/layouts/base.astro`;
- no flex `gap`, no `min()` outside `@supports`, no `Array.prototype.at` or other post-2019 APIs in browser code.

Check the bundle after a build: `npx es-check es2019 'dist/_astro/*.js' --module`.

## Content Security Policy

The build puts a CSP with hashes of Astro scripts and styles into every page (`security.csp` in `astro.config.mjs`). `npm run dev` has no policy, so violations only show up in `npm run build && npm run preview` and in production. Images are allowed from any `https:` origin because covers may link to external hosts.

## Deployment

Merging the release PR that release-please keeps open runs GitHub Actions: checks first, then SSH into the `projects` server. There the key runs the shared [`deploy/site.sh`](https://github.com/aimuzov-projects/infra-server/blob/main/deploy/site.sh) of infra-server, which pulls `main` and rebuilds the containers from [`deploy/docker-compose.yml`](deploy/docker-compose.yml): nginx with the static site and the API. The domain, TLS and the editor password (`basic_auth` on `/editor` and `PUT /api/items`) are handled by the shared Caddy from `aimuzov-projects/infra-server`. `.env` lives on the server in `/srv/community-taplist`.

To roll back fast, run Deploy by hand with the previous tag: `gh workflow run deploy.yml -f tag=v1.2.3`. A fix of the bad commit goes out through the release PR like any change. `site.sh` runs compose with `--remove-orphans`, so containers the previous version did not have go away on their own.

## Acknowledgements

Thanks to [Sophiya Bezruk](https://t.me/sabezruk) for helping with the project, especially with the design.

## License

[MIT](LICENSE)
