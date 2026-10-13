import assert from 'node:assert/strict'
import { test } from 'node:test'

import { HttpError, readJson } from './server.ts'

async function* body(...parts: string[]) {
	for (const part of parts) yield Buffer.from(part)
}

test('собирает JSON из нескольких кусков', async () => {
	assert.deepEqual(await readJson(body('[{"a":', '1}]')), [{ a: 1 }])
})

test('не JSON -- 400', async () => {
	await assert.rejects(readJson(body('nope')), (error) => error instanceof HttpError && error.status === 400)
})

test('больше лимита -- 413', async () => {
	await assert.rejects(readJson(body('[1,', '2]'), 3), (error) => error instanceof HttpError && error.status === 413)
})
