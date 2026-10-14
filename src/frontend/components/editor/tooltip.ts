import type { Action } from 'svelte/action'

// Одна плашка на страницу, приклеенная к body: подсказку не обрежет ячейка с overflow, а у полей
// ввода, в отличие от ::after, она тоже работает.
let tip: HTMLDivElement | undefined
let timer: ReturnType<typeof setTimeout> | undefined

const DELAY = 350
const GAP = 8
const EDGE = 8

function element() {
	if (!tip) {
		tip = document.createElement('div')
		tip.className = 'editor-tooltip'
		tip.setAttribute('role', 'tooltip')
		document.body.append(tip)
	}

	return tip
}

function show(target: HTMLElement, text: string) {
	const el = element()

	el.textContent = text
	el.classList.add('editor-tooltip--visible')

	// Под элементом и по центру, а у края окна -- прижатой к нему. Если снизу не влезает -- сверху.
	// Позиция ставится через CSSOM: CSP режет атрибуты style, но не el.style.
	const box = target.getBoundingClientRect()
	const left = Math.min(
		Math.max(box.left + box.width / 2 - el.offsetWidth / 2, EDGE),
		innerWidth - el.offsetWidth - EDGE,
	)
	const below = box.bottom + GAP
	const top = below + el.offsetHeight > innerHeight - EDGE ? box.top - GAP - el.offsetHeight : below

	el.style.left = `${left}px`
	el.style.top = `${top}px`
}

function hide() {
	clearTimeout(timer)
	tip?.classList.remove('editor-tooltip--visible')
}

export const tooltip: Action<HTMLElement, string | undefined> = (node, initial) => {
	let text = initial

	const enter = () => {
		clearTimeout(timer)

		if (text) timer = setTimeout(() => show(node, text ?? ''), DELAY)
	}

	const events = { mouseenter: enter, focus: enter, mouseleave: hide, blur: hide, mousedown: hide }

	for (const [type, listener] of Object.entries(events)) node.addEventListener(type, listener)

	return {
		update(next) {
			text = next
		},
		destroy() {
			hide()

			for (const [type, listener] of Object.entries(events)) node.removeEventListener(type, listener)
		},
	}
}
