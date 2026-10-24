<script lang="ts">
	import Beer from '@lucide/svelte/icons/beer'
	import CircleAlert from '@lucide/svelte/icons/circle-alert'
	import CircleCheck from '@lucide/svelte/icons/circle-check'
	import CircleQuestionMark from '@lucide/svelte/icons/circle-question-mark'
	import EyeOff from '@lucide/svelte/icons/eye-off'
	import Repeat from '@lucide/svelte/icons/repeat'
	import Save from '@lucide/svelte/icons/save'
	import Tv from '@lucide/svelte/icons/tv'
	import Undo2 from '@lucide/svelte/icons/undo-2'
	import Credit from '@aimuzov/infra-site-kit/credit.svelte'
	import { onMount } from 'svelte'

	import Spinner from '#frontend/components/spinner.svelte'
	import { tapGroup } from '#frontend/lib/tap-groups.ts'
	import type { Item } from '#shared/types.ts'

	import EditorRow from './editor-row.svelte'
	import Help from './help.svelte'
	import { tooltip } from './tooltip.ts'

	const groupHints = {
		screen: 'Эти краны показывает один телевизор, по порядку колонками сверху вниз',
		extra: 'Этот кран на табло по очереди сменяется с 24-м на последнем месте второго экрана',
		hidden: 'Мест на табло больше нет: эти краны хранятся в списке, но не показываются',
	}

	let help: Help

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

		return response.json()
	}

	async function save(event: SubmitEvent) {
		event.preventDefault()
		saving = true
		error = ''

		// Сохранённым считается отправленное: правки, сделанные во время запроса, останутся несохранёнными.
		const sent = $state.snapshot(items)

		try {
			await request({
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(sent),
			})

			saved = sent
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
			.then(({ items }: { items: Item[] }) => apply(items))
			.catch((reason) => (error = `Не загрузился таплист: ${reason.message}`))
			.finally(() => (loading = false))
	})
</script>

<svelte:window onbeforeunload={onBeforeUnload} />

<form class="editor" onsubmit={save}>
	<header class="editor__bar">
		<div class="editor__brand">
			<span class="editor__logo"><Beer size={28} /></span>
			<span class="editor__title">Таплист</span>
			<span class="editor__subtitle">редактор</span>
			<a
				class="editor__version"
				href="/changelog"
				aria-label="Что нового в версии {import.meta.env.APP_VERSION}"
				use:tooltip={'Что нового'}>v{import.meta.env.APP_VERSION}</a
			>
		</div>

		<p
			class="editor__status"
			class:editor__status--dirty={modified}
			class:editor__status--error={error}
			use:tooltip={modified
				? 'Табло показывают прежний список, пока правки не сохранены'
				: 'Табло показывают то же, что здесь'}
		>
			{#if error}
				<CircleAlert size={16} />{error}
			{:else if modified}
				<CircleAlert size={16} />Есть несохранённые изменения
			{:else if !loading}
				<CircleCheck size={16} />Все изменения сохранены
			{/if}
		</p>

		<div class="editor__actions">
			<button
				class="editor__button editor__button--icon"
				type="button"
				aria-label="Как пользоваться редактором"
				use:tooltip={'Как пользоваться редактором'}
				onclick={() => help.open()}
			>
				<CircleQuestionMark size={18} />
			</button>
			<button
				class="editor__button"
				type="button"
				disabled={!modified || saving}
				use:tooltip={'Вернуть весь список к последнему сохранению'}
				onclick={revert}
			>
				<Undo2 size={18} />Отменить
			</button>
			<button
				class="editor__button editor__button--primary"
				class:editor__button--busy={saving}
				type="submit"
				disabled={!modified || saving}
				use:tooltip={'Отправить список на табло, телевизоры обновятся примерно за минуту'}
			>
				<Save size={18} />{saving ? 'Сохраняю…' : 'Сохранить'}
			</button>
		</div>
	</header>

	{#if loading}
		<div class="editor__loading"><Spinner size="large" /></div>
	{:else}
		<div class="editor__list">
			<div class="editor__head">
				<span use:tooltip={'Номер крана: он же стоит на обложке на табло'}>#</span>
				<span></span>
				<span>Название</span>
				<span>Пивоварня</span>
				<span>Стиль</span>
				<span class="editor__head-cell--right" use:tooltip={'Горечь. Если не знаете, оставьте пустым'}>IBU</span
				>
				<span class="editor__head-cell--right" use:tooltip={'Крепость, %'}>ALC</span>
				<span class="editor__head-cell--right" use:tooltip={'Цена за 0,4 л, ₽'}>0,4 ₽</span>
				<span class="editor__head-cell--right" use:tooltip={'Цена за 0,25 л, ₽'}>0,25 ₽</span>
				<span></span>
			</div>

			{#each items as item, index (item)}
				{@const group = tapGroup(index)}
				{#if group}
					{@const Icon = { screen: Tv, extra: Repeat, hidden: EyeOff }[group.kind]}
					<h2 class="editor__group">
						<span class="editor__group-label" use:tooltip={groupHints[group.kind]}>
							<Icon size={16} />{group.title}
						</span>
					</h2>
				{/if}
				<EditorRow bind:item={items[index]} {index} changed={isChanged(index)} {onDragDrop} />
			{/each}
		</div>
	{/if}

	<footer class="editor__footer">
		<Credit repo="https://github.com/aimuzov/community-taplist" />
	</footer>
</form>

<Help bind:this={help} />

<style>
	.editor {
		--bg: #131111;
		--surface: #1c1716;
		--line: #2e2725;
		--fg: #f1e6d3;
		--muted: #8a7e72;
		--accent: #e0a458;
		--danger: #e5735c;

		/* Колонка на весь экран: спиннер загрузки встаёт в середину свободного места,
		   футер прижимается к нижнему краю, пока список короче экрана. */
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		min-height: 100dvh;
		color: var(--fg);
		background: var(--bg);

		&__bar {
			position: sticky;
			z-index: 2;
			top: 0;
			display: flex;
			gap: 24px;
			align-items: center;
			height: var(--bar-height);
			padding: 0 32px;
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
			display: flex;
			align-self: center;
			color: var(--accent);
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

		&__version {
			font-size: 13px;
			color: var(--muted);
			text-decoration: none;

			&:hover,
			&:focus-visible {
				color: var(--fg);
			}
		}

		&__status {
			display: flex;
			flex: 1;
			gap: 6px;
			align-items: center;
			justify-content: flex-end;
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
			display: inline-flex;
			gap: 8px;
			align-items: center;
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

		&__button--icon {
			padding: 9px;
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
			flex: 1;
			align-items: center;
			justify-content: center;
		}

		/* Ширина явно: в колонке auto-отступы иначе ужимают блок по содержимому. */
		&__list {
			width: 100%;
			max-width: 1240px;
			margin: 0 auto;
			padding: 24px 32px 64px;
		}

		&__footer {
			/* Ссылки подписи из infra-site-kit при наведении светлеют до цвета текста. */
			--credit-hover: var(--fg);

			width: 100%;
			max-width: 1240px;
			margin: auto auto 0;
			padding: 20px 32px;
			border-top: 1px solid var(--line);
			font-size: 13px;
			color: var(--muted);
		}

		/* Шапка таблицы прилипает под верхней панелью и просвечивает, чтобы строки под ней угадывались. */
		&__head {
			position: sticky;
			z-index: 1;
			top: var(--bar-height);
			display: grid;
			grid-template-columns: var(--editor-columns);
			gap: 12px;
			margin: 0 -14px;
			padding: 12px 28px 10px;
			border-bottom: 1px solid var(--line);
			font-size: 12px;
			font-weight: 700;
			color: var(--muted);
			text-transform: uppercase;
			letter-spacing: 0.12em;
			background: rgb(19 17 17 / 75%);
			backdrop-filter: blur(8px);
		}

		&__head-cell--right {
			text-align: right;
		}

		/* В узком окне подписи колонок иначе наезжают друг на друга. */
		&__head > * {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		&__group {
			margin: 28px 0 10px;
			font-size: 14px;
			font-weight: 700;
			color: var(--accent);
			text-transform: uppercase;
			letter-spacing: 0.18em;
		}

		/* Подсказка висит на подписи, а не на всей строке заголовка до правого края. */
		&__group-label {
			cursor: help;
			display: inline-flex;
			gap: 8px;
			align-items: center;
		}
	}

	/* Колонки шапки и строк должны совпадать, поэтому сетка общая. */
	:global(:root) {
		--editor-columns: 56px 48px minmax(0, 2fr) minmax(0, 1.2fr) minmax(0, 1.2fr) 64px 64px 72px 72px 32px;
		--bar-height: 68px;
	}

	/* Плашку подсказки tooltip.ts вешает прямо в body, поэтому стили у неё глобальные. */
	:global(.editor-tooltip) {
		pointer-events: none;
		position: fixed;
		z-index: 10;
		max-width: 280px;
		padding: 7px 10px;
		border: 1px solid #3a3230;
		border-radius: 8px;
		font-family: Arsenal, sans-serif;
		font-size: 14px;
		line-height: 1.35;
		color: #f1e6d3;
		opacity: 0;
		background: #241e1c;
		box-shadow: 0 8px 24px rgb(0 0 0 / 50%);
		transition: opacity 0.12s;
	}

	:global(.editor-tooltip--visible) {
		opacity: 1;
	}

	@keyframes busy {
		50% {
			opacity: 0.6;
		}
	}
</style>
