import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readdir, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, test } from 'node:test'

import { mockItems } from '#shared/mock.ts'

import { cacheReset, HISTORY_LIMIT, itemsGet, itemsPut } from './store.ts'

const env = { ...process.env }
let dir: string

beforeEach(async () => {
	cacheReset()
	dir = await mkdtemp(join(tmpdir(), 'taplist-'))
	Object.assign(process.env, { NODE_ENV: 'production', DATA_DIR: dir })
})

afterEach(() => {
	process.env = { ...env }
})

const list = (count: number) => mockItems.slice(0, count)
const history = async () => (await readdir(join(dir, 'history'))).sort()

test('читает список из файла и держит его в памяти', async () => {
	await writeFile(join(dir, 'taplist.json'), JSON.stringify(list(2)))

	assert.deepEqual(await itemsGet(), list(2))
	await writeFile(join(dir, 'taplist.json'), JSON.stringify(list(3)))
	assert.deepEqual(await itemsGet(), list(2))
})

test('на проде без файла -- ошибка, а не пустое табло', async () => {
	await assert.rejects(itemsGet(), /Нет файла/)
})

test('вне прода без файла создаёт его из примера', async () => {
	process.env.NODE_ENV = 'development'

	assert.deepEqual(await itemsGet(), mockItems)
	assert.deepEqual(JSON.parse(await readFile(join(dir, 'taplist.json'), 'utf8')), mockItems)
})

test('файл не со списком кранов -- ошибка', async () => {
	await writeFile(join(dir, 'taplist.json'), '{"record": []}')
	await assert.rejects(itemsGet(), /не список кранов/)
})

test('сохранение пишет файл, обновляет память и откладывает прошлую версию в историю', async () => {
	await writeFile(join(dir, 'taplist.json'), JSON.stringify(list(2)))

	await itemsPut(list(3))

	assert.deepEqual(JSON.parse(await readFile(join(dir, 'taplist.json'), 'utf8')), list(3))
	assert.deepEqual(await itemsGet(), list(3))
	const [saved] = await history()
	assert.deepEqual(JSON.parse(await readFile(join(dir, 'history', saved), 'utf8')), list(2))
})

test(`история хранит только ${HISTORY_LIMIT} последних версий`, async () => {
	await writeFile(join(dir, 'taplist.json'), JSON.stringify(list(1)))
	await mkdir(join(dir, 'history'))
	for (let day = 1; day <= 5; day++) await writeFile(join(dir, 'history', `2000-01-0${day}.json`), '[]')

	for (let i = 0; i < HISTORY_LIMIT; i++) await itemsPut(list(1))

	const versions = await history()
	assert.equal(versions.length, HISTORY_LIMIT)
	assert.ok(!versions.includes('2000-01-01.json'))
})

test('одновременные сохранения идут по очереди, последнее побеждает', async () => {
	await writeFile(join(dir, 'taplist.json'), JSON.stringify(list(1)))

	await Promise.all([itemsPut(list(2)), itemsPut(list(3)), itemsPut(list(4))])

	assert.deepEqual(JSON.parse(await readFile(join(dir, 'taplist.json'), 'utf8')), list(4))
	assert.equal((await history()).length > 0, true)
})
