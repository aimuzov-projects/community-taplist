import preset from '@aimuzov/infra-site-kit/playwright'
import { defineConfig } from '@playwright/test'

// Пресет e2e из infra-site-kit: Chromium против `astro build && astro preview`.
// Рядом с превью поднимаем API на порту прокси из astro.config.mjs, краны в нём из моков.
export default defineConfig(preset, {
	webServer: {
		command: 'node src/backend/server.ts',
		url: 'http://localhost:8787/api/items',
		env: { DATA_DIR: '.data/e2e' },
		reuseExistingServer: false,
	},
})
