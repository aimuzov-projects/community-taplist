/** Кранов на одном экране. */
export const ITEMS_PER_LIST = 12
export const ITEMS_PER_COLUMN = 4
export const TV_COUNT = 2

// Кранов 25, а мест на двух экранах 24: 25-й чередуется с последним местом последнего экрана.
export const EXTRA_ITEM_INDEX = ITEMS_PER_LIST * TV_COUNT
