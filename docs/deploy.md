# Deployment

[Русская версия](deploy.ru.md)

## The projects server

The app lives on the `projects` server in `/srv/community-taplist`. Ports 80/443, TLS and the
`taplist.aimuzov.online` domain are handled by the shared Caddy from `aimuzov-projects/infra-server`,
which reaches the `community-taplist:80` container over the `edge` network. Caddy asks for the same
`/editor` password as `PRIVATE_EDITOR_SECRET`, so the browser prompts only once.

A push to `main` runs GitHub Actions: checks, then SSH into the server. The key from the
`DEPLOY_SSH_KEY` secret is bound to [`deploy/remote.sh`](../deploy/remote.sh), which pulls `main`
and rebuilds the container from [`deploy/docker-compose.yml`](../deploy/docker-compose.yml). To
redeploy without a push: `gh workflow run deploy.yml`.

`.env` lives on the server next to the repository, see [`.env.example`](../.env.example). `PORT`
and `ORIGIN` are set by compose.

## Rollback

To roll back, `git revert` the bad commit on `main` and push: Actions build the previous version
the same way.

## Memory

The container is capped at 160 MB (`mem_limit`) with a 96 MB Node heap. That is enough for the app
and keeps it from starving neighbouring projects.

The image raises the adapter-node `BODY_SIZE_LIMIT` to 16 MB: the editor saves the whole list with
covers, which does not fit into the default 512 KB.

## TVs

Open `https://taplist.aimuzov.online` in the TV browser in full screen and pick a screen with the
remote, RETURN goes back. The layout targets 1920×1080 and scales down to 1280×720. Boards fetch
fresh data every `PUBLIC_DATA_UPDATE_INTERVAL` milliseconds and reload once after a new deploy.

The client bundle targets Chromium 68 (LG webOS 5). Older TVs show the board, but without remote
navigation or data updates.
