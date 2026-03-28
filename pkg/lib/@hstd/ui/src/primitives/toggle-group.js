import { h as html, $, on } from "@hstd/std";
import { createContext } from "../core/context.js";
import { generateId } from "../utils/id.js";
import { Keys, handleArrowNavigation } from "../utils/keyboard.js";

/**
 * ToggleGroup primitive - Group of toggle buttons
 * Supports single or multiple selection
 */

const ToggleGroupContext = createContext(null);

/**
 * ToggleGroup Root
 * @param {Object} props
 * @param {"single" | "multiple"} [props.type="single"] - Selection type
 * @param {string|string[]} [props.value] - Controlled value
 * @param {string|string[]} [props.defaultValue] - Default value
 * @param {Function} [props.onValueChange] - Value change callback
 * @param {boolean} [props.disabled=false] - Disable all toggles
 * @param {boolean} [props.rovingFocus=true] - Enable roving tabindex
 * @param {boolean} [props.loop=true] - Loop keyboard navigation
 * @param {"horizontal" | "vertical"} [props.orientation="horizontal"] - Layout orientation
 * @param {*} props.children - Toggle items
 * @returns {NodeList}
 */
export function ToggleGroup({
	type = "single",
	value,
	defaultValue,
	onValueChange,
	disabled = false,
	rovingFocus = true,
	loop = true,
	orientation = "horizontal",
	children,
	...props
}) {
	const isControlled = value !== undefined;
	const initialValue = type === "multiple"
		? (defaultValue || [])
		: (defaultValue || "");

	const valueState = isControlled
		? (typeof value?.$ !== "undefined" ? value : $(value))
		: $(initialValue);

	const itemRefs = [];

	const isPressed = (itemValue) => {
		const current = valueState.$;
		if (type === "multiple") {
			return Array.isArray(current) && current.includes(itemValue);
		}
		return current === itemValue;
	};

	const toggle = (itemValue) => {
		let newValue;

		if (type === "multiple") {
			const current = Array.isArray(valueState.$) ? valueState.$ : [];
			if (current.includes(itemValue)) {
				newValue = current.filter(v => v !== itemValue);
			} else {
				newValue = [...current, itemValue];
			}
		} else {
			// Single mode - can deselect
			newValue = valueState.$ === itemValue ? "" : itemValue;
		}

		if (!isControlled) {
			valueState.$ = newValue;
		}
		onValueChange?.(newValue);
	};

	const registerItem = (ref) => {
		itemRefs.push(ref);
	};

	const handleKeyDown = (event) => {
		if (!rovingFocus) return;

		const currentIndex = itemRefs.findIndex(ref =>
			ref.$ === document.activeElement
		);

		const newIndex = handleArrowNavigation(event, {
			currentIndex,
			maxIndex: itemRefs.length - 1,
			loop,
			orientation,
		});

		if (newIndex !== null) {
			event.preventDefault();
			itemRefs[newIndex].$?.focus();
		}
	};

	const context = {
		type,
		value: valueState,
		disabled,
		rovingFocus,
		orientation,
		isPressed,
		toggle,
		registerItem,
	};

	return html`<div ${{
		role: "group",
		"data-orientation": orientation,
		[on.keydown]: handleKeyDown,
		...props,
	}}>${ToggleGroupContext.Provider(context, children)}</div>`;
}

/**
 * ToggleGroup Item
 * @param {Object} props
 * @param {string} props.value - Item value
 * @param {boolean} [props.disabled=false] - Disable this item
 * @param {*} props.children - Item content
 * @returns {NodeList}
 */
export function ToggleGroupItem({ value, disabled = false, children, ...props }) {
	const ctx = ToggleGroupContext.use();
	const itemRef = $(null);

	const isDisabled = disabled || ctx.disabled;

	// Register item for keyboard navigation
	queueMicrotask(() => {
		if (itemRef.$) {
			ctx.registerItem(itemRef);
		}
	});

	const isPressed = ctx.value.into(() => ctx.isPressed(value));

	const handleClick = () => {
		if (!isDisabled) {
			ctx.toggle(value);
		}
	};

	// Calculate tabindex for roving focus
	const getTabIndex = () => {
		if (!ctx.rovingFocus) return "0";

		const current = ctx.value.$;
		const hasSelection = ctx.type === "multiple"
			? Array.isArray(current) && current.length > 0
			: current !== "";

		if (!hasSelection) {
			// No selection - first item is focusable
			return undefined; // Will be set by registration order
		}

		return ctx.isPressed(value) ? "0" : "-1";
	};

	return html`<button ${{
		type: "button",
		"aria-pressed": isPressed,
		"data-state": isPressed.into(p => p ? "on" : "off"),
		"data-disabled": isDisabled ? "" : undefined,
		"data-orientation": ctx.orientation,
		disabled: isDisabled,
		tabindex: ctx.rovingFocus
			? isPressed.into(p => p ? "0" : "-1")
			: "0",
		[on.click]: handleClick,
		...props,
	}}>${children}</button>`.on(([button]) => {
		itemRef.$ = button;
	});
}

export { ToggleGroupContext };
