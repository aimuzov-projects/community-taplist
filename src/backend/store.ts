import { mockItems } from '#shared/mock.ts'
import type { Item } from '#shared/types.ts'

const API = 'https://api.github.com'

type GistFile = { content?: string; truncated?: boolean; raw_url?: string }

// Без токена вне продакшна отдаём пример из памяти: настраивать GitHub для разработки не нужно.
function useMock() {
	return process.env.NODE_ENV !== 'production' && !process.env.GITHUB_API_TOKEN
}

function gistConfig() {
	const { GITHUB_API_TOKEN: token, GITHUB_GIST_ID: id, GITHUB_GIST_FILENAME: filename } = process.env

	if (!token || !id || !filename) {
		throw new Error('Не заданы GITHUB_API_TOKEN, GITHUB_GIST_ID или GITHUB_GIST_FILENAME')
	}

	return { token, id, filename }
}

async function github(path: string, token: string, init: RequestInit = {}) {
	const response = await fetch(`${API}${path}`, {
		...init,
		headers: {
			accept: 'application/vnd.github+json',
			authorization: `Bearer ${token}`,
			'x-github-api-version': '2022-11-28',
			...init.headers,
		},
	})

	if (!response.ok) throw new Error(`GitHub ответил ${response.status} на ${init.method ?? 'GET'} ${path}`)

	return response
}

async function gistRead(): Promise<Item[]> {
	if (useMock()) return structuredClone(mockItems)

	const { token, id, filename } = gistConfig()
	const gist = (await (await github(`/gists/${id}`, token)).json()) as { files?: Record<string, GistFile> }
	const file = gist.files?.[filename]

	if (!file) throw new Error(`В gist нет файла «${filename}»`)

	// API отдаёт содержимое целиком только до ~1 МБ, больший файл читается отдельно.
	const content =
		file.truncated || !file.content ? await fetch(file.raw_url ?? '').then((r) => r.text()) : file.content

	return (JSON.parse(content) as { record: Item[] }).record
}

async function gistWrite(record: Item[]) {
	if (useMock()) return

	const { token, id, filename } = gistConfig()

	await github(`/gists/${id}`, token, {
		method: 'PATCH',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ files: { [filename]: { content: JSON.stringify({ record }, null, 2) } } }),
	})
}

let cache: Item[] | undefined

export async function itemsGet(): Promise<Item[]> {
	// С CACHE=1 gist читается один раз, дальше его обновляет сохранение из редактора.
	if (!cache || (process.env.CACHE !== '1' && !useMock())) cache = await gistRead()

	return cache
}

export async function itemsPut(items: Item[]): Promise<Item[]> {
	await gistWrite(items)
	cache = items

	return cache
}

/** Сброс кэша между тестами. */
export function cacheReset() {
	cache = undefined
}
