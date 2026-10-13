<script lang="ts">
	import type { Item } from '#shared/types.ts'

	import Cover from './cover.svelte'
	import { draggable, type OnDragDrop } from './draggable.ts'

	let {
		item = $bindable(),
		index,
		onDragDrop,
	}: {
		item: Item
		index: number
		onDragDrop: OnDragDrop
	} = $props()

	const number = $derived(index + 1)
</script>

<div class="editor-row" class:editor-row--even={number % 2 === 0} use:draggable={onDragDrop} data-index={index}>
	<div class="editor-row__number">{number}</div>

	<Cover bind:cover={item.cover} />

	<div class="editor-row__cell editor-row__cell--name">
		<input class="editor-row__input" type="text" bind:value={item.name} />
	</div>
	<div class="editor-row__cell">
		<input class="editor-row__input" type="text" bind:value={item.brewery} />
	</div>
	<div class="editor-row__cell">
		<input class="editor-row__input" type="text" bind:value={item.style} />
	</div>
	<div class="editor-row__cell editor-row__cell--meta">
		<input class="editor-row__input" type="text" maxlength="3" bind:value={item.attrs.ibu} />
	</div>
	<div class="editor-row__cell editor-row__cell--meta">
		<input class="editor-row__input" type="text" maxlength="5" bind:value={item.attrs.alc} />
	</div>
	<div class="editor-row__cell editor-row__cell--meta">
		<input class="editor-row__input" type="text" maxlength="4" bind:value={item.attrs.price04} />
	</div>
	<div class="editor-row__cell editor-row__cell--meta">
		<input class="editor-row__input" type="text" maxlength="4" bind:value={item.attrs.price025} />
	</div>
</div>

<style>
	.editor-row {
		display: flex;
		align-items: center;
		height: 50px;
		color: #161a1d;
		background-color: #f8f9fa;

		&:hover {
			cursor: pointer;
			background-color: rgb(225 234 90 / 30%);
		}

		/* Классы перетаскивания ставит draggable.ts, Svelte о них не знает. */
		:global(.editor-dragging) & * {
			pointer-events: none;
		}

		&__number {
			cursor: grab;
			width: 50px;
			font-size: 32px;
			font-weight: 600;
			color: #495057;
			text-align: center;
		}

		&__cell {
			flex-grow: 1;
			flex-shrink: 0;
			width: 140px;
			padding: 0 10px;
		}

		&__cell--name {
			width: 200px;
		}

		&__cell--meta {
			width: 80px;
		}

		&__input {
			width: 100%;
			padding: 8px;
			border: 1px solid #dee2e6;
			font-size: 14px;
			background: #fff;
		}
	}

	.editor-row--even {
		background-color: #e9ecef;
	}

	:global(.editor-row--dragged) {
		opacity: 0.5;
	}

	:global(.editor-row--over) {
		transform: scale(1.05);
		box-shadow: 0 0 20px rgb(0 0 0 / 50%);
	}
</style>
