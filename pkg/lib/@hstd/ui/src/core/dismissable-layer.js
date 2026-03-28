import { h as html, $, on } from "@hstd/std";

/**
 * DismissableLayer handles dismissing overlays via:
 * - Click outside
 * - Escape key
 * - Focus outside
 */

// Stack of active dismissable layers
const layerStack = [];

/**
 * @typedef {Object} DismissableLayerProps
 * @property {*} children - Content to render
 * @property {boolean} [disableOutsidePointerEvents=false] - Disable pointer events outside
 * @property {Function} [onEscapeKeyDown] - Called when Escape is pressed
 * @property {Function} [onPointerDownOutside] - Called when clicking outside
 * @property {Function} [onFocusOutside] - Called when focus moves outside
 * @property {Function} [onInteractOutside] - Called on any outside interaction
 * @property {Function} [onDismiss] - Called when layer should be dismissed
 */

/**
 * DismissableLayer component
 * @param {DismissableLayerProps} props
 * @returns {NodeList}
 */
export function DismissableLayer({
	children,
	disableOutsidePointerEvents = false,
	onEscapeKeyDown,
	onPointerDownOutside,
	onFocusOutside,
	onInteractOutside,
	onDismiss,
}) {
	const containerRef = $(null);
	const ownerDocument = $(null);

	const handlePointerDown = (event) => {
		const container = containerRef.$;
		if (!container) return;

		// Check if click is outside
		const target = event.target;
		if (!container.contains(target)) {
			const customEvent = {
				originalEvent: event,
				preventDefault: () => { event.preventDefault(); },
				defaultPrevented: false,
			};

			onPointerDownOutside?.(customEvent);
			onInteractOutside?.(customEvent);

			if (!customEvent.defaultPrevented) {
				onDismiss?.();
			}
		}
	};

	const handleFocusIn = (event) => {
		const container = containerRef.$;
		if (!container) return;

		// Check if focus moved outside
		if (!container.contains(event.target)) {
			const customEvent = {
				originalEvent: event,
				preventDefault: () => {},
				defaultPrevented: false,
			};

			onFocusOutside?.(customEvent);
			onInteractOutside?.(customEvent);

			if (!customEvent.defaultPrevented) {
				onDismiss?.();
			}
		}
	};

	const handleKeyDown = (event) => {
		if (event.key !== "Escape") return;

		// Only handle if this is the topmost layer
		const container = containerRef.$;
		if (layerStack[layerStack.length - 1] !== container) return;

		const customEvent = {
			originalEvent: event,
			preventDefault: () => { event.preventDefault(); },
			defaultPrevented: false,
		};

		onEscapeKeyDown?.(customEvent);

		if (!customEvent.defaultPrevented) {
			onDismiss?.();
		}
	};

	const setup = (container) => {
		containerRef.$ = container;
		ownerDocument.$ = container.ownerDocument;

		// Add to layer stack
		layerStack.push(container);

		// Set up listeners
		const doc = container.ownerDocument;
		doc.addEventListener("pointerdown", handlePointerDown, true);
		doc.addEventListener("focusin", handleFocusIn);
		doc.addEventListener("keydown", handleKeyDown);

		// Disable outside pointer events if requested
		if (disableOutsidePointerEvents) {
			const style = doc.createElement("style");
			style.textContent = `body > *:not([data-dismissable-layer]) { pointer-events: none !important; }`;
			doc.head.appendChild(style);
			container.dataset.dismissableLayer = "";
			container._dismissableStyle = style;
		}
	};

	const cleanup = (container) => {
		// Remove from layer stack
		const index = layerStack.indexOf(container);
		if (index > -1) layerStack.splice(index, 1);

		const doc = ownerDocument.$;
		if (doc) {
			doc.removeEventListener("pointerdown", handlePointerDown, true);
			doc.removeEventListener("focusin", handleFocusIn);
			doc.removeEventListener("keydown", handleKeyDown);
		}

		// Restore pointer events
		if (container._dismissableStyle) {
			container._dismissableStyle.remove();
			delete container._dismissableStyle;
		}
	};

	return html`<div ${{
		id: (ref) => {
			setup(ref.$);

			// Cleanup on removal
			const observer = new MutationObserver((mutations) => {
				for (const mutation of mutations) {
					for (const removed of mutation.removedNodes) {
						if (removed === ref.$ || (removed.contains && removed.contains(ref.$))) {
							cleanup(ref.$);
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
	}}>${children}</div>`;
}

/**
 * Hook-style dismissable layer
 * @param {Element} container
 * @param {Object} options
 * @returns {{ activate: Function, deactivate: Function }}
 */
export function useDismissable(container, options = {}) {
	const { onDismiss, onEscapeKeyDown, onPointerDownOutside } = options;
	let isActive = false;

	const handlePointerDown = (event) => {
		if (!isActive || container.contains(event.target)) return;
		onPointerDownOutside?.(event);
		onDismiss?.();
	};

	const handleKeyDown = (event) => {
		if (!isActive || event.key !== "Escape") return;
		if (layerStack[layerStack.length - 1] !== container) return;
		onEscapeKeyDown?.(event);
		if (!event.defaultPrevented) onDismiss?.();
	};

	return {
		activate() {
			isActive = true;
			layerStack.push(container);
			document.addEventListener("pointerdown", handlePointerDown, true);
			document.addEventListener("keydown", handleKeyDown);
		},
		deactivate() {
			isActive = false;
			const index = layerStack.indexOf(container);
			if (index > -1) layerStack.splice(index, 1);
			document.removeEventListener("pointerdown", handlePointerDown, true);
			document.removeEventListener("keydown", handleKeyDown);
		}
	};
}
