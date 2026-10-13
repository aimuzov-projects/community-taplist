import { EXTRA_ITEM_INDEX, ITEMS_PER_COLUMN, ITEMS_PER_LIST, TV_COUNT } from '#shared/constants.ts'
import type { Item } from '#shared/types.ts'

export type TapItem = Item & { number: number }

// Карточка показывает свой кран и, возможно, второй, который чередуется с ним.
export type TapCard = [TapItem] | [TapItem, TapItem]
export type TapColumn = TapCard[]

export function tvColumns(tv: number, items: Item[]): TapColumn[] {
	const numbered = items.map((item, index) => ({ ...item, number: index + 1 }))
	const start = ITEMS_PER_LIST * (tv - 1)
	const cards: TapCard[] = numbered.slice(start, start + ITEMS_PER_LIST).map((item) => [item])

	const extra = numbered[EXTRA_ITEM_INDEX]
	// Без Array.prototype.at: табло работает в Chromium 68.
	const last = cards[cards.length - 1]

	if (tv === TV_COUNT && extra && last && cards.length >= ITEMS_PER_COLUMN) {
		cards[cards.length - 1] = [last[0], extra]
	}

	// Колонки заполняются с конца: у неполного экрана пустеет первая колонка.
	const columns: TapColumn[] = []

	for (let end = cards.length; end > 0; end -= ITEMS_PER_COLUMN) {
		columns.unshift(cards.slice(Math.max(0, end - ITEMS_PER_COLUMN), end))
	}

	return columns
}
