<script lang="ts">
	import { onMount } from 'svelte'

	import { groupTitle } from '#frontend/lib/tap-groups.ts'
	import type { Item } from '#shared/types.ts'

	import EditorRow from './editor-row.svelte'
	import Spinner from './spinner.svelte'

	let items: Item[] = $state([])
	let saved: Item[] = $state([])
	let loading = $state(true)
	let saving = $state(false)
	let error = $state('')

	const savedJson = $derived(JSON.stringify(saved))
	const modified = $derived(!loading && JSON.stringify(items) !== savedJson)

	function apply(next: Item[]) {
		items = next
		saved = structuredClone(next)
	}

	function isChanged(index: number) {
		return JSON.stringify(items[index]) !== JSON.stringify(saved[index])
	}

	async function request(init?: RequestInit) {
		const response = await fetch('/api/items', { cache: 'no-store', ...init })
		if (!response.ok) throw new Error(`${response.status} ${(await response.json().catch(() => ({}))).error ?? ''}`)
		return ((await response.json()) as { items: Item[] }).items
	}

	async function save(event: SubmitEvent) {
		event.preventDefault()
		saving = true
		error = ''

		try {
			apply(
				await request({
					method: 'PUT',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify(items),
				}),
			)
		} catch (reason) {
			error = `Не сохранилось: ${(reason as Error).message}`
		} finally {
			saving = false
		}
	}

	function revert() {
		items = structuredClone($state.snapshot(saved))
		error = ''
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
			.catch((reason) => (error = `Не загрузился таплист: ${reason.message}`))
			.finally(() => (loading = false))
	})
</script>

<svelte:window onbeforeunload={onBeforeUnload} />

<form class="editor" onsubmit={save}>
	<header class="editor__bar">
		<div class="editor__brand">
			<svg class="editor__logo" viewBox="0 0 48 48" aria-hidden="true">
				<path d="M9 16h24v24a4 4 0 0 1-4 4H13a4 4 0 0 1-4-4z" />
				<path d="M33 21h4a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4h-4" />
				<path d="M9 16a5 5 0 0 1 4-8 6 6 0 0 1 10-2 5 5 0 0 1 8 3 4 4 0 0 1 2 7" />
				<path d="M16 24v12M21 24v12M26 24v12" />
			</svg>
			<span class="editor__title">Таплист</span>
			<span class="editor__subtitle">редактор</span>
		</div>

		<p class="editor__status" class:editor__status--dirty={modified} class:editor__status--error={error}>
			{#if error}
				{error}
			{:else if loading}
				Загрузка…
			{:else if modified}
				Есть несохранённые изменения
			{:else}
				Все изменения сохранены
			{/if}
		</p>

		<div class="editor__actions">
			<button class="editor__button" type="button" disabled={!modified || saving} onclick={revert}
				>Отменить</button
			>
			<button
				class="editor__button editor__button--primary"
				class:editor__button--busy={saving}
				type="submit"
				disabled={!modified || saving}
			>
				{saving ? 'Сохраняю…' : 'Сохранить'}
			</button>
		</div>
	</header>

	{#if loading}
		<div class="editor__loading"><Spinner large /></div>
	{:else}
		<div class="editor__list">
			<div class="editor__head">
				<span>#</span>
				<span></span>
				<span>Название</span>
				<span>Пивоварня</span>
				<span>Стиль</span>
				<span class="editor__head-cell--right">IBU</span>
				<span class="editor__head-cell--right">ALC</span>
				<span class="editor__head-cell--right">0,4</span>
				<span class="editor__head-cell--right">0,25</span>
			</div>

			{#each items as item, index (item)}
				{@const title = groupTitle(index)}
				{#if title}
					<h2 class="editor__group">{title}</h2>
				{/if}
				<EditorRow bind:item={items[index]} {index} changed={isChanged(index)} {onDragDrop} />
			{/each}
		</div>
	{/if}
</form>

<style>
	.editor {
		--bg: #131111;
		--surface: #1c1716;
		--line: #2e2725;
		--fg: #f1e6d3;
		--muted: #8a7e72;
		--accent: #e0a458;
		--danger: #e5735c;

		min-height: 100vh;
		color: var(--fg);
		background: var(--bg);

		&__bar {
			position: sticky;
			z-index: 2;
			top: 0;
			display: flex;
			gap: 24px;
			align-items: center;
			padding: 14px 32px;
			border-bottom: 1px solid var(--line);
			background: rgb(19 17 17 / 92%);
			backdrop-filter: blur(8px);
		}

		&__brand {
			display: flex;
			gap: 10px;
			align-items: baseline;
		}

		&__logo {
			align-self: center;
			width: 28px;
			height: 28px;
			fill: none;
			stroke: var(--accent);
			stroke-linecap: round;
			stroke-linejoin: round;
			stroke-width: 2.6;
		}

		&__title {
			font-size: 26px;
			font-weight: 700;
		}

		&__subtitle {
			font-size: 13px;
			font-weight: 700;
			color: var(--accent);
			text-transform: uppercase;
			letter-spacing: 0.2em;
		}

		&__status {
			flex: 1;
			margin: 0;
			font-size: 15px;
			color: var(--muted);
			text-align: right;
		}

		&__status--dirty {
			color: var(--accent);
		}

		&__status--error {
			color: var(--danger);
		}

		&__actions {
			display: flex;
			gap: 10px;
		}

		&__button {
			cursor: pointer;
			padding: 9px 18px;
			border: 1px solid var(--line);
			border-radius: 8px;
			font: inherit;
			font-size: 16px;
			font-weight: 700;
			color: var(--fg);
			background: transparent;
			transition:
				background-color 0.15s,
				border-color 0.15s,
				opacity 0.15s;

			&:hover:not(:disabled) {
				border-color: var(--muted);
			}

			&:disabled {
				cursor: default;
				opacity: 0.35;
			}
		}

		&__button--primary {
			border-color: var(--accent);
			color: #1a1210;
			background: var(--accent);

			&:hover:not(:disabled) {
				border-color: #ecb877;
				background: #ecb877;
			}
		}

		&__button--busy {
			animation: busy 1s ease-in-out infinite;
		}

		&__loading {
			display: flex;
			justify-content: center;
			padding-top: 120px;
		}

		&__list {
			max-width: 1240px;
			margin: 0 auto;
			padding: 24px 32px 64px;
		}

		&__head {
			display: grid;
			grid-template-columns: var(--editor-columns);
			gap: 12px;
			padding: 0 14px 8px;
			font-size: 12px;
			font-weight: 700;
			color: var(--muted);
			text-transform: uppercase;
			letter-spacing: 0.12em;
		}

		&__head-cell--right {
			text-align: right;
		}

		&__group {
			margin: 28px 0 10px;
			font-size: 14px;
			font-weight: 700;
			color: var(--accent);
			text-transform: uppercase;
			letter-spacing: 0.18em;
		}
	}

	/* Колонки шапки и строк должны совпадать, поэтому сетка общая. */
	:global(:root) {
		--editor-columns: 56px 48px minmax(0, 2fr) minmax(0, 1.2fr) minmax(0, 1.2fr) 64px 64px 72px 72px;
	}

	@keyframes busy {
		50% {
			opacity: 0.6;
		}
	}
</style>
