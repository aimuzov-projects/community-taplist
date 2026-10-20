import {
	expectAccessible,
	expectHealthyPage,
	expectStableWidth,
	siteChecks,
} from '@aimuzov-projects/infra-site-kit/playwright/checks'
import { test, type Page } from '@playwright/test'

import { TV_COUNT } from '#shared/constants.ts'

// Общие проверки сайтов из infra-site-kit. Sitemap у таплиста нет, поэтому страницы
// перечислены здесь. Темы и Метрики тоже нет.
const paths = ['/', ...Array.from({ length: TV_COUNT }, (_, index) => `/tv/${index + 1}`), '/editor', '/changelog']

// Обложки в моках ссылаются на внешний хостинг. Отвечаем за него пустой картинкой,
// чтобы тесты не зависели от сети.
const stubCovers = (page: Page) =>
	page.route(/^https:\/\//, (route) =>
		route.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg"/>' }),
	)

test.beforeEach(({ page }) => stubCovers(page))

for (const path of paths) {
	test(`${path} answers 200 without console errors and passes axe`, async ({ page }) => {
		await expectHealthyPage(page, path)
		// Табло и редактор достраиваются после ответа API.
		await page.waitForLoadState('networkidle')
		await expectAccessible(page)
	})
}

// Страницы, axe и ширина по sitemap выключены: таплист обходит их по своему списку.
// Поэтому и axe для 404 свой, тем более что схема у сайта одна, тёмная.
siteChecks({ pages: false, a11y: false, gutter: false, notFound: { suggest: false } })

test('the not-found page passes axe', async ({ page }) => {
	await page.goto('/kit-404-probe')
	await expectAccessible(page)
})

test('every page keeps its width with or without a scrollbar', async ({
	playwright,
	browserName,
	baseURL,
	viewport,
}) => {
	// Свой браузер, как в ките: Chromium в тестах прячет полосы, а здесь нужны обычные.
	const browser = await playwright[browserName].launch({ ignoreDefaultArgs: ['--hide-scrollbars'] })

	try {
		const page = await browser.newPage({ baseURL, viewport })

		await stubCovers(page)
		await expectStableWidth(page, [...paths, '/kit-404-probe'])
	} finally {
		await browser.close()
	}
})
