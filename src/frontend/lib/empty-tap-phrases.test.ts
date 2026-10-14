import assert from 'node:assert/strict'
import { test } from 'node:test'

import { EMPTY_TAP_PHRASES, PHRASE_NOTE_MAX, PHRASE_TITLE_MAX, randomPhrase } from './empty-tap-phrases.ts'

test('фразы помещаются в карточку крана', () => {
	for (const { title, note } of EMPTY_TAP_PHRASES) {
		assert.ok(title.length <= PHRASE_TITLE_MAX, title)
		assert.ok(note.length <= PHRASE_NOTE_MAX, note)
	}
})

test('фразы не повторяются', () => {
	const titles = EMPTY_TAP_PHRASES.map(({ title }) => title)
	assert.equal(new Set(titles).size, titles.length)
})

test('следующая фраза всегда другая', () => {
	const current = EMPTY_TAP_PHRASES[0]
	for (let index = 0; index < 100; index++) assert.notEqual(randomPhrase(current), current)
})
