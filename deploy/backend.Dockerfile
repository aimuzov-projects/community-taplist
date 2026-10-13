# Сервис API: Node запускает TypeScript сам, зависимостей нет, сборка не нужна.
# Контекст сборки -- корень репо: API берёт типы и пример таплиста из src/shared.

FROM node:26.11.1-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY src/shared ./src/shared
COPY src/backend ./src/backend
USER node
EXPOSE 8787
CMD ["node", "src/backend/server.ts"]
