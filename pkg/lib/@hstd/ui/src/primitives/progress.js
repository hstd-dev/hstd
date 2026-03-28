import { h as html, $, css } from "@hstd/std";

/**
 * Progress primitive - Progress indicator
 * Shows completion progress with optional indeterminate state
 */

/**
 * Get progress state
 */
const getProgressState = (value, max) => {
	if (value == null) return "indeterminate";
	if (value >= max) return "complete";
	return "loading";
};

/**
 * Progress Root
 * @param {Object} props
 * @param {number|null|Pointer} [props.value] - Current progress value (null for indeterminate)
 * @param {number} [props.max=100] - Maximum value
 * @param {Function} [props.getValueLabel] - Custom value label function
 * @param {*} props.children - Progress content (Indicator)
 * @returns {NodeList}
 */
export function Progress({
	value,
	max = 100,
	getValueLabel = (value, max) => `${Math.round((value / max) * 100)}%`,
	children,
	...props
}) {
	const valueState = typeof value?.$ !== "undefined" ? value : $(value);

	const getLabel = (v) => {
		if (v == null) return undefined;
		return getValueLabel(v, max);
	};

	const getState = (v) => getProgressState(v, max);

	return html`<div ${{
		role: "progressbar",
		"aria-valuemax": max,
		"aria-valuemin": 0,
		"aria-valuenow": valueState.into(v => v ?? undefined),
		"aria-valuetext": valueState.into(getLabel),
		"data-state": valueState.into(getState),
		"data-value": valueState.into(v => v ?? undefined),
		"data-max": max,
		...props,
	}}>${children}</div>`;
}

/**
 * Progress Indicator
 * @param {Object} props
 * @returns {NodeList}
 */
export function ProgressIndicator({ ...props }) {
	// The indicator inherits data-state from parent
	// Styling should be handled by the consumer
	return html`<div ${{
		"data-state": "inherit",
		...props,
	}}></div>`;
}
