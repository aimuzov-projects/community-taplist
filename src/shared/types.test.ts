import assert from 'node:assert/strict'
import { test } from 'node:test'

import { mockItems } from '#shared/mock.ts'

import { isItemList } from './types.ts'

test('пример таплиста проходит проверку', () => {
	assert.equal(isItemList(mockItems), true)
})

test('пустой список допустим', () => {
	assert.equal(isItemList([]), true)
})

test('не список и кран без полей отклоняются', () => {
	assert.equal(isItemList({ record: [] }), false)
	assert.equal(isItemList([{ ...mockItems[0], name: 1 }]), false)
	assert.equal(isItemList([{ ...mockItems[0], attrs: { alc: '5' } }]), false)
	assert.equal(isItemList([null]), false)
})
