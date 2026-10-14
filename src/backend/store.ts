import { copyFile, mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { mockItems } from '#shared/mock.ts'
import { isItemList, type Item } from '#shared/types.ts'

/** Сколько прошлых версий списка держать в `history/`: хватит, чтобы вернуть случайно стёртый кран. */
export const HISTORY_LIMIT = 30

const production = () => process.env.NODE_ENV === 'production'
const dataDir = () => process.env.DATA_DIR || (production() ? '/data' : '.data')
const dataFile = () => join(dataDir(), 'taplist.json')
const historyDir = () => join(dataDir(), 'history')

async function read(): Promise<Item[]> {
	let text: string

	try {
		text = await readFile(dataFile(), 'utf8')
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error

		// Пустой список вместо потерянного файла молча очистил бы табло, поэтому падаем.
		if (production()) throw new Error(`Нет файла ${dataFile()}: список кранов не найден`)

		await write(structuredClone(mockItems))

		return structuredClone(mockItems)
	}

	const items: unknown = JSON.parse(text)

	if (!isItemList(items)) throw new Error(`В ${dataFile()} не список кранов`)

	return items
}

let historySeq = 0

async function keepHistory() {
	await mkdir(historyDir(), { recursive: true })

	try {
		// Двоеточия из ISO-времени неудобны в именах файлов. Счётчик разводит сохранения в одну
		// миллисекунду, а порядок по имени остаётся хронологическим.
		const stamp = new Date().toISOString().replaceAll(':', '-')
		const seq = String(++historySeq).padStart(6, '0')

		await copyFile(dataFile(), join(historyDir(), `${stamp}-${seq}.json`))
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
	}

	const versions = (await readdir(historyDir())).filter((name) => name.endsWith('.json')).sort()

	for (const name of versions.slice(0, -HISTORY_LIMIT)) await rm(join(historyDir(), name))
}

async function write(items: Item[]) {
	await mkdir(dataDir(), { recursive: true })
	await keepHistory()

	// Сначала пишем рядом, потом подменяем: оборванная запись не оставит битый файл.
	const temp = `${dataFile()}.tmp`

	await writeFile(temp, JSON.stringify(items, null, 2))
	await rename(temp, dataFile())
}

let cache: Promise<Item[]> | undefined
// Сохранения идут по одному: два одновременных PUT не перемешают историю и файл.
let queue: Promise<unknown> = Promise.resolve()

/**
 * Список кранов из `taplist.json`.
 *
 * Файл читается один раз, дальше список отдаётся из кэша. Неудачное чтение
 * в кэше не остаётся, следующий вызов прочитает файл заново.
 *
 * Если файла нет, в разработке он создаётся из моков, а в продакшене бросается ошибка.
 */
export function itemsGet(): Promise<Item[]> {
	cache ??= read().catch((error) => {
		cache = undefined

		throw error
	})

	return cache
}

/**
 * Сохраняет список кранов, прошлая версия файла при этом уходит в `history/`.
 *
 * Сохранения выполняются по очереди. Упавшее сохранение отклоняет только свой промис,
 * следующие в очереди всё равно выполнятся.
 */
export function itemsPut(items: Item[]): Promise<Item[]> {
	const saved = queue.then(async () => {
		await write(items)
		cache = Promise.resolve(items)

		return items
	})

	queue = saved.catch(() => {})

	return saved
}

/** Сброс кэша между тестами. */
export function cacheReset() {
	cache = undefined
}
