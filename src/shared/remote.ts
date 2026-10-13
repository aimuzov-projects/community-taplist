// RETURN на пульте LG webOS -- 461, Escape и Backspace для проверки на компьютере.
const KEYS_BACK = [461, 27, 8]

export type RemoteKey = 'left' | 'right' | 'enter' | 'back'

export function remoteKey(event: KeyboardEvent): RemoteKey | null {
	if (event.keyCode === 37) return 'left'
	if (event.keyCode === 39) return 'right'
	if (event.keyCode === 13) return 'enter'
	if (KEYS_BACK.includes(event.keyCode)) return 'back'

	return null
}
