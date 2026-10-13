<script lang="ts">
	import { isEmptyItem, type Item } from '#shared/types.ts'

	import Cover from './cover.svelte'
	import { draggable, type OnDragDrop } from './draggable.ts'

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
</script>

<div
	class="editor-row"
	class:editor-row--changed={changed}
	class:editor-row--empty={isEmptyItem(item)}
	use:draggable={onDragDrop}
	data-index={index}
>
	<div class="editor-row__number" title="Перетащите, чтобы поменять местами">
		<svg class="editor-row__grip" viewBox="0 0 8 14" aria-hidden="true">
			<circle cx="2" cy="2" r="1.2" /><circle cx="6" cy="2" r="1.2" />
			<circle cx="2" cy="7" r="1.2" /><circle cx="6" cy="7" r="1.2" />
			<circle cx="2" cy="12" r="1.2" /><circle cx="6" cy="12" r="1.2" />
		</svg>
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
	<input class="editor-row__input editor-row__input--number" type="text" maxlength="3" bind:value={item.attrs.ibu} />
	<input class="editor-row__input editor-row__input--number" type="text" maxlength="5" bind:value={item.attrs.alc} />
	<input
		class="editor-row__input editor-row__input--number"
		type="text"
		maxlength="4"
		bind:value={item.attrs.price04}
	/>
	<input
		class="editor-row__input editor-row__input--number"
		type="text"
		maxlength="4"
		bind:value={item.attrs.price025}
	/>
</div>

<style>
	.editor-row {
		display: grid;
		grid-template-columns: var(--editor-columns);
		gap: 12px;
		align-items: center;
		margin-bottom: 6px;
		padding: 8px 14px;
		border-left: 3px solid transparent;
		border-radius: 10px;
		background: #1c1716;
		transition:
			background-color 0.15s,
			border-color 0.15s;

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
			width: 8px;
			height: 14px;
			fill: #4a403b;
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
		background: transparent;
		box-shadow: inset 0 0 0 1px #2e2725;

		& .editor-row__number {
			color: #4a403b;
		}
	}

	.editor-row--changed {
		border-left-color: #e0a458;
	}

	:global(.editor-row--dragged) {
		opacity: 0.4;
	}

	:global(.editor-row--over) {
		box-shadow: inset 0 0 0 1px #e0a458;
	}
</style>
