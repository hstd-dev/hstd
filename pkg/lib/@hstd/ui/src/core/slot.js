import { h as html, css, on } from "@hstd/std";

/**
 * Slot allows component composition by forwarding props to children.
 * Similar to Radix UI's Slot/Slottable pattern.
 *
 * When a component accepts `asChild`, it can render its children
 * while forwarding all its own props to the child element.
 */

/**
 * Merges multiple prop objects, handling special cases for event handlers and styles
 * @param  {...Object} propSets - Objects containing props to merge
 * @returns {Object} Merged props
 */
export function mergeProps(...propSets) {
	const result = {};

	for (const props of propSets) {
		if (!props) continue;

		for (const key of Reflect.ownKeys(props)) {
			const existing = result[key];
			const incoming = props[key];

			// Handle event handlers (on.* symbols)
			if (typeof key === "symbol" && key.description?.startsWith("ON_IDENTIFIER")) {
				if (typeof existing === "function" && typeof incoming === "function") {
					// Chain event handlers
					result[key] = (...args) => {
						existing(...args);
						incoming(...args);
					};
					continue;
				}
			}

			// Handle css symbol - deep merge style objects
			if (typeof key === "symbol" && key.description?.startsWith("CSS_IDENTIFIER")) {
				if (existing && incoming && typeof existing === "object" && typeof incoming === "object") {
					result[key] = { ...existing, ...incoming };
					continue;
				}
			}

			// Handle className concatenation
			if (key === "className" && existing && incoming) {
				result[key] = `${existing} ${incoming}`;
				continue;
			}

			// Handle class concatenation
			if (key === "class" && existing && incoming) {
				result[key] = `${existing} ${incoming}`;
				continue;
			}

			// Default: later props override earlier
			result[key] = incoming;
		}
	}

	return result;
}

/**
 * Slot component that renders children with forwarded props
 *
 * @param {Object} props - Props to forward to children
 * @param {Function|NodeList|Element} props.children - Child element(s)
 * @returns {NodeList|Element}
 */
export function Slot({ children, ...props }) {
	// Get the child element
	const child = typeof children === "function" ? children() : children;

	if (!child) {
		return html`<span ${{ ...props }}></span>`;
	}

	// If it's a NodeList, apply props to the first element
	const element = child instanceof NodeList ? child[0] : child;

	if (!(element instanceof Element)) {
		return html`<span ${{ ...props }}>${child}</span>`;
	}

	// Apply forwarded props to the element
	for (const [key, value] of Object.entries(props)) {
		if (key === "className" || key === "class") {
			element.classList.add(...value.split(" ").filter(Boolean));
		} else if (typeof value === "function" && key.startsWith("on")) {
			const eventName = key.slice(2).toLowerCase();
			element.addEventListener(eventName, value);
		} else {
			element[key] = value;
		}
	}

	return child;
}

/**
 * Slottable marks content that should receive Slot props
 * @param {Object} props
 * @param {*} props.children
 * @returns {*}
 */
export function Slottable({ children }) {
	return children;
}

/**
 * Compose multiple refs into one
 * @param  {...Function} refs - Ref callbacks
 * @returns {Function} Combined ref callback
 */
export function composeRefs(...refs) {
	return (element) => {
		refs.forEach(ref => {
			if (typeof ref === "function") {
				ref(element);
			} else if (ref && typeof ref === "object" && "$" in ref) {
				ref.$ = element;
			}
		});
	};
}
