import { h as html, $, on } from "@hstd/std";
import { generateId } from "../utils/id.js";
import { Keys } from "../utils/keyboard.js";

/**
 * Checkbox primitive - Checkable input
 * Supports checked, unchecked, and indeterminate states
 */

/**
 * @typedef {"checked" | "unchecked" | "indeterminate"} CheckedState
 */

/**
 * Checkbox Root
 * @param {Object} props
 * @param {boolean|"indeterminate"|Pointer} [props.checked] - Controlled checked state
 * @param {boolean|"indeterminate"} [props.defaultChecked=false] - Default checked state
 * @param {Function} [props.onCheckedChange] - Checked state change callback
 * @param {boolean} [props.disabled=false] - Disable the checkbox
 * @param {boolean} [props.required=false] - Mark as required
 * @param {string} [props.name] - Form field name
 * @param {string} [props.value="on"] - Form field value
 * @param {*} props.children - Checkbox content (indicator)
 * @returns {NodeList}
 */
export function Checkbox({
	checked,
	defaultChecked = false,
	onCheckedChange,
	disabled = false,
	required = false,
	name,
	value = "on",
	children,
	...props
}) {
	const isControlled = checked !== undefined;
	const checkedState = isControlled
		? (typeof checked?.$ !== "undefined" ? checked : $(checked))
		: $(defaultChecked);

	const getState = (val) => {
		if (val === "indeterminate") return "indeterminate";
		return val ? "checked" : "unchecked";
	};

	const toggle = () => {
		if (disabled) return;

		const current = checkedState.$;
		// Indeterminate always becomes checked on click
		const newValue = current === "indeterminate" ? true : !current;

		if (!isControlled) {
			checkedState.$ = newValue;
		}
		onCheckedChange?.(newValue);
	};

	const handleKeyDown = (event) => {
		if (event.key === Keys.Enter) {
			// Prevent form submission
			event.preventDefault();
		}
		if (event.key === Keys.Space) {
			event.preventDefault();
			toggle();
		}
	};

	const isChecked = checkedState.into(c => c === true || c === "indeterminate");
	const dataState = checkedState.into(getState);

	return html`
		<button ${{
			type: "button",
			role: "checkbox",
			"aria-checked": checkedState.into(c =>
				c === "indeterminate" ? "mixed" : c
			),
			"aria-required": required,
			"data-state": dataState,
			"data-disabled": disabled ? "" : undefined,
			disabled,
			[on.click]: toggle,
			[on.keydown]: handleKeyDown,
			...props,
		}}>${children}</button>
		${name ? html`<input ${{
			type: "checkbox",
			"aria-hidden": "true",
			tabindex: "-1",
			name,
			value,
			checked: isChecked,
			required,
			disabled,
			style: "position:absolute;pointer-events:none;opacity:0;margin:0;width:25px;height:25px;",
		}}>` : ""}
	`;
}

/**
 * Checkbox Indicator - Shows when checked or indeterminate
 * @param {Object} props
 * @param {boolean} [props.forceMount=false] - Force mount even when unchecked
 * @param {*} props.children - Indicator content (icon)
 * @returns {NodeList}
 */
export function CheckboxIndicator({ forceMount = false, children, ...props }) {
	// This needs to be rendered inside a Checkbox context
	// For simplicity, we'll use data attributes from parent
	return html`<span ${{
		"data-state": "inherit",
		...props,
	}}>${children}</span>`;
}
