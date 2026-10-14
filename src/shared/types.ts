export type Item = {
	cover: string
	name: string
	style: string
	brewery: string
	attrs: {
		alc: string
		ibu: string
		price04: string
		price025: string
	}
}

const isString = (value: unknown) => typeof value === 'string'

function isItem(value: unknown): value is Item {
	if (typeof value !== 'object' || value === null) return false

	const { cover, name, style, brewery, attrs } = value as Record<string, unknown>

	if (![cover, name, style, brewery].every(isString)) return false

	if (typeof attrs !== 'object' || attrs === null) return false

	const { alc, ibu, price04, price025 } = attrs as Record<string, unknown>

	return [alc, ibu, price04, price025].every(isString)
}

/** Кран без названия считается свободным: табло и редактор показывают его по-особому. */
export function isEmptyItem(item: Item) {
	return item.name.trim() === ''
}

export function isItemList(value: unknown): value is Item[] {
	return Array.isArray(value) && value.every(isItem)
}
