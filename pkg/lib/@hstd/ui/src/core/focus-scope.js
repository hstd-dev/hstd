import { h as html, $, on } from "@hstd/std";

/**
 * FocusScope traps focus within a container.
 * Essential for modals, dialogs, and other overlay components.
 */

const FOCUSABLE_SELECTOR = [
	'a[href]',
	'area[href]',
	'input:not([disabled]):not([type="hidden"])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'button:not([disabled])',
	'iframe',
	'object',
	'embed',
	'[tabindex]:not([tabindex="-1"])',
	'[contenteditable]',
	'audio[controls]',
	'video[controls]',
	'summary',
].join(', ');

/**
 * Get all focusable elements within a container
 * @param {Element} container
 * @returns {Element[]}
 */
export function getFocusableElements(container) {
	const elements = [...container.querySelectorAll(FOCUSABLE_SELECTOR)];
	return elements.filter(el => {
		// Check visibility
		if (el.offsetParent === null && getComputedStyle(el).position !== 'fixed') {
			return false;
		}
		return !el.hasAttribute('disabled') && el.tabIndex !== -1;
	});
}

/**
 * Get the first focusable element
 * @param {Element} container
 * @returns {Element|null}
 */
export function getFirstFocusable(container) {
	return getFocusableElements(container)[0] || null;
}

/**
 * Get the last focusable element
 * @param {Element} container
 * @returns {Element|null}
 */
export function getLastFocusable(container) {
	const elements = getFocusableElements(container);
	return elements[elements.length - 1] || null;
}

/**
 * @typedef {Object} FocusScopeProps
 * @property {*} children - Content to render within focus scope
 * @property {boolean} [trapped=true] - Whether focus should be trapped
 * @property {boolean} [loop=true] - Whether focus should loop at boundaries
 * @property {Function} [onMountAutoFocus] - Callback when auto-focusing on mount
 * @property {Function} [onUnmountAutoFocus] - Callback when restoring focus on unmount
 */

/**
 * FocusScope component
 * @param {FocusScopeProps} props
 * @returns {NodeList}
 */
export function FocusScope({
	children,
	trapped = true,
	loop = true,
	onMountAutoFocus,
	onUnmountAutoFocus,
}) {
	const containerRef = $(null);
	let previouslyFocused = null;

	const handleKeyDown = (event) => {
		if (!trapped || event.key !== "Tab") return;

		const container = containerRef.$;
		if (!container) return;

		const focusables = getFocusableElements(container);
		if (focusables.length === 0) return;

		const first = focusables[0];
		const last = focusables[focusables.length - 1];
		const active = document.activeElement;

		if (event.shiftKey) {
			// Shift+Tab: going backwards
			if (active === first || !container.contains(active)) {
				if (loop) {
					event.preventDefault();
					last.focus();
				}
			}
		} else {
			// Tab: going forwards
			if (active === last || !container.contains(active)) {
				if (loop) {
					event.preventDefault();
					first.focus();
				}
			}
		}
	};

	const handleFocusIn = (event) => {
		if (!trapped) return;

		const container = containerRef.$;
		if (!container) return;

		// If focus moved outside the scope, bring it back
		if (!container.contains(event.target)) {
			const first = getFirstFocusable(container);
			if (first) first.focus();
		}
	};

	const setup = (container) => {
		containerRef.$ = container;
		previouslyFocused = document.activeElement;

		// Auto-focus first element
		queueMicrotask(() => {
			const focusTarget = getFirstFocusable(container);
			if (focusTarget) {
				if (onMountAutoFocus) {
					const event = { preventDefault: () => {}, defaultPrevented: false };
					onMountAutoFocus(event);
					if (!event.defaultPrevented) {
						focusTarget.focus();
					}
				} else {
					focusTarget.focus();
				}
			}
		});

		// Set up focus trap listeners
		if (trapped) {
			document.addEventListener("focusin", handleFocusIn);
		}
	};

	const cleanup = () => {
		document.removeEventListener("focusin", handleFocusIn);

		// Restore focus
		if (previouslyFocused instanceof HTMLElement) {
			if (onUnmountAutoFocus) {
				const event = { preventDefault: () => {}, defaultPrevented: false };
				onUnmountAutoFocus(event);
				if (!event.defaultPrevented) {
					previouslyFocused.focus();
				}
			} else {
				previouslyFocused.focus();
			}
		}
	};

	return html`<div ${{
		id: (ref) => {
			setup(ref.$);
			// Cleanup when removed
			const observer = new MutationObserver((mutations) => {
				for (const mutation of mutations) {
					for (const removed of mutation.removedNodes) {
						if (removed.contains && removed.contains(ref.$)) {
							cleanup();
							observer.disconnect();
							return;
						}
					}
				}
			});
			if (ref.$.parentNode) {
				observer.observe(ref.$.parentNode, { childList: true, subtree: true });
			}
		},
		[on.keydown]: handleKeyDown,
	}}>${children}</div>`;
}

/**
 * Hook-style focus management
 * @param {Element} container
 * @param {Object} options
 * @returns {{ trap: Function, release: Function }}
 */
export function useFocusTrap(container, options = {}) {
	const { loop = true } = options;
	let previouslyFocused = null;
	let isTrapped = false;

	const handleKeyDown = (event) => {
		if (!isTrapped || event.key !== "Tab") return;

		const focusables = getFocusableElements(container);
		if (focusables.length === 0) return;

		const first = focusables[0];
		const last = focusables[focusables.length - 1];
		const active = document.activeElement;

		if (event.shiftKey && (active === first || !container.contains(active))) {
			if (loop) {
				event.preventDefault();
				last.focus();
			}
		} else if (!event.shiftKey && (active === last || !container.contains(active))) {
			if (loop) {
				event.preventDefault();
				first.focus();
			}
		}
	};

	const handleFocusIn = (event) => {
		if (!isTrapped || container.contains(event.target)) return;
		const first = getFirstFocusable(container);
		if (first) first.focus();
	};

	return {
		trap() {
			previouslyFocused = document.activeElement;
			isTrapped = true;
			container.addEventListener("keydown", handleKeyDown);
			document.addEventListener("focusin", handleFocusIn);

			const first = getFirstFocusable(container);
			if (first) first.focus();
		},
		release() {
			isTrapped = false;
			container.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("focusin", handleFocusIn);

			if (previouslyFocused instanceof HTMLElement) {
				previouslyFocused.focus();
			}
		}
	};
}
