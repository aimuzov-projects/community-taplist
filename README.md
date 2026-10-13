# Community Tap List

[Русская версия](README.ru.md)

A digital tap list for a craft beer bar. Two TV screens show what is on tap, bar staff update the
list from a password-protected web editor, and the data lives in a GitHub Gist -- no database
required.

## Features

- **Home** (`/`) -- pick a screen with the remote: left and right to choose, OK to open.
- **TV screens** (`/tv/1`, `/tv/2`) -- a 1920×1080 board with 12 taps per screen. RETURN on the
  remote goes back home. The board picks up changes in place, without reloading the page. A 25th tap
  alternates with the last slot of the second screen.
- **Editor** (`/editor`) -- edit names, breweries, styles, IBU, ABV and prices, reorder taps with
  drag and drop, upload a cover image (resized in the browser to 250 px and stored inline).
- **Storage** -- a single JSON file in a GitHub Gist, optionally cached in memory.

## Quick start

Requires Node.js 22+.

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. Without a GitHub token the app runs on built-in sample data
kept in memory. To open the editor locally, create `.env` with an editor password:

```bash
echo 'PRIVATE_EDITOR_SECRET=admin:admin' > .env
```

## Configuration

Copy [`.env.example`](.env.example) to `.env` and fill it in.

| Variable                       | Description                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| `PRIVATE_EDITOR_SECRET`        | Editor credentials as `user:password`. The editor stays locked while it is empty.    |
| `PRIVATE_GITHUB_API_TOKEN`     | GitHub token with access to gists only. Empty in development means sample data.      |
| `PRIVATE_GITHUB_GIST_ID`       | ID of the gist that stores the list.                                                 |
| `PRIVATE_GITHUB_GIST_FILENAME` | File name inside the gist, e.g. `taplist.json`.                                      |
| `PRIVATE_CACHE`                | `1` -- read the gist once and keep it in memory; otherwise read it on every request. |
| `PUBLIC_DATA_UPDATE_INTERVAL`  | How often TV screens fetch fresh data, in milliseconds (default `60000`).            |
| `ORIGIN`                       | Public URL of the app, needed in production behind a reverse proxy.                  |

### Setting up the gist

1. Create a secret gist at <https://gist.github.com> with a file such as `taplist.json`:
   ```json
   { "record": [] }
   ```
2. Create a [fine-grained token](https://github.com/settings/personal-access-tokens/new) with
   **Account permissions => Gists: Read and write** and nothing else.
3. Put the token, the gist ID (the last part of the gist URL) and the file name into `.env`.

The editor overwrites the whole file on save. With `PRIVATE_CACHE=1` edits made directly in the
gist show up only after a restart.

## Deployment

The app is built with `@sveltejs/adapter-node` into a Docker image and runs on the `projects`
server behind the shared Caddy. A push to `main` deploys it via GitHub Actions, see
[docs/deploy.md](docs/deploy.md) for details and rollback.

## Development

```bash
npm run dev      # dev server
npm run check    # type check
npm run lint     # prettier + eslint
npm run format   # apply prettier
npm run build    # production build into build/
```

## Project structure

```
src/
├── hooks.server.ts        # Basic Auth for /editor
├── lib/
│   ├── server/store.ts    # gist storage and cache
│   ├── tv.ts              # splitting taps into screens and columns
│   ├── types.ts           # data types and validation
│   └── mock.ts            # sample data for development
└── routes/
    ├── editor/            # editor page and save endpoint
    └── tv/[slug]/         # TV screens
```

## License

[MIT](LICENSE)
