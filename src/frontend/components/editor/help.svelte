<script lang="ts">
	import X from '@lucide/svelte/icons/x'

	let dialog: HTMLDialogElement

	export function open() {
		dialog.showModal()
	}

	// Клик по подложке приходит на сам dialog, клик по содержимому -- на его детей.
	function onclick(event: MouseEvent) {
		if (event.target === dialog) dialog.close()
	}
</script>

<dialog class="help" bind:this={dialog} {onclick} aria-labelledby="help-title">
	<div class="help__body">
		<header class="help__header">
			<h2 class="help__title" id="help-title">Как пользоваться редактором</h2>
			<button class="help__close" type="button" aria-label="Закрыть" onclick={() => dialog.close()}>
				<X size={20} />
			</button>
		</header>

		<dl class="help__list">
			<dt class="help__term">Экраны</dt>
			<dd class="help__text">
				Краны 1–12 показывает первый телевизор, 13–24 второй. 25-й кран по очереди с 24-м появляется на
				последнем месте второго экрана. Остальные на табло не попадают.
			</dd>

			<dt class="help__term">Правка</dt>
			<dd class="help__text">
				Меняйте поля прямо в строке. Изменённая строка подсвечивается полосой слева. На телевизоры ничего не
				уходит, пока не нажата «Сохранить».
			</dd>

			<dt class="help__term">Порядок</dt>
			<dd class="help__text">Перетащите строку за номер, чтобы поменять два крана местами.</dd>

			<dt class="help__term">Обложка</dt>
			<dd class="help__text">
				Нажмите на картинку и выберите файл JPG или PNG. Он сам ужмётся до нужного размера.
			</dd>

			<dt class="help__term">Свободный кран</dt>
			<dd class="help__text">
				Ластик в конце строки стирает кран, на табло он станет «Скоро новое». Передумали -- на его месте
				появится «Восстановить», он работает до перезагрузки страницы.
			</dd>

			<dt class="help__term">Отменить</dt>
			<dd class="help__text">Возвращает весь список к последнему сохранению.</dd>

			<dt class="help__term">Табло</dt>
			<dd class="help__text">Телевизоры подхватывают сохранённый список сами, примерно за минуту.</dd>
		</dl>
	</div>
</dialog>

<style>
	.help {
		width: min(560px, calc(100vw - 32px));
		padding: 0;
		border: 1px solid #2e2725;
		border-radius: 14px;
		color: #f1e6d3;
		background: #1c1716;
		box-shadow: 0 24px 80px rgb(0 0 0 / 60%);

		&::backdrop {
			background: rgb(0 0 0 / 55%);
			backdrop-filter: blur(2px);
		}

		&__body {
			padding: 24px 28px 28px;
		}

		&__header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 18px;
		}

		&__title {
			margin: 0;
			font-size: 22px;
			font-weight: 700;
		}

		&__close {
			cursor: pointer;
			display: flex;
			padding: 6px;
			border: none;
			border-radius: 6px;
			color: #8a7e72;
			background: transparent;

			&:hover {
				color: #f1e6d3;
				background: #2a2220;
			}
		}

		&__list {
			display: grid;
			grid-template-columns: max-content 1fr;
			gap: 12px 18px;
			margin: 0;
		}

		&__term {
			font-size: 13px;
			font-weight: 700;
			line-height: 22px;
			color: #e0a458;
			text-transform: uppercase;
			letter-spacing: 0.12em;
		}

		&__text {
			margin: 0;
			font-size: 15px;
			line-height: 1.5;
			color: #cfc3b3;
		}
	}
</style>
