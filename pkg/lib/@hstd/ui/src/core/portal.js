import { h as html, $ } from "@hstd/std";

/**
 * Renders children into a DOM node outside of the current DOM hierarchy.
 * Useful for modals, popovers, tooltips, etc.
 *
 * @param {Object} props
 * @param {Element} [props.container] - Target container element (defaults to document.body)
 * @param {Function|NodeList} props.children - Content to render in the portal
 * @returns {NodeList} Empty fragment (content is rendered elsewhere)
 */
export function Portal({ container = document.body, children }) {
	const content = typeof children === "function" ? children() : children;

	// Convert to array of nodes if needed
	const nodes = content instanceof NodeList
		? [...content]
		: content instanceof Node
			? [content]
			: [...html`${content}`];

	// Append to container
	nodes.forEach(node => container.appendChild(node));

	// Create cleanup marker
	const marker = document.createComment("portal");

	// Return marker that will clean up portal content when removed
	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			for (const removed of mutation.removedNodes) {
				if (removed === marker) {
					nodes.forEach(node => node.remove());
					observer.disconnect();
					return;
				}
			}
		}
	});

	// Observe parent for marker removal
	queueMicrotask(() => {
		if (marker.parentNode) {
			observer.observe(marker.parentNode, { childList: true });
		}
	});

	return html`${marker}`;
}

/**
 * Creates a portal container at the specified DOM node
 * @param {string} [id] - Optional ID for the portal container
 * @returns {Element} The portal container element
 */
export function createPortalContainer(id = "hstd-portal-root") {
	let container = document.getElementById(id);
	if (!container) {
		container = document.createElement("div");
		container.id = id;
		document.body.appendChild(container);
	}
	return container;
}
