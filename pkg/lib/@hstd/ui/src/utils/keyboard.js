/**
 * Keyboard navigation utilities
 */

export const Keys = {
	Space: " ",
	Enter: "Enter",
	Escape: "Escape",
	Backspace: "Backspace",
	Delete: "Delete",
	Tab: "Tab",

	ArrowUp: "ArrowUp",
	ArrowDown: "ArrowDown",
	ArrowLeft: "ArrowLeft",
	ArrowRight: "ArrowRight",

	Home: "Home",
	End: "End",
	PageUp: "PageUp",
	PageDown: "PageDown",
};

/**
 * Check if event matches a key
 * @param {KeyboardEvent} event
 * @param {string|string[]} keys
 * @returns {boolean}
 */
export function isKey(event, keys) {
	const keyList = Array.isArray(keys) ? keys : [keys];
	return keyList.includes(event.key);
}

/**
 * Handle arrow key navigation for a list
 * @param {KeyboardEvent} event
 * @param {Object} options
 * @param {number} options.currentIndex - Current focused index
 * @param {number} options.maxIndex - Maximum index
 * @param {boolean} [options.loop=true] - Loop at boundaries
 * @param {"vertical" | "horizontal" | "both"} [options.orientation="vertical"]
 * @returns {number|null} New index or null if no change
 */
export function handleArrowNavigation(event, options) {
	const {
		currentIndex,
		maxIndex,
		loop = true,
		orientation = "vertical",
	} = options;

	const isVertical = orientation === "vertical" || orientation === "both";
	const isHorizontal = orientation === "horizontal" || orientation === "both";

	let newIndex = null;

	if ((event.key === Keys.ArrowDown && isVertical) ||
		(event.key === Keys.ArrowRight && isHorizontal)) {
		newIndex = currentIndex + 1;
		if (newIndex > maxIndex) {
			newIndex = loop ? 0 : maxIndex;
		}
	} else if ((event.key === Keys.ArrowUp && isVertical) ||
		(event.key === Keys.ArrowLeft && isHorizontal)) {
		newIndex = currentIndex - 1;
		if (newIndex < 0) {
			newIndex = loop ? maxIndex : 0;
		}
	} else if (event.key === Keys.Home) {
		newIndex = 0;
	} else if (event.key === Keys.End) {
		newIndex = maxIndex;
	}

	return newIndex;
}

/**
 * Create keyboard handler for roving tabindex pattern
 * @param {Object} options
 * @param {Function} options.getItems - Function to get list items
 * @param {Function} options.onFocus - Callback when item should be focused
 * @param {"vertical" | "horizontal" | "both"} [options.orientation="vertical"]
 * @returns {Function} Event handler
 */
export function createRovingTabIndex(options) {
	const { getItems, onFocus, orientation = "vertical" } = options;

	return (event) => {
		const items = getItems();
		const currentIndex = items.findIndex(item =>
			item === document.activeElement || item.contains(document.activeElement)
		);

		const newIndex = handleArrowNavigation(event, {
			currentIndex: currentIndex === -1 ? 0 : currentIndex,
			maxIndex: items.length - 1,
			orientation,
		});

		if (newIndex !== null && newIndex !== currentIndex) {
			event.preventDefault();
			onFocus(items[newIndex], newIndex);
		}
	};
}
