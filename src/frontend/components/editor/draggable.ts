import type { Action } from 'svelte/action'

/**
 * Вызывается, когда строку бросили на другую строку.
 *
 * @param current - Индекс строки, на которую бросили.
 * @param next - Индекс строки, которую тащили.
 */
export type OnDragDrop = (current: number, next: number) => void

// Пока строку тащат, вложенные поля не ловят мышь: иначе dragenter и dragleave
// срабатывают на каждом инпуте и подсветка мигает.
export const DRAGGING = 'editor-dragging'
export const DRAGGED = 'editor-row--dragged'
export const OVER = 'editor-row--over'

let dragged: HTMLElement | null = null

/**
 * Перетаскивание строк редактора на нативном drag and drop.
 *
 * Индекс строки берётся из её `data-index`, поэтому атрибут должен стоять на том же узле.
 * Бросок строки на саму себя колбэк не вызывает.
 */
export const draggable: Action<HTMLElement, OnDragDrop> = (node, onDragDrop) => {
	let onDrop = onDragDrop

	node.draggable = true

	const listeners: Record<string, (event: DragEvent) => void> = {
		dragstart(event) {
			document.body.classList.add(DRAGGING)
			node.classList.add(DRAGGED)
			dragged = node

			if (event.dataTransfer) {
				event.dataTransfer.effectAllowed = 'move'
				event.dataTransfer.setData('index', node.dataset.index ?? '')
			}
		},
		dragenter() {
			node.classList.add(OVER)
		},
		dragleave() {
			node.classList.remove(OVER)
		},
		dragover(event) {
			event.preventDefault()

			if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
		},
		drop(event) {
			if (dragged !== node) onDrop?.(Number(node.dataset.index), Number(event.dataTransfer?.getData('index')))
		},
		dragend() {
			document.body.classList.remove(DRAGGING)

			for (const row of document.querySelectorAll(`.${OVER}`)) row.classList.remove(OVER)

			node.classList.remove(DRAGGED)
			dragged = null
		},
	}

	for (const [type, listener] of Object.entries(listeners)) node.addEventListener(type, listener as EventListener)

	return {
		update(next) {
			onDrop = next
		},
		destroy() {
			for (const [type, listener] of Object.entries(listeners))
				node.removeEventListener(type, listener as EventListener)
		},
	}
}
