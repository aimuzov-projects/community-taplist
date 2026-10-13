# Build natively on $BUILDPLATFORM (fast on Apple Silicon), the final image targets the server platform.
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine
WORKDIR /app
# The editor posts the list with covers as data URLs, far over the 512K default.
ENV NODE_ENV=production PORT=3000 BODY_SIZE_LIMIT=16M
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
USER node
EXPOSE 3000
CMD ["node", "build"]
