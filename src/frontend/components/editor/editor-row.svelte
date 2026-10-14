<script lang="ts">
	import Eraser from '@lucide/svelte/icons/eraser'
	import GripVertical from '@lucide/svelte/icons/grip-vertical'
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw'

	import { isEmptyItem, type Item } from '#shared/types.ts'

	import Cover from './cover.svelte'
	import { draggable, type OnDragDrop } from './draggable.ts'
	import { tooltip } from './tooltip.ts'

	let {
		item = $bindable(),
		index,
		changed,
		onDragDrop,
	}: {
		item: Item
		index: number
		changed: boolean
		onDragDrop: OnDragDrop
	} = $props()

	const empty = $derived(isEmptyItem(item))

	// Стёртое живёт только в памяти строки: после перезагрузки восстановить нечего.
	let erased: Item | null = $state(null)

	// Поля меняются по одному, а не заменой объекта: по нему строка отслеживается в списке.
	function fill(from: Item) {
		item.cover = from.cover
		item.name = from.name
		item.brewery = from.brewery
		item.style = from.style
		item.attrs = { ...from.attrs }
	}

	function clear() {
		erased = $state.snapshot(item)
		fill({ cover: '', name: '', brewery: '', style: '', attrs: { alc: '', ibu: '', price04: '', price025: '' } })
	}

	function restore() {
		if (erased) fill(erased)

		erased = null
	}
</script>

<div
	class="editor-row"
	class:editor-row--changed={changed}
	class:editor-row--empty={empty}
	use:draggable={onDragDrop}
	data-index={index}
>
	<div class="editor-row__number" use:tooltip={'Перетащите строку за номер, чтобы поменять краны местами'}>
		<span class="editor-row__grip"><GripVertical size={16} /></span>
		{index + 1}
	</div>

	<Cover bind:cover={item.cover} />

	<input
		class="editor-row__input editor-row__input--name"
		type="text"
		placeholder="Название"
		bind:value={item.name}
	/>
	<input class="editor-row__input" type="text" placeholder="Пивоварня" bind:value={item.brewery} />
	<input class="editor-row__input" type="text" placeholder="Стиль" bind:value={item.style} />
	<input
		class="editor-row__input editor-row__input--number"
		type="text"
		maxlength="3"
		aria-label="Горечь крана {index + 1}, IBU"
		bind:value={item.attrs.ibu}
	/>
	<input
		class="editor-row__input editor-row__input--number"
		type="text"
		maxlength="5"
		aria-label="Крепость крана {index + 1}, %"
		bind:value={item.attrs.alc}
	/>
	<input
		class="editor-row__input editor-row__input--number"
		type="text"
		maxlength="4"
		aria-label="Цена крана {index + 1} за 0,4 л, ₽"
		bind:value={item.attrs.price04}
	/>
	<input
		class="editor-row__input editor-row__input--number"
		type="text"
		maxlength="4"
		aria-label="Цена крана {index + 1} за 0,25 л, ₽"
		bind:value={item.attrs.price025}
	/>
	{#if !empty}
		<button
			class="editor-row__action editor-row__action--clear"
			type="button"
			use:tooltip={'Стереть кран: на табло он станет «Скоро новое»'}
			aria-label="Очистить кран {index + 1}"
			onclick={clear}
		>
			<Eraser size={18} />
		</button>
	{:else if erased}
		<button
			class="editor-row__action editor-row__action--restore"
			type="button"
			use:tooltip={`Вернуть «${erased.name}», как было до стирания`}
			aria-label="Восстановить кран {index + 1}"
			onclick={restore}
		>
			<RotateCcw size={18} />
		</button>
	{:else}
		<span></span>
	{/if}
</div>

<style>
	.editor-row {
		/* Полоска изменений и контур пустого крана -- внутренние тени: обе ложатся от самого края
		   блока и не сдвигают содержимое. */
		--edge: transparent;
		--outline: transparent;
		display: grid;
		grid-template-columns: var(--editor-columns);
		gap: 12px;
		align-items: center;

		margin-bottom: 6px;
		padding: 8px 14px 8px 17px;
		border-radius: 10px;
		background: #1c1716;
		box-shadow:
			inset 3px 0 0 var(--edge),
			inset 0 0 0 1px var(--outline);
		transition: background-color 0.15s;

		&:hover {
			background: #231d1b;
		}

		/* Классы перетаскивания ставит draggable.ts, Svelte о них не знает. */
		:global(.editor-dragging) & * {
			pointer-events: none;
		}

		&__number {
			cursor: grab;
			display: flex;
			gap: 8px;
			align-items: center;
			font-family: Blinker, sans-serif;
			font-size: 24px;
			font-weight: 700;
			color: #8a7e72;
		}

		&__grip {
			display: flex;
			color: #4a403b;
		}

		&__action {
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 32px;
			height: 32px;
			padding: 0;
			border: none;
			border-radius: 6px;
			color: #8a7e72;
			background: transparent;
			transition:
				color 0.15s,
				background-color 0.15s;

			&:hover {
				background: #2a2220;
			}
		}

		&__action--clear:hover {
			color: #e5735c;
		}

		&__action--restore {
			color: #e0a458;
		}

		&__input {
			min-width: 0;
			padding: 8px 10px;
			border: 1px solid #2e2725;
			border-radius: 6px;
			font: inherit;
			font-size: 15px;
			color: #f1e6d3;
			background: #131111;
			transition: border-color 0.15s;

			/* На телефоне от 16px, иначе Safari приближает поле — см. global.css. */
			@media (--touch) {
				font-size: 16px;
			}

			&::placeholder {
				color: #4a403b;
			}

			&:hover {
				border-color: #4a403b;
			}

			&:focus {
				border-color: #e0a458;
				outline: none;
			}
		}

		&__input--name {
			font-size: 17px;
			font-weight: 700;
		}

		&__input--number {
			font-variant-numeric: tabular-nums;
			text-align: right;
		}
	}

	/* Свободный кран: без подложки, только контур, чтобы пустые места бросались в глаза. */
	.editor-row--empty {
		--outline: #2e2725;

		background: transparent;

		& .editor-row__number {
			color: #4a403b;
		}
	}

	.editor-row--changed {
		--edge: #e0a458;
	}

	:global(.editor-row--dragged) {
		opacity: 0.4;
	}

	:global(.editor-row--over) {
		--outline: #e0a458;
	}
</style>
