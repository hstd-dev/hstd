import { h as html, $, on } from "@hstd/std";
import { createContext } from "../core/context.js";
import { Keys, handleArrowNavigation } from "../utils/keyboard.js";

/**
 * Toolbar primitive - Container for grouped controls
 * Follows WAI-ARIA Toolbar pattern
 */

const ToolbarContext = createContext(null);

/**
 * Toolbar Root
 * @param {Object} props
 * @param {"horizontal" | "vertical"} [props.orientation="horizontal"] - Orientation
 * @param {"ltr" | "rtl"} [props.dir="ltr"] - Text direction
 * @param {boolean} [props.loop=true] - Loop keyboard navigation
 * @param {*} props.children - Toolbar items
 * @returns {NodeList}
 */
export function Toolbar({
	orientation = "horizontal",
	dir = "ltr",
	loop = true,
	children,
	...props
}) {
	const itemRefs = [];

	const registerItem = (ref) => {
		itemRefs.push(ref);
	};

	const handleKeyDown = (event) => {
		const currentIndex = itemRefs.findIndex(ref =>
			ref.$ === document.activeElement || ref.$?.contains(document.activeElement)
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
		orientation,
		dir,
		registerItem,
	};

	return html`<div ${{
		role: "toolbar",
		"aria-orientation": orientation,
		dir,
		[on.keydown]: handleKeyDown,
		...props,
	}}>${ToolbarContext.Provider(context, children)}</div>`;
}

/**
 * Toolbar Button
 * @param {Object} props
 * @param {boolean} [props.disabled=false] - Disable the button
 * @param {*} props.children - Button content
 * @returns {NodeList}
 */
export function ToolbarButton({ disabled = false, children, ...props }) {
	const ctx = ToolbarContext.use();
	const buttonRef = $(null);

	queueMicrotask(() => {
		if (buttonRef.$ && !disabled) {
			ctx.registerItem(buttonRef);
		}
	});

	return html`<button ${{
		type: "button",
		disabled,
		...props,
	}}>${children}</button>`.on(([button]) => {
		buttonRef.$ = button;
	});
}

/**
 * Toolbar Link
 * @param {Object} props
 * @param {string} props.href - Link URL
 * @param {*} props.children - Link content
 * @returns {NodeList}
 */
export function ToolbarLink({ href, children, ...props }) {
	const ctx = ToolbarContext.use();
	const linkRef = $(null);

	queueMicrotask(() => {
		if (linkRef.$) {
			ctx.registerItem(linkRef);
		}
	});

	return html`<a ${{
		href,
		...props,
	}}>${children}</a>`.on(([link]) => {
		linkRef.$ = link;
	});
}

/**
 * Toolbar Separator
 * @param {Object} props
 * @returns {NodeList}
 */
export function ToolbarSeparator({ ...props }) {
	const ctx = ToolbarContext.use();

	return html`<div ${{
		role: "separator",
		"aria-orientation": ctx.orientation === "horizontal" ? "vertical" : "horizontal",
		...props,
	}}></div>`;
}

/**
 * Toolbar ToggleGroup
 * @param {Object} props
 * @param {"single" | "multiple"} [props.type="single"] - Selection type
 * @param {string|string[]} [props.value] - Controlled value
 * @param {string|string[]} [props.defaultValue] - Default value
 * @param {Function} [props.onValueChange] - Value change callback
 * @param {boolean} [props.disabled=false] - Disable all toggles
 * @param {*} props.children - Toggle items
 * @returns {NodeList}
 */
export function ToolbarToggleGroup({
	type = "single",
	value,
	defaultValue,
	onValueChange,
	disabled = false,
	children,
	...props
}) {
	const ctx = ToolbarContext.use();

	const isControlled = value !== undefined;
	const initialValue = type === "multiple" ? (defaultValue || []) : (defaultValue || "");
	const valueState = isControlled
		? (typeof value?.$ !== "undefined" ? value : $(value))
		: $(initialValue);

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
			newValue = valueState.$ === itemValue ? "" : itemValue;
		}

		if (!isControlled) {
			valueState.$ = newValue;
		}
		onValueChange?.(newValue);
	};

	const groupContext = { type, value: valueState, disabled, isPressed, toggle };

	return html`<div ${{
		role: "group",
		...props,
	}}>${ToolbarToggleGroupContext.Provider(groupContext, children)}</div>`;
}

const ToolbarToggleGroupContext = createContext(null);

/**
 * Toolbar ToggleItem
 * @param {Object} props
 * @param {string} props.value - Item value
 * @param {boolean} [props.disabled=false] - Disable this item
 * @param {*} props.children - Item content
 * @returns {NodeList}
 */
export function ToolbarToggleItem({ value, disabled = false, children, ...props }) {
	const toolbarCtx = ToolbarContext.use();
	const groupCtx = ToolbarToggleGroupContext.use();
	const itemRef = $(null);

	const isDisabled = disabled || groupCtx?.disabled;

	queueMicrotask(() => {
		if (itemRef.$ && !isDisabled) {
			toolbarCtx.registerItem(itemRef);
		}
	});

	const isPressed = groupCtx?.value.into(() => groupCtx.isPressed(value));

	return html`<button ${{
		type: "button",
		"aria-pressed": isPressed,
		"data-state": isPressed?.into(p => p ? "on" : "off"),
		"data-disabled": isDisabled ? "" : undefined,
		disabled: isDisabled,
		[on.click]: () => {
			if (!isDisabled) groupCtx?.toggle(value);
		},
		...props,
	}}>${children}</button>`.on(([button]) => {
		itemRef.$ = button;
	});
}

export { ToolbarContext, ToolbarToggleGroupContext };
