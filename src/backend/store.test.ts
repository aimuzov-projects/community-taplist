import assert from 'node:assert/strict'
import { afterEach, beforeEach, mock, test } from 'node:test'

import { mockItems } from '#shared/mock.ts'

import { cacheReset, itemsGet, itemsPut } from './store.ts'

const record = mockItems.slice(0, 2)
const env = { ...process.env }

beforeEach(() => {
	cacheReset()
	Object.assign(process.env, {
		NODE_ENV: 'production',
		GITHUB_API_TOKEN: 'token',
		GITHUB_GIST_ID: 'gist',
		GITHUB_GIST_FILENAME: 'taplist.json',
		CACHE: '1',
	})
})

afterEach(() => {
	process.env = { ...env }
	mock.restoreAll()
})

const json = (body: unknown) => new Response(JSON.stringify(body))

test('читает список из файла gist и кэширует его', async () => {
	const fetch = mock.method(globalThis, 'fetch', async () =>
		json({ files: { 'taplist.json': { content: JSON.stringify({ record }) } } }),
	)

	assert.deepEqual(await itemsGet(), record)
	assert.deepEqual(await itemsGet(), record)
	assert.equal(fetch.mock.callCount(), 1)
	assert.equal(fetch.mock.calls[0].arguments[0], 'https://api.github.com/gists/gist')
})

test('обрезанный файл дочитывает по raw_url', async () => {
	const fetch = mock.method(globalThis, 'fetch', async (url: string) =>
		url.endsWith('/raw')
			? new Response(JSON.stringify({ record }))
			: json({ files: { 'taplist.json': { truncated: true, raw_url: 'https://gist/raw' } } }),
	)

	assert.deepEqual(await itemsGet(), record)
	assert.equal(fetch.mock.calls[1].arguments[0], 'https://gist/raw')
})

test('нет файла в gist -- ошибка', async () => {
	mock.method(globalThis, 'fetch', async () => json({ files: {} }))
	await assert.rejects(itemsGet(), /нет файла/)
})

test('сохранение пишет весь список в gist и обновляет кэш', async () => {
	const fetch = mock.method(globalThis, 'fetch', async () => json({}))

	await itemsPut(record)
	const [url, init] = fetch.mock.calls[0].arguments as [string, RequestInit]

	assert.equal(url, 'https://api.github.com/gists/gist')
	assert.equal(init.method, 'PATCH')
	assert.deepEqual(JSON.parse(JSON.parse(String(init.body)).files['taplist.json'].content), { record })
	assert.deepEqual(await itemsGet(), record)
	assert.equal(fetch.mock.callCount(), 1)
})

test('без токена в продакшне -- ошибка, а не пример', async () => {
	delete process.env.GITHUB_API_TOKEN
	await assert.rejects(itemsGet(), /GITHUB_API_TOKEN/)
})
