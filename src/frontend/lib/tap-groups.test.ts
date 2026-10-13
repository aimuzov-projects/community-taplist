import assert from 'node:assert/strict'
import { test } from 'node:test'

import { tapGroup } from './tap-groups.ts'

test('группы начинаются с первого крана каждого экрана', () => {
	assert.deepEqual(tapGroup(0), { kind: 'screen', title: 'Экран 1 · краны 1–12' })
	assert.deepEqual(tapGroup(12), { kind: 'screen', title: 'Экран 2 · краны 13–24' })
})

test('внутри группы заголовка нет', () => {
	assert.deepEqual([1, 11, 13, 23].map(tapGroup), [null, null, null, null])
})

test('25-й кран чередуется, дальше табло ничего не показывает', () => {
	assert.deepEqual(tapGroup(24), { kind: 'extra', title: 'Чередуется с 24-м на экране 2' })
	assert.deepEqual(tapGroup(25), { kind: 'hidden', title: 'Не показываются на табло' })
	assert.equal(tapGroup(26), null)
})
