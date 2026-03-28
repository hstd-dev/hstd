import { h as html, $, on } from "@hstd/std";
import { generateId } from "../utils/id.js";
import { Keys } from "../utils/keyboard.js";

/**
 * Switch primitive - Toggle switch control
 * Alternative to checkbox for on/off states
 */

/**
 * Switch Root
 * @param {Object} props
 * @param {boolean|Pointer<boolean>} [props.checked] - Controlled checked state
 * @param {boolean} [props.defaultChecked=false] - Default checked state
 * @param {Function} [props.onCheckedChange] - Checked state change callback
 * @param {boolean} [props.disabled=false] - Disable the switch
 * @param {boolean} [props.required=false] - Mark as required
 * @param {string} [props.name] - Form field name
 * @param {string} [props.value="on"] - Form field value
 * @param {*} props.children - Switch content (thumb)
 * @returns {NodeList}
 */
export function Switch({
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

	const toggle = () => {
		if (disabled) return;

		const newValue = !checkedState.$;
		if (!isControlled) {
			checkedState.$ = newValue;
		}
		onCheckedChange?.(newValue);
	};

	const handleKeyDown = (event) => {
		if (event.key === Keys.Enter) {
			event.preventDefault();
		}
		if (event.key === Keys.Space) {
			event.preventDefault();
			toggle();
		}
	};

	return html`
		<button ${{
			type: "button",
			role: "switch",
			"aria-checked": checkedState,
			"aria-required": required,
			"data-state": checkedState.into(c => c ? "checked" : "unchecked"),
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
			checked: checkedState,
			required,
			disabled,
			style: "position:absolute;pointer-events:none;opacity:0;margin:0;width:42px;height:25px;transform:translateX(-100%);",
		}}>` : ""}
	`;
}

/**
 * Switch Thumb - The toggle indicator
 * @param {Object} props
 * @returns {NodeList}
 */
export function SwitchThumb({ ...props }) {
	return html`<span ${{
		"data-state": "inherit",
		...props,
	}}></span>`;
}
