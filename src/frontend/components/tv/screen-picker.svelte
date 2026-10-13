<script lang="ts">
	import { TV_COUNT } from '#shared/constants.ts'
	import { remoteKey } from '#shared/remote.ts'

	const screens = Array.from({ length: TV_COUNT }, (_, index) => index + 1)

	// Выбор живёт в состоянии, а не в :focus: браузеры телевизоров ненадёжно работают с фокусом.
	let selected = $state(0)

	function onKeydown(event: KeyboardEvent) {
		const key = remoteKey(event)

		if (key === 'left' || key === 'right') {
			event.preventDefault()
			selected = Math.min(Math.max(selected + (key === 'left' ? -1 : 1), 0), screens.length - 1)
		}

		if (key === 'enter') {
			event.preventDefault()
			location.href = `/tv/${screens[selected]}`
		}
	}
</script>

<svelte:window onkeydown={onKeydown} />

<div class="screen-picker">
	{#each screens as screen, index (screen)}
		<a
			class="screen-picker__screen"
			class:screen-picker__screen--selected={index === selected}
			href="/tv/{screen}"
			onmouseenter={() => (selected = index)}
		>
			<span class="screen-picker__number">{screen}</span>
			<span class="screen-picker__label">Экран {screen}</span>
		</a>
	{/each}
</div>

<style>
	.screen-picker {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1920rem;
		height: 1080rem;
		background-color: #131111;

		&__screen {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			width: 560rem;
			height: 560rem;
			/* Flex gap появился в Chromium 84, отступы работают везде. */
			margin: 0 60rem;
			border: 8rem solid transparent;
			border-radius: 24rem;
			color: #7e7c7c;
			text-decoration: none;
			background-color: #1e1919;
			transition:
				transform 0.15s ease-out,
				border-color 0.15s ease-out;
		}

		&__screen--selected {
			transform: scale(1.05);
			border-color: #d1d1d1;
			color: #d1d1d1;
		}

		&__number {
			font-family: Blinker, sans-serif;
			font-size: 320rem;
			font-weight: 700;
			line-height: 1;
		}

		&__label {
			font-size: 56rem;
		}
	}
</style>
