/**
 * Unique ID generation utilities
 */

let idCounter = 0;

/**
 * Generate a unique ID
 * @param {string} [prefix="hstd"] - Prefix for the ID
 * @returns {string}
 */
export function generateId(prefix = "hstd") {
	return `${prefix}-${++idCounter}`;
}

/**
 * Create a hook-style ID generator
 * @param {string} [prefix] - Optional prefix
 * @returns {string}
 */
export function useId(prefix) {
	return generateId(prefix);
}
