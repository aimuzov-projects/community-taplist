// LG webOS 5 browser is Chromium 68. The build lowers the syntax itself, but these Svelte
// runtime APIs are missing there. Svelte calls replaceAll with a string or a /g regex.
// A file rather than an inline script: Astro doesn't hash is:inline scripts for its CSP,
// so an inline body gets blocked, while a same-origin file passes through 'self'.
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
