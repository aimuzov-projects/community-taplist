import { expectAccessible, expectHealthyPage } from '@aimuzov-projects/infra-site-kit/playwright/checks'
import { test } from '@playwright/test'

import { TV_COUNT } from '#shared/constants.ts'

// Общие проверки сайтов из infra-site-kit. Sitemap у таплиста нет, поэтому страницы
// перечислены здесь. Темы и Метрики тоже нет.
const paths = ['/', ...Array.from({ length: TV_COUNT }, (_, index) => `/tv/${index + 1}`), '/editor']

// Обложки в моках ссылаются на внешний хостинг. Отвечаем за него пустой картинкой,
// чтобы тесты не зависели от сети.
test.beforeEach(({ page }) =>
	page.route(/^https:\/\//, (route) =>
		route.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg"/>' }),
	),
)

for (const path of paths) {
	test(`${path} answers 200 without console errors and passes axe`, async ({ page }) => {
		await expectHealthyPage(page, path)
		// Табло и редактор достраиваются после ответа API.
		await page.waitForLoadState('networkidle')
		await expectAccessible(page)
	})
}
