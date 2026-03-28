import { h as html, css } from "@hstd/std";

/**
 * Visually hidden but accessible to screen readers.
 * Use for elements that should be announced but not visible.
 */

const visuallyHiddenStyles = {
	position: "absolute",
	border: "0",
	width: "1px",
	height: "1px",
	padding: "0",
	margin: "-1px",
	overflow: "hidden",
	clip: "rect(0, 0, 0, 0)",
	whiteSpace: "nowrap",
	wordWrap: "normal",
};

/**
 * VisuallyHidden component
 * @param {Object} props
 * @param {*} props.children - Content to hide visually
 * @param {boolean} [props.asChild] - If true, applies styles to child element
 * @returns {NodeList}
 */
export function VisuallyHidden({ children, asChild = false, ...props }) {
	if (asChild && children instanceof Element) {
		Object.assign(children.style, visuallyHiddenStyles);
		return children;
	}

	return html`<span ${{
		[css]: visuallyHiddenStyles,
		...props
	}}>${children}</span>`;
}

/**
 * Get visually hidden styles object for use with css binding
 * @returns {Object} CSS styles object
 */
export function getVisuallyHiddenStyles() {
	return { ...visuallyHiddenStyles };
}
