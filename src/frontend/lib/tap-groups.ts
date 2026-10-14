import { EXTRA_ITEM_INDEX, ITEMS_PER_LIST, TV_COUNT } from '#shared/constants.ts'

export type TapGroup = { kind: 'screen' | 'extra' | 'hidden'; title: string }

/** Группа, которая начинается с этого крана, или `null`, если кран идёт внутри группы. */
export function tapGroup(index: number): TapGroup | null {
	if (index < EXTRA_ITEM_INDEX && index % ITEMS_PER_LIST === 0) {
		const tv = index / ITEMS_PER_LIST + 1

		return { kind: 'screen', title: `Экран ${tv} · краны ${index + 1}–${index + ITEMS_PER_LIST}` }
	}

	if (index === EXTRA_ITEM_INDEX) {
		return { kind: 'extra', title: `Чередуется с ${EXTRA_ITEM_INDEX}-м на экране ${TV_COUNT}` }
	}

	// Табло берёт только один кран сверх мест на экранах, остальные никуда не попадают.
	if (index === EXTRA_ITEM_INDEX + 1) return { kind: 'hidden', title: 'Не показываются на табло' }

	return null
}
