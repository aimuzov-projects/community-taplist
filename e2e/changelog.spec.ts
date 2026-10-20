import { expect, test } from '@playwright/test'

test('версия в шапке редактора ведёт на «Что нового», а оттуда можно вернуться', async ({ page }) => {
	await page.goto('/editor')
	await page.getByRole('link', { name: /^Что нового в версии / }).click()

	await expect(page).toHaveURL(/\/changelog\/?$/)
	await expect(page.getByRole('heading', { level: 1, name: 'Что нового' })).toBeVisible()

	await page.getByRole('link', { name: '← К редактору' }).click()
	await expect(page).toHaveURL(/\/editor\/?$/)
})

test('каждый релиз -- раздел с датой и версией, оглавление ведёт к нему', async ({ page }) => {
	await page.goto('/changelog')

	await expect(page.locator('#v2-0-0')).toContainText('версия 2.0.0')
	await page.getByRole('navigation', { name: 'Релизы' }).getByRole('link').last().click()
	await expect(page).toHaveURL(/#v0-0-1$/)
})
