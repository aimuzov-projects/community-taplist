import { EXTRA_ITEM_INDEX, ITEMS_PER_LIST, TV_COUNT } from '#shared/constants.ts'

/** Заголовок группы, которая начинается с этого крана, или `null`, если кран идёт внутри группы. */
export function groupTitle(index: number): string | null {
	if (index < EXTRA_ITEM_INDEX && index % ITEMS_PER_LIST === 0) {
		const tv = index / ITEMS_PER_LIST + 1
		return `Экран ${tv} · краны ${index + 1}–${index + ITEMS_PER_LIST}`
	}

	if (index === EXTRA_ITEM_INDEX) return `Чередуется с ${EXTRA_ITEM_INDEX}-м на экране ${TV_COUNT}`

	// Табло берёт только один кран сверх мест на экранах, остальные никуда не попадают.
	if (index === EXTRA_ITEM_INDEX + 1) return 'Не показываются на табло'

	return null
}
