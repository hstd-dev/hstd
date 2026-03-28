import { h as html, $, on } from "@hstd/std";
import { generateId } from "../utils/id.js";
import { Keys } from "../utils/keyboard.js";

/**
 * Toggle primitive - Two-state button
 * Can be controlled or uncontrolled
 */

/**
 * Toggle button
 * @param {Object} props
 * @param {boolean|Pointer<boolean>} [props.pressed] - Controlled pressed state
 * @param {boolean} [props.defaultPressed=false] - Default pressed state
 * @param {Function} [props.onPressedChange] - Pressed state change callback
 * @param {boolean} [props.disabled=false] - Disable the toggle
 * @param {*} props.children - Toggle content
 * @returns {NodeList}
 */
export function Toggle({
	pressed,
	defaultPressed = false,
	onPressedChange,
	disabled = false,
	children,
	...props
}) {
	const isControlled = pressed !== undefined;
	const pressedState = isControlled
		? (typeof pressed?.$ !== "undefined" ? pressed : $(pressed))
		: $(defaultPressed);

	const toggle = () => {
		if (disabled) return;

		const newValue = !pressedState.$;
		if (!isControlled) {
			pressedState.$ = newValue;
		}
		onPressedChange?.(newValue);
	};

	const handleKeyDown = (event) => {
		if (event.key === Keys.Enter || event.key === Keys.Space) {
			event.preventDefault();
			toggle();
		}
	};

	return html`<button ${{
		type: "button",
		"aria-pressed": pressedState,
		"data-state": pressedState.into(p => p ? "on" : "off"),
		"data-disabled": disabled ? "" : undefined,
		disabled,
		[on.click]: toggle,
		[on.keydown]: handleKeyDown,
		...props,
	}}>${children}</button>`;
}
