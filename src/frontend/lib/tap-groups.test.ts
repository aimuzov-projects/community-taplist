import assert from 'node:assert/strict'
import { test } from 'node:test'

import { groupTitle } from './tap-groups.ts'

test('группы начинаются с первого крана каждого экрана', () => {
	assert.equal(groupTitle(0), 'Экран 1 · краны 1–12')
	assert.equal(groupTitle(12), 'Экран 2 · краны 13–24')
})

test('внутри группы заголовка нет', () => {
	assert.deepEqual([1, 11, 13, 23].map(groupTitle), [null, null, null, null])
})

test('25-й кран чередуется, дальше табло ничего не показывает', () => {
	assert.equal(groupTitle(24), 'Чередуется с 24-м на экране 2')
	assert.equal(groupTitle(25), 'Не показываются на табло')
	assert.equal(groupTitle(26), null)
})
