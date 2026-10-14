<script lang="ts">
	import ImagePlus from '@lucide/svelte/icons/image-plus'

	import Spinner from '#frontend/components/spinner.svelte'

	import { tooltip } from './tooltip.ts'

	let { cover = $bindable() }: { cover: string } = $props()

	let input: HTMLInputElement
	let changing = $state(false)

	// Обложки лежат в gist как data URL, поэтому держим их маленькими.
	const COVER_SIZE_MAX = 250
	const COVER_QUALITY = 0.85

	async function toDataUrl(file: File) {
		const bitmap = await createImageBitmap(file)
		const ratio = Math.min(1, COVER_SIZE_MAX / bitmap.width, COVER_SIZE_MAX / bitmap.height)

		const canvas = document.createElement('canvas')

		canvas.width = Math.round(bitmap.width * ratio)
		canvas.height = Math.round(bitmap.height * ratio)
		canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
		bitmap.close()

		return canvas.toDataURL('image/jpeg', COVER_QUALITY)
	}

	function change(event: Event & { currentTarget: HTMLInputElement }) {
		const file = event.currentTarget.files?.[0]

		if (!file) return

		changing = true

		toDataUrl(file)
			.then((url) => (cover = url))
			.catch((error) => alert(`Не удалось обработать картинку: ${error}`))
			.finally(() => (changing = false))
	}
</script>

<button
	class="cover"
	type="button"
	aria-label={cover ? 'Заменить обложку' : 'Загрузить обложку'}
	use:tooltip={cover ? 'Заменить обложку: JPG или PNG, ужмётся сама' : 'Загрузить обложку: JPG или PNG'}
	onclick={() => input.click()}
	style:background-image="url({cover})"
>
	<input class="cover__input" type="file" accept=".jpg, .jpeg, .png" onchange={change} bind:this={input} />
	{#if cover}
		<img class="cover__preview" src={cover} alt="" />
	{:else}
		<span class="cover__empty"><ImagePlus size={20} /></span>
	{/if}

	{#if changing}
		<div class="cover__loading">
			<Spinner />
		</div>
	{/if}
</button>

<style>
	.cover {
		cursor: pointer;
		position: relative;
		display: block;
		width: 48px;
		height: 60px;
		padding: 0;
		border: none;
		border-radius: 6px;
		background-color: #131111;
		background-position: center;
		background-size: cover;
		box-shadow: inset 0 0 0 1px #2e2725;

		&:hover .cover__preview {
			opacity: 1;
		}

		&__input {
			display: none;
		}

		&__empty {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 100%;
			color: #4a403b;
		}

		&__preview {
			pointer-events: none;
			position: absolute;
			z-index: 3;
			top: 50%;
			left: calc(100% + 12px);
			transform: translateY(-50%);
			max-width: 200px;
			max-height: 250px;
			border-radius: 8px;
			opacity: 0;
			box-shadow: 0 12px 40px rgb(0 0 0 / 60%);
			transition: opacity 0.2s ease-out;
		}

		&__loading {
			position: absolute;
			top: 0;
			left: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			height: 100%;
			border-radius: 6px;
			background: rgb(19 17 17 / 85%);
		}
	}
</style>
