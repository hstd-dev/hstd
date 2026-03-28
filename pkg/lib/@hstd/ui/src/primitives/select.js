import { h as html, $, css, on } from "@hstd/std";
import { Portal } from "../core/portal.js";
import { FocusScope } from "../core/focus-scope.js";
import { DismissableLayer } from "../core/dismissable-layer.js";
import { Presence } from "../core/presence.js";
import { Popper } from "../core/popper.js";
import { createContext } from "../core/context.js";
import { generateId } from "../utils/id.js";
import { Keys, handleArrowNavigation } from "../utils/keyboard.js";

/**
 * Select primitive - Custom select/dropdown component
 * Follows WAI-ARIA Listbox pattern
 */

const SelectContext = createContext(null);

/**
 * Select Root
 * @param {Object} props
 * @param {string|Pointer<string>} [props.value] - Controlled value
 * @param {string} [props.defaultValue] - Default value
 * @param {Function} [props.onValueChange] - Value change callback
 * @param {boolean|Pointer<boolean>} [props.open] - Controlled open state
 * @param {boolean} [props.defaultOpen=false] - Default open state
 * @param {Function} [props.onOpenChange] - Open state change callback
 * @param {string} [props.name] - Form field name
 * @param {boolean} [props.disabled=false] - Disable the select
 * @param {boolean} [props.required=false] - Mark as required
 * @param {*} props.children - Select parts
 * @returns {NodeList}
 */
export function Select({
	value,
	defaultValue,
	onValueChange,
	open,
	defaultOpen = false,
	onOpenChange,
	name,
	disabled = false,
	required = false,
	children,
}) {
	const isValueControlled = value !== undefined;
	const valueState = isValueControlled
		? (typeof value?.$ !== "undefined" ? value : $(value))
		: $(defaultValue || "");

	const isOpenControlled = open !== undefined;
	const openState = isOpenControlled
		? (typeof open?.$ !== "undefined" ? open : $(open))
		: $(defaultOpen);

	const triggerRef = $(null);
	const contentRef = $(null);
	const valueNodeRef = $(null);
	const itemRefs = new Map();

	const triggerId = generateId("select-trigger");
	const contentId = generateId("select-content");
	const valueId = generateId("select-value");

	const setOpen = (newOpen) => {
		if (!isOpenControlled) {
			openState.$ = newOpen;
		}
		onOpenChange?.(newOpen);
	};

	const setValue = (newValue) => {
		if (!isValueControlled) {
			valueState.$ = newValue;
		}
		onValueChange?.(newValue);
		setOpen(false);
	};

	const registerItem = (value, ref, textContent) => {
		itemRefs.set(value, { ref, textContent });
	};

	const getTextValue = () => {
		const item = itemRefs.get(valueState.$);
		return item?.textContent || "";
	};

	const context = {
		value: valueState,
		open: openState,
		disabled,
		required,
		name,
		triggerRef,
		contentRef,
		valueNodeRef,
		triggerId,
		contentId,
		valueId,
		setOpen,
		setValue,
		registerItem,
		getTextValue,
		itemRefs,
	};

	return SelectContext.Provider(context, children);
}

/**
 * Select Trigger
 * @param {Object} props
 * @param {*} props.children - Trigger content
 * @returns {NodeList}
 */
export function SelectTrigger({ children, ...props }) {
	const ctx = SelectContext.use();

	const handleClick = () => {
		if (!ctx.disabled) {
			ctx.setOpen(!ctx.open.$);
		}
	};

	const handleKeyDown = (event) => {
		if (ctx.disabled) return;

		if ([Keys.Enter, Keys.Space, Keys.ArrowDown, Keys.ArrowUp].includes(event.key)) {
			event.preventDefault();
			ctx.setOpen(true);
		}
	};

	return html`<button ${{
		type: "button",
		role: "combobox",
		id: ctx.triggerId,
		"aria-controls": ctx.contentId,
		"aria-expanded": ctx.open,
		"aria-required": ctx.required,
		"aria-autocomplete": "none",
		"data-state": ctx.open.into(o => o ? "open" : "closed"),
		"data-disabled": ctx.disabled ? "" : undefined,
		"data-placeholder": ctx.value.into(v => v ? undefined : ""),
		disabled: ctx.disabled,
		[on.click]: handleClick,
		[on.keydown]: handleKeyDown,
		...props,
	}}>${children}</button>`.on(([trigger]) => {
		ctx.triggerRef.$ = trigger;
	});
}

/**
 * Select Value - Displays selected value
 * @param {Object} props
 * @param {string} [props.placeholder] - Placeholder text
 * @returns {NodeList}
 */
export function SelectValue({ placeholder, ...props }) {
	const ctx = SelectContext.use();

	return html`<span ${{
		id: ctx.valueId,
		...props,
	}}>${ctx.value.into(v => {
		if (!v && placeholder) return placeholder;
		// Need to get text from registered items
		queueMicrotask(() => {
			const text = ctx.getTextValue();
			if (ctx.valueNodeRef.$) {
				ctx.valueNodeRef.$.textContent = text || placeholder || "";
			}
		});
		return v || placeholder || "";
	})}</span>`.on(([span]) => {
		ctx.valueNodeRef.$ = span;
	});
}

/**
 * Select Icon
 * @param {Object} props
 * @param {*} props.children - Icon content
 * @returns {NodeList}
 */
export function SelectIcon({ children, ...props }) {
	return html`<span ${{ "aria-hidden": "true", ...props }}>${children || "▼"}</span>`;
}

/**
 * Select Portal
 * @param {Object} props
 * @param {Element} [props.container] - Portal container
 * @param {*} props.children - Content
 * @returns {NodeList}
 */
export function SelectPortal({ container, children }) {
	const ctx = SelectContext.use();

	return html`${ctx.open.into(isOpen => {
		if (!isOpen) return "";
		return Portal({ container, children: SelectContext.Provider(ctx, children) });
	})}`;
}

/**
 * Select Content
 * @param {Object} props
 * @param {"popper" | "item-aligned"} [props.position="popper"] - Positioning strategy
 * @param {string} [props.side="bottom"] - Preferred side
 * @param {number} [props.sideOffset=4] - Offset from trigger
 * @param {*} props.children - Content
 * @returns {NodeList}
 */
export function SelectContent({
	position = "popper",
	side = "bottom",
	sideOffset = 4,
	children,
	...props
}) {
	const ctx = SelectContext.use();

	const handleKeyDown = (event) => {
		if (event.key === Keys.Escape) {
			ctx.setOpen(false);
			ctx.triggerRef.$?.focus();
		}

		// Arrow navigation
		const items = [...ctx.itemRefs.entries()];
		const currentIndex = items.findIndex(([v]) => v === ctx.value.$);

		const newIndex = handleArrowNavigation(event, {
			currentIndex: currentIndex === -1 ? 0 : currentIndex,
			maxIndex: items.length - 1,
			orientation: "vertical",
		});

		if (newIndex !== null) {
			event.preventDefault();
			const [value, { ref }] = items[newIndex];
			ref.$?.focus();
		}
	};

	const content = html`<div ${{
		role: "listbox",
		id: ctx.contentId,
		"aria-labelledby": ctx.triggerId,
		"data-state": "open",
		tabindex: "-1",
		[on.keydown]: handleKeyDown,
		...props,
	}}>${children}</div>`;

	return html`${Presence({
		present: ctx.open,
		children: () => DismissableLayer({
			onDismiss: () => ctx.setOpen(false),
			children: FocusScope({
				trapped: true,
				children: position === "popper"
					? Popper({
						anchor: ctx.triggerRef,
						placement: side,
						offset: sideOffset,
						children: content,
					})
					: content,
			}),
		}),
	})}`.on(([div]) => {
		ctx.contentRef.$ = div;
	});
}

/**
 * Select Viewport
 * @param {Object} props
 * @param {*} props.children - Items
 * @returns {NodeList}
 */
export function SelectViewport({ children, ...props }) {
	return html`<div ${{ ...props }}>${children}</div>`;
}

/**
 * Select Item
 * @param {Object} props
 * @param {string} props.value - Item value
 * @param {boolean} [props.disabled=false] - Disable this item
 * @param {string} [props.textValue] - Text value for typeahead
 * @param {*} props.children - Item content
 * @returns {NodeList}
 */
export function SelectItem({ value, disabled = false, textValue, children, ...props }) {
	const ctx = SelectContext.use();
	const itemRef = $(null);

	const isSelected = ctx.value.into(v => v === value);

	// Register item
	queueMicrotask(() => {
		if (itemRef.$) {
			const text = textValue || itemRef.$.textContent || "";
			ctx.registerItem(value, itemRef, text);
		}
	});

	const handleClick = () => {
		if (!disabled) {
			ctx.setValue(value);
		}
	};

	const handleKeyDown = (event) => {
		if (disabled) return;

		if (event.key === Keys.Enter || event.key === Keys.Space) {
			event.preventDefault();
			ctx.setValue(value);
		}
	};

	return html`<div ${{
		role: "option",
		"aria-selected": isSelected,
		"aria-disabled": disabled,
		"data-state": isSelected.into(s => s ? "checked" : "unchecked"),
		"data-disabled": disabled ? "" : undefined,
		"data-highlighted": undefined, // Set on focus
		tabindex: disabled ? undefined : "-1",
		[on.click]: handleClick,
		[on.keydown]: handleKeyDown,
		[on.focus]: (e) => { e.target.dataset.highlighted = ""; },
		[on.blur]: (e) => { delete e.target.dataset.highlighted; },
		...props,
	}}>${children}</div>`.on(([item]) => {
		itemRef.$ = item;
	});
}

/**
 * Select Item Text
 * @param {Object} props
 * @param {*} props.children - Text content
 * @returns {NodeList}
 */
export function SelectItemText({ children, ...props }) {
	return html`<span ${{ ...props }}>${children}</span>`;
}

/**
 * Select Item Indicator
 * @param {Object} props
 * @param {*} props.children - Indicator content (checkmark)
 * @returns {NodeList}
 */
export function SelectItemIndicator({ children, ...props }) {
	return html`<span ${{ "aria-hidden": "true", ...props }}>${children}</span>`;
}

/**
 * Select Group
 * @param {Object} props
 * @param {*} props.children - Group items
 * @returns {NodeList}
 */
export function SelectGroup({ children, ...props }) {
	const labelId = generateId("select-group");

	return html`<div ${{
		role: "group",
		"aria-labelledby": labelId,
		...props,
	}}>${children}</div>`;
}

/**
 * Select Label
 * @param {Object} props
 * @param {*} props.children - Label text
 * @returns {NodeList}
 */
export function SelectLabel({ children, ...props }) {
	return html`<div ${{ ...props }}>${children}</div>`;
}

/**
 * Select Separator
 * @param {Object} props
 * @returns {NodeList}
 */
export function SelectSeparator({ ...props }) {
	return html`<div ${{ "aria-hidden": "true", ...props }}></div>`;
}

export { SelectContext };
