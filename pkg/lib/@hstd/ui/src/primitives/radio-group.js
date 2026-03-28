import { h as html, $, on } from "@hstd/std";
import { createContext } from "../core/context.js";
import { generateId } from "../utils/id.js";
import { Keys, handleArrowNavigation } from "../utils/keyboard.js";

/**
 * RadioGroup primitive - Single-select option group
 * Follows WAI-ARIA Radio Group pattern
 */

const RadioGroupContext = createContext(null);

/**
 * RadioGroup Root
 * @param {Object} props
 * @param {string|Pointer<string>} [props.value] - Controlled value
 * @param {string} [props.defaultValue] - Default value
 * @param {Function} [props.onValueChange] - Value change callback
 * @param {boolean} [props.disabled=false] - Disable all radios
 * @param {boolean} [props.required=false] - Mark as required
 * @param {string} [props.name] - Form field name
 * @param {boolean} [props.loop=true] - Loop keyboard navigation
 * @param {"horizontal" | "vertical"} [props.orientation="vertical"] - Layout orientation
 * @param {*} props.children - Radio items
 * @returns {NodeList}
 */
export function RadioGroup({
	value,
	defaultValue,
	onValueChange,
	disabled = false,
	required = false,
	name,
	loop = true,
	orientation = "vertical",
	children,
	...props
}) {
	const isControlled = value !== undefined;
	const valueState = isControlled
		? (typeof value?.$ !== "undefined" ? value : $(value))
		: $(defaultValue || "");

	const itemRefs = [];

	const setValue = (newValue) => {
		if (!isControlled) {
			valueState.$ = newValue;
		}
		onValueChange?.(newValue);
	};

	const registerItem = (value, ref) => {
		itemRefs.push({ value, ref });
	};

	const handleKeyDown = (event) => {
		const currentIndex = itemRefs.findIndex(item =>
			item.ref.$ === document.activeElement
		);

		const newIndex = handleArrowNavigation(event, {
			currentIndex,
			maxIndex: itemRefs.length - 1,
			loop,
			orientation,
		});

		if (newIndex !== null) {
			event.preventDefault();
			const item = itemRefs[newIndex];
			item.ref.$?.focus();
			setValue(item.value);
		}
	};

	const context = {
		name: name || generateId("radio"),
		value: valueState,
		disabled,
		required,
		orientation,
		setValue,
		registerItem,
	};

	return html`<div ${{
		role: "radiogroup",
		"aria-required": required,
		"aria-orientation": orientation,
		"data-orientation": orientation,
		[on.keydown]: handleKeyDown,
		...props,
	}}>${RadioGroupContext.Provider(context, children)}</div>`;
}

/**
 * RadioGroup Item
 * @param {Object} props
 * @param {string} props.value - Item value
 * @param {boolean} [props.disabled=false] - Disable this item
 * @param {boolean} [props.required] - Override group required
 * @param {*} props.children - Item content (indicator)
 * @returns {NodeList}
 */
export function RadioGroupItem({ value, disabled = false, required, children, ...props }) {
	const ctx = RadioGroupContext.use();
	const itemRef = $(null);
	const itemId = generateId("radio");

	const isDisabled = disabled || ctx.disabled;
	const isRequired = required ?? ctx.required;

	// Register item for keyboard navigation
	queueMicrotask(() => {
		if (itemRef.$) {
			ctx.registerItem(value, itemRef);
		}
	});

	const isChecked = ctx.value.into(v => v === value);

	const handleClick = () => {
		if (!isDisabled) {
			ctx.setValue(value);
		}
	};

	// Roving tabindex - only checked or first item is focusable
	const getTabIndex = () => {
		const currentValue = ctx.value.$;
		if (currentValue === value) return "0";
		if (currentValue === "") return undefined; // First focusable
		return "-1";
	};

	return html`
		<button ${{
			type: "button",
			role: "radio",
			id: itemId,
			"aria-checked": isChecked,
			"data-state": isChecked.into(c => c ? "checked" : "unchecked"),
			"data-disabled": isDisabled ? "" : undefined,
			disabled: isDisabled,
			tabindex: isChecked.into(c => c ? "0" : "-1"),
			[on.click]: handleClick,
			...props,
		}}>${children}</button>
		<input ${{
			type: "radio",
			"aria-hidden": "true",
			tabindex: "-1",
			name: ctx.name,
			value,
			checked: isChecked,
			required: isRequired,
			disabled: isDisabled,
			style: "position:absolute;pointer-events:none;opacity:0;margin:0;",
		}}>
	`.on(([button]) => {
		itemRef.$ = button;
	});
}

/**
 * RadioGroup Indicator
 * @param {Object} props
 * @param {boolean} [props.forceMount=false] - Force mount
 * @param {*} props.children - Indicator content
 * @returns {NodeList}
 */
export function RadioGroupIndicator({ forceMount = false, children, ...props }) {
	return html`<span ${{ ...props }}>${children}</span>`;
}

export { RadioGroupContext };
