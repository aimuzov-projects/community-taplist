// Браузер LG webOS 5 -- Chromium 68. Синтаксис сборка опускает сама, а этих API
// рантайма Svelte в нём нет. replaceAll Svelte зовёт со строкой или с /g-регуляркой.
//
// Файлом, а не инлайн-скриптом потому что is:inline скрипты Astro не хеширует
// для своей CSP. Инлайн-тело блокируется, а файл с того же origin проходит по 'self'.
if (typeof globalThis === 'undefined') window.globalThis = window

if (!window.queueMicrotask)
	window.queueMicrotask = function (callback) {
		Promise.resolve().then(callback)
	}

if (!String.prototype.replaceAll)
	String.prototype.replaceAll = function (pattern, replacement) {
		if (pattern instanceof RegExp) return this.replace(pattern, replacement)

		return this.split(pattern).join(replacement)
	}
