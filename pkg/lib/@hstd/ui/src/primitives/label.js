import { h as html, on } from "@hstd/std";

/**
 * Label primitive - Accessible label for form controls
 */

/**
 * Label
 * @param {Object} props
 * @param {string} [props.htmlFor] - ID of the control this label is for
 * @param {*} props.children - Label text
 * @returns {NodeList}
 */
export function Label({ htmlFor, children, ...props }) {
	const handleMouseDown = (event) => {
		// Prevent text selection when double-clicking
		if (event.detail > 1) {
			event.preventDefault();
		}
	};

	return html`<label ${{
		for: htmlFor,
		[on.mousedown]: handleMouseDown,
		...props,
	}}>${children}</label>`;
}
