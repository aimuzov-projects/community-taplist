export type EmptyTapPhrase = {
	title: string
	note: string
}

// Длиннее карточка не вместит: заголовок -- две строки крупным шрифтом, подпись -- одна строка.
export const PHRASE_TITLE_MAX = 20
export const PHRASE_NOTE_MAX = 20

const nbsp = ' '

export const EMPTY_TAP_PHRASES: EmptyTapPhrase[] = [
	{ title: 'Скоро новое', note: 'Кран ждёт кегу' },
	{ title: 'Кран отдыхает', note: 'Набирается сил' },
	{ title: `Пиво в${nbsp}пути`, note: 'Кега уже едет' },
	{ title: 'Кран медитирует', note: 'Не беспокоить' },
	{ title: 'Выпили всё', note: 'Вы молодцы' },
	{ title: `Кран на${nbsp}перекуре`, note: `Вернётся с${nbsp}кегой` },
	{ title: `Кран в${nbsp}отпуске`, note: 'Пишет открытки' },
	{ title: 'Место занято', note: 'Будущим пивом' },
	{ title: `Ушёл за${nbsp}кегой`, note: 'Обещал быстро' },
	{ title: `Кега в${nbsp}пути`, note: `Застряла в${nbsp}пробке` },
	{ title: 'Кран думает', note: `О${nbsp}вечном и${nbsp}хмеле` },
	{ title: `Тишина в${nbsp}кране`, note: 'Перед бурей вкуса' },
	{ title: 'Кран скучает', note: 'Скоро развеселим' },
	{ title: 'Здесь будет пиво', note: 'Честно-честно' },
	{ title: 'Пока пусто', note: `Загляните к${nbsp}соседу` },
	{ title: 'Секретный сорт', note: 'Настолько, что нет' },
	{ title: 'Кран копит хмель', note: 'Ещё чуть-чуть' },
	{ title: 'Сорт-невидимка', note: 'Видят избранные' },
]

/** Случайная фраза, отличная от `current`, чтобы смена была заметна. */
export function randomPhrase(current?: EmptyTapPhrase): EmptyTapPhrase {
	const choices = EMPTY_TAP_PHRASES.filter((phrase) => phrase !== current)

	return choices[Math.floor(Math.random() * choices.length)]
}
