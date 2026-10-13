<script lang="ts">
	import { onMount } from 'svelte'

	import type { Item } from '#shared/types.ts'

	import EditorRow from './editor-row.svelte'

	let items: Item[] = $state([])
	let saved = $state('')
	let loading = $state(true)
	let saving = $state(false)

	const modified = $derived(!loading && JSON.stringify(items) !== saved)

	function apply(next: Item[]) {
		items = next
		saved = JSON.stringify(next)
	}

	async function request(init?: RequestInit) {
		const response = await fetch('/api/items', { cache: 'no-store', ...init })
		if (!response.ok) throw new Error(`${response.status} ${(await response.json().catch(() => ({}))).error ?? ''}`)
		return ((await response.json()) as { items: Item[] }).items
	}

	async function save(event: SubmitEvent) {
		event.preventDefault()
		saving = true

		try {
			apply(
				await request({
					method: 'PUT',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify(items),
				}),
			)
		} catch (error) {
			alert(`Не удалось сохранить: ${(error as Error).message}`)
		} finally {
			saving = false
		}
	}

	function onDragDrop(current: number, next: number) {
		;[items[current], items[next]] = [items[next], items[current]]
	}

	function onBeforeUnload(event: BeforeUnloadEvent) {
		if (modified) event.preventDefault()
	}

	onMount(() => {
		request()
			.then(apply)
			.catch((error) => alert(`Не удалось загрузить таплист: ${error.message}`))
			.finally(() => (loading = false))
	})
</script>

<svelte:window onbeforeunload={onBeforeUnload} />

<form class="editor" onsubmit={save}>
	{#if modified}
		<button class="editor__save" class:editor__save--busy={saving} disabled={saving} type="submit">Сохранить</button
		>
	{/if}

	<h1 class="editor__heading">Таплист</h1>

	{#if loading}
		<p class="editor__status">Загрузка…</p>
	{:else}
		<div class="editor__table">
			<div class="editor__head">
				<div class="editor__head-cell editor__head-cell--number">#</div>
				<div class="editor__head-cell editor__head-cell--cover"></div>
				<div class="editor__head-cell editor__head-cell--name">Название</div>
				<div class="editor__head-cell">Пивоварня</div>
				<div class="editor__head-cell">Стиль</div>
				<div class="editor__head-cell editor__head-cell--meta">IBU</div>
				<div class="editor__head-cell editor__head-cell--meta">ALC</div>
				<div class="editor__head-cell editor__head-cell--meta">0.4</div>
				<div class="editor__head-cell editor__head-cell--meta">0.25</div>
			</div>

			{#each items as item, index (item)}
				<EditorRow bind:item={items[index]} {index} {onDragDrop} />
			{/each}
		</div>
	{/if}
</form>

<style>
	.editor {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-height: 100vh;
		padding: 0 25px 50px;
		background-color: #2b2d42;

		&__heading {
			margin: 25px 0;
			font-size: 48px;
			font-weight: 400;
			color: #8d99ae;
			text-align: center;
		}

		&__status {
			color: #8d99ae;
		}

		&__save {
			cursor: pointer;
			position: fixed;
			z-index: 2;
			top: 0;
			left: 0;
			display: block;
			padding: 10px 20px 15px;
			border: none;
			font-size: 32px;
			line-height: 1;
			color: #fff;
			text-align: center;
			background-color: rgb(35 193 54 / 90%);
			box-shadow: 0 10px 20px rgb(0 0 0 / 30%);

			&:hover {
				background-color: rgb(65 245 87);
			}

			&:disabled {
				cursor: not-allowed;
			}
		}

		&__save--busy {
			animation: busy 1s infinite;
		}

		&__table {
			background-color: #fff;
		}

		&__head {
			display: flex;
		}

		&__head-cell {
			width: 140px;
			height: 50px;
			font-size: 18px;
			font-weight: 700;
			line-height: 50px;
			color: #343a40;
			text-align: center;
			text-transform: uppercase;
		}

		&__head-cell--number {
			width: 50px;
			font-size: 32px;
		}

		&__head-cell--cover {
			width: 50px;
		}

		&__head-cell--name {
			width: 200px;
		}

		&__head-cell--meta {
			width: 80px;
		}
	}

	@keyframes busy {
		0%,
		100% {
			background-color: #f4a261;
		}

		50% {
			background-color: #e76f51;
		}
	}
</style>
