// Только interface сливается с ImportMetaEnv из Vite, type объявить второй раз нельзя.
// oxlint-disable-next-line typescript/consistent-type-definitions
interface ImportMetaEnv {
	/** Метка сборки из astro.config.mjs. */
	readonly BUILD_VERSION: string
	/** Как часто табло забирает свежий список, в миллисекундах. */
	readonly PUBLIC_DATA_UPDATE_INTERVAL?: string
}
