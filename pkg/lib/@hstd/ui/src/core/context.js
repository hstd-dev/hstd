import { $ } from "@hstd/std";

/**
 * Creates a context for sharing state between components.
 * Similar to React's createContext but using hstd's Pointer system.
 *
 * @template T
 * @param {T} defaultValue - The default value for the context
 * @returns {{ Provider: Function, use: () => T }}
 */
export function createContext(defaultValue) {
	const contextStack = [];

	/**
	 * Provider component that wraps children with context value
	 * @param {T} value - The context value to provide
	 * @param {Function} children - Function that returns children nodes
	 * @returns {NodeList}
	 */
	function Provider(value, children) {
		contextStack.push(value);
		try {
			const result = typeof children === "function" ? children() : children;
			return result;
		} finally {
			contextStack.pop();
		}
	}

	/**
	 * Hook to consume the context value
	 * @returns {T} The current context value
	 */
	function use() {
		return contextStack.length > 0
			? contextStack[contextStack.length - 1]
			: defaultValue;
	}

	return { Provider, use };
}

/**
 * Creates a reactive context that auto-updates consumers
 * @template T
 * @param {T} defaultValue
 * @returns {{ Provider: Function, use: () => Pointer<T>, value: Pointer<T> }}
 */
export function createReactiveContext(defaultValue) {
	const contextPointer = $(defaultValue);

	function Provider(value, children) {
		const prev = contextPointer.$;
		contextPointer.$ = value;
		try {
			return typeof children === "function" ? children() : children;
		} finally {
			contextPointer.$ = prev;
		}
	}

	function use() {
		return contextPointer;
	}

	return { Provider, use, value: contextPointer };
}
