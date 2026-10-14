<script lang="ts">
	import { onMount } from 'svelte'

	import Spinner from '#frontend/components/spinner.svelte'
	import { BUILD_VERSION } from '#frontend/lib/build.ts'
	import { tvColumns } from '#shared/tv.ts'
	import type { Item } from '#shared/types.ts'

	import TapItem from './tap-item.svelte'

	let { tv }: { tv: number } = $props()

	const intervalMs = Number(import.meta.env.PUBLIC_DATA_UPDATE_INTERVAL) || 60_000

	let items: Item[] = $state([])
	let loaded = $state(false)
	const columns = $derived(tvColumns(tv, items))

	// После деплоя старая страница не найдёт новых чанков: один раз перезагружаемся.
	async function isOutdated() {
		const response = await fetch('/version.json', { cache: 'no-store' })

		if (!response.ok) return false

		const { version } = (await response.json()) as { version: string }

		return version !== BUILD_VERSION
	}

	async function refresh() {
		if (await isOutdated()) {
			location.reload()

			return
		}

		const response = await fetch('/api/items', { cache: 'no-store' })

		if (!response.ok) throw new Error(`API ответил ${response.status}`)

		// Обновляем табло на месте, без мигания полной перезагрузки. При ошибке остаётся прежний список.
		items = ((await response.json()) as { items: Item[] }).items
		loaded = true
	}

	onMount(() => {
		refresh().catch(console.error)
		const intervalId = setInterval(() => refresh().catch(console.error), intervalMs)

		return () => clearInterval(intervalId)
	})
</script>

<div class="tap-board" class:tap-board--loading={!loaded}>
	{#if !loaded}
		<Spinner size="board" />
	{/if}

	{#each columns as column, index (index)}
		<div class="tap-board__column">
			{#each column as [primary, secondary] (primary.number)}
				<div class="tap-board__card">
					<TapItem item={primary} />

					{#if secondary}
						<div class="tap-board__secondary"><TapItem item={secondary} /></div>
					{/if}
				</div>
			{/each}
		</div>
	{/each}
</div>

<style>
	.tap-board {
		overflow: hidden;
		display: flex;
		width: 1920rem;
		height: 1080rem;
		background-color: #131111;

		&--loading {
			align-items: center;
			justify-content: center;
		}

		&__card {
			position: relative;
		}

		&__secondary {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			opacity: 0;
			animation: shuffle 12s infinite;
		}
	}

	@keyframes shuffle {
		0%,
		20% {
			opacity: 0;
		}

		40%,
		80% {
			opacity: 1;
		}

		100% {
			opacity: 0;
		}
	}
</style>
