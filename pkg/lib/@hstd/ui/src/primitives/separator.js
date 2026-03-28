import { h as html } from "@hstd/std";

/**
 * Separator primitive - Visual divider between content
 */

/**
 * Separator
 * @param {Object} props
 * @param {"horizontal" | "vertical"} [props.orientation="horizontal"] - Orientation
 * @param {boolean} [props.decorative=false] - If true, hidden from accessibility tree
 * @returns {NodeList}
 */
export function Separator({
	orientation = "horizontal",
	decorative = false,
	...props
}) {
	const ariaOrientation = orientation === "vertical" ? "vertical" : undefined;

	return html`<div ${{
		role: decorative ? "none" : "separator",
		"aria-orientation": decorative ? undefined : ariaOrientation,
		"data-orientation": orientation,
		...props,
	}}></div>`;
}
