import assert from 'node:assert/strict'
import { test } from 'node:test'

import { mockItems } from '#shared/mock.ts'
import type { Item } from '#shared/types.ts'

import { tvColumns } from './tv.ts'

const taps = (count: number): Item[] =>
	Array.from({ length: count }, (_, index) => ({ ...mockItems[0], name: `Кран ${index + 1}` }))

const numbers = (tv: number, items: Item[]) =>
	tvColumns(tv, items).map((column) => column.map((card) => card.map((item) => item.number)))

test('полный экран -- три колонки по четыре крана', () => {
	assert.deepEqual(numbers(1, taps(24)), [
		[[1], [2], [3], [4]],
		[[5], [6], [7], [8]],
		[[9], [10], [11], [12]],
	])
})

test('25-й кран чередуется с последним местом второго экрана', () => {
	const columns = numbers(2, taps(25))
	assert.deepEqual(columns[2], [[21], [22], [23], [24, 25]])
})

test('неполный экран оставляет пустой первую колонку', () => {
	assert.deepEqual(numbers(2, taps(18)), [
		[[13], [14]],
		[[15], [16], [17], [18]],
	])
})
