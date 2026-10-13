import { writeFile } from 'node:fs/promises'
import svelte from '@astrojs/svelte'
import { defineConfig } from 'astro/config'

const proxy = { '/api': 'http://localhost:8787' }

// Метка сборки: табло сверяет её с /version.json и перезагружается после деплоя.
const version = Date.now().toString(36)

/** @type {import('astro').AstroIntegration} */
const buildVersion = {
	name: 'build-version',
	hooks: {
		'astro:build:done': ({ dir }) => writeFile(new URL('version.json', dir), JSON.stringify({ version })),
	},
}

// Табло крутятся в браузере LG webOS 5, это Chromium 68. Astro ставит клиентской сборке
// target esnext поверх vite.build.target, поэтому опускаем синтаксис в хуке окружения.
const legacyTarget = 'chrome68'

/** @type {import('vite').Plugin} */
const clientTarget = {
	name: 'client-target',
	enforce: 'post',
	configEnvironment(name) {
		if (name === 'client') return { build: { target: legacyTarget, cssTarget: legacyTarget } }
	},
}

export default defineConfig({
	// Рядом с сайтом в src/ лежат API и общий с ним код.
	srcDir: './src/frontend',
	site: 'https://taplist.aimuzov.online',
	// CSS немного: внутри HTML он не блокирует первую отрисовку отдельным запросом.
	build: { inlineStylesheets: 'always' },
	integrations: [svelte(), buildVersion],
	vite: {
		define: { 'import.meta.env.BUILD_VERSION': JSON.stringify(version) },
		plugins: [clientTarget],
		// На проде /api отдаёт Caddy сервису API, локально его роль играет прокси Vite.
		server: { proxy },
		preview: { proxy },
	},
	// Подсветка Shiki несовместима с CSP.
	markdown: { syntaxHighlight: false },
	// Astro кладёт CSP с хешами своих скриптов и стилей в <meta> страницы. Обложки бывают
	// ссылками на внешние картинки, поэтому img-src шире остального.
	security: {
		csp: {
			scriptDirective: { resources: ["'self'"] },
			directives: [
				"default-src 'self'",
				"img-src 'self' data: https:",
				"connect-src 'self'",
				"object-src 'none'",
				"base-uri 'self'",
				"form-action 'self'",
			],
		},
	},
})
