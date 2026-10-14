<script lang="ts">
	import { onMount } from 'svelte'

	import { randomPhrase } from '#frontend/lib/empty-tap-phrases.ts'
	import type { TapItem } from '#shared/tv.ts'
	import { isEmptyItem } from '#shared/types.ts'

	let { item }: { item: TapItem } = $props()

	let phrase = $state(randomPhrase())

	// Сдвиг у каждого крана свой, чтобы пустые краны не меняли фразы хором.
	onMount(() => {
		const intervalId = setInterval(() => (phrase = randomPhrase(phrase)), 30_000 + Math.random() * 15_000)

		return () => clearInterval(intervalId)
	})
</script>

<div class="tap-item">
	{#if isEmptyItem(item)}
		<div class="tap-item__inner tap-item__inner--empty">
			<div class="tap-item__cover tap-item__cover--empty">
				<div class="tap-item__number tap-item__number--empty">{item.number}</div>
			</div>
			<div class="tap-item__name">
				<div class="tap-item__name-text tap-item__name-text--empty">{phrase.title}</div>
			</div>
			<div class="tap-item__origin">{phrase.note}</div>
		</div>
	{:else}
		<div class="tap-item__inner">
			<div class="tap-item__cover" style:background-image="url({item.cover})">
				<div class="tap-item__number">{item.number || '?'}</div>
			</div>

			<div class="tap-item__name"><div class="tap-item__name-text">{item.name}</div></div>
			<div class="tap-item__origin">{[item.brewery, item.style].filter(Boolean).join(' • ')}</div>

			<div class="tap-item__meta">
				<div class="tap-item__strength">
					IBU {item.attrs.ibu || '---'}<br /> ALC {item.attrs.alc || '---'}
				</div>
				<div class="tap-item__price">
					0,4<br /> <span class="tap-item__price-value">{item.attrs.price04}</span>
				</div>
				<div class="tap-item__price">
					0,25<br /> <span class="tap-item__price-value">{item.attrs.price025}</span>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.tap-item {
		width: 640rem;
		height: 270rem;
		padding: 10rem;
		font-size: 16rem;

		&__inner {
			position: relative;
			width: 620rem;
			height: 250rem;
			padding-left: 216rem;
			border-radius: 10rem;
			background-color: #1e1919;
		}

		&__cover {
			position: absolute;
			top: 0;
			left: 0;
			width: 200rem;
			height: 250rem;
			border-radius: 10rem;
			background-position: center;
			background-size: cover;
		}

		&__number {
			width: 200rem;
			height: 250rem;
			font-family: Blinker, sans-serif;
			font-size: 150rem;
			font-weight: 700;
			line-height: 250rem;
			color: transparent;
			text-align: center;
			-webkit-text-stroke-width: 3rem;
			-webkit-text-stroke-color: #fff;
			text-shadow: rgb(0 0 0 / 15%) 4rem 4rem 7rem;
			background-image:
				linear-gradient(0deg, rgb(0 0 0 / 25%), rgb(0 0 0 / 25%)),
				linear-gradient(
					180deg,
					rgb(255 255 255 / 0%) 30.71%,
					rgb(89 89 89 / 12%) 56.96%,
					rgb(26 26 26 / 53%) 81.53%,
					#1a1a1a 107.22%
				);
		}

		&__name {
			display: flex;
			align-items: center;
			height: 110rem;
		}

		&__name-text {
			overflow: hidden;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			line-clamp: 2;
			height: 110rem;
			font-size: 62rem;
			font-weight: 700;
			line-height: 55rem;
			color: #d1d1d1;
		}

		&__origin {
			height: 48rem;
			font-size: 36rem;
			font-weight: 400;
			line-height: 42rem;
			color: #7e7c7c;
		}

		&__meta {
			display: flex;
		}

		&__strength {
			width: 160rem;
			font-size: 40rem;
			line-height: 38rem;
			color: #aaa;
		}

		&__price {
			width: 120rem;
			padding: 0 7rem 0 0;
			font-size: 30rem;
			line-height: 34rem;
			color: #aaa;
			text-align: right;
		}

		&__price-value {
			font-size: 55rem;
			font-weight: 700;
			color: #d1d1d1;
		}
	}

	/* Свободный кран: место видно, но не спорит с налитыми. */
	.tap-item__inner--empty {
		background-color: #171313;
	}

	.tap-item__cover--empty {
		border: 3rem dashed #3a3230;
		background: none;
	}

	.tap-item__number--empty {
		width: 194rem;
		height: 244rem;
		line-height: 244rem;
		-webkit-text-stroke-color: #4a403b;
		text-shadow: none;
		background: none;
	}

	.tap-item__name-text--empty {
		height: auto;
		font-weight: 400;
		color: #7e7c7c;
	}
</style>
