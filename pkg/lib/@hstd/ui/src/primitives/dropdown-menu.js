import { h as html, $, on } from "@hstd/std";
import { Portal } from "../core/portal.js";
import { FocusScope } from "../core/focus-scope.js";
import { DismissableLayer } from "../core/dismissable-layer.js";
import { Presence } from "../core/presence.js";
import { Popper } from "../core/popper.js";
import { createContext } from "../core/context.js";
import { generateId } from "../utils/id.js";
import { Keys, handleArrowNavigation } from "../utils/keyboard.js";

/**
 * DropdownMenu primitive - Menu triggered by a button
 * Follows WAI-ARIA Menu Button pattern
 */

const DropdownMenuContext = createContext(null);
const DropdownMenuItemContext = createContext(null);

/**
 * DropdownMenu Root
 * @param {Object} props
 * @param {boolean|Pointer<boolean>} [props.open] - Controlled open state
 * @param {boolean} [props.defaultOpen=false] - Default open state
 * @param {Function} [props.onOpenChange] - Open state change callback
 * @param {boolean} [props.modal=true] - Whether menu is modal
 * @param {"ltr" | "rtl"} [props.dir="ltr"] - Text direction
 * @param {*} props.children - Menu parts
 * @returns {NodeList}
 */
export function DropdownMenu({
	open,
	defaultOpen = false,
	onOpenChange,
	modal = true,
	dir = "ltr",
	children,
}) {
	const isControlled = open !== undefined;
	const openState = isControlled
		? (typeof open?.$ !== "undefined" ? open : $(open))
		: $(defaultOpen);

	const triggerRef = $(null);
	const contentId = generateId("dropdown-menu");
	const itemRefs = [];

	const setOpen = (newOpen) => {
		if (!isControlled) {
			openState.$ = newOpen;
		}
		onOpenChange?.(newOpen);
	};

	const registerItem = (ref) => {
		itemRefs.push(ref);
	};

	const context = {
		open: openState,
		setOpen,
		modal,
		dir,
		triggerRef,
		contentId,
		itemRefs,
		registerItem,
	};

	return DropdownMenuContext.Provider(context, children);
}

/**
 * DropdownMenu Trigger
 * @param {Object} props
 * @param {*} props.children - Trigger content
 * @returns {NodeList}
 */
export function DropdownMenuTrigger({ children, ...props }) {
	const ctx = DropdownMenuContext.use();

	const handleKeyDown = (event) => {
		if ([Keys.ArrowDown, Keys.ArrowUp, Keys.Enter, Keys.Space].includes(event.key)) {
			event.preventDefault();
			ctx.setOpen(true);
		}
	};

	return html`<button ${{
		type: "button",
		"aria-haspopup": "menu",
		"aria-expanded": ctx.open,
		"aria-controls": ctx.contentId,
		"data-state": ctx.open.into(o => o ? "open" : "closed"),
		[on.click]: () => ctx.setOpen(!ctx.open.$),
		[on.keydown]: handleKeyDown,
		...props,
	}}>${children}</button>`.on(([trigger]) => {
		ctx.triggerRef.$ = trigger;
	});
}

/**
 * DropdownMenu Portal
 * @param {Object} props
 * @param {Element} [props.container] - Portal container
 * @param {*} props.children - Content
 * @returns {NodeList}
 */
export function DropdownMenuPortal({ container, children }) {
	const ctx = DropdownMenuContext.use();

	return html`${ctx.open.into(isOpen => {
		if (!isOpen) return "";
		return Portal({ container, children: DropdownMenuContext.Provider(ctx, children) });
	})}`;
}

/**
 * DropdownMenu Content
 * @param {Object} props
 * @param {string} [props.side="bottom"] - Preferred side
 * @param {number} [props.sideOffset=0] - Offset from trigger
 * @param {string} [props.align="start"] - Alignment
 * @param {boolean} [props.loop=false] - Loop keyboard navigation
 * @param {Function} [props.onCloseAutoFocus] - Close focus callback
 * @param {Function} [props.onEscapeKeyDown] - Escape key callback
 * @param {Function} [props.onPointerDownOutside] - Outside click callback
 * @param {*} props.children - Menu items
 * @returns {NodeList}
 */
export function DropdownMenuContent({
	side = "bottom",
	sideOffset = 0,
	align = "start",
	loop = false,
	onCloseAutoFocus,
	onEscapeKeyDown,
	onPointerDownOutside,
	children,
	...props
}) {
	const ctx = DropdownMenuContext.use();

	const placement = `${side}-${align}`;

	const handleKeyDown = (event) => {
		const currentIndex = ctx.itemRefs.findIndex(ref =>
			ref.$ === document.activeElement
		);

		const newIndex = handleArrowNavigation(event, {
			currentIndex,
			maxIndex: ctx.itemRefs.length - 1,
			loop,
			orientation: "vertical",
		});

		if (newIndex !== null) {
			event.preventDefault();
			ctx.itemRefs[newIndex].$?.focus();
		}
	};

	return html`${Presence({
		present: ctx.open,
		children: ({ state }) => DismissableLayer({
			onEscapeKeyDown: (e) => {
				onEscapeKeyDown?.(e);
				if (!e.defaultPrevented) {
					ctx.setOpen(false);
					ctx.triggerRef.$?.focus();
				}
			},
			onPointerDownOutside: (e) => {
				onPointerDownOutside?.(e);
				if (!e.defaultPrevented) ctx.setOpen(false);
			},
			children: FocusScope({
				trapped: ctx.modal,
				onUnmountAutoFocus: onCloseAutoFocus,
				children: Popper({
					anchor: ctx.triggerRef,
					placement,
					offset: sideOffset,
					children: html`<div ${{
						role: "menu",
						id: ctx.contentId,
						"aria-orientation": "vertical",
						"data-state": state.into(s => s === "mounted" ? "open" : "closed"),
						"data-side": side,
						"data-align": align,
						dir: ctx.dir,
						tabindex: "-1",
						[on.keydown]: handleKeyDown,
						...props,
					}}>${children}</div>`,
				}),
			}),
		}),
	})}`;
}

/**
 * DropdownMenu Item
 * @param {Object} props
 * @param {boolean} [props.disabled=false] - Disable this item
 * @param {Function} [props.onSelect] - Selection callback
 * @param {string} [props.textValue] - Text for typeahead
 * @param {*} props.children - Item content
 * @returns {NodeList}
 */
export function DropdownMenuItem({ disabled = false, onSelect, textValue, children, ...props }) {
	const ctx = DropdownMenuContext.use();
	const itemRef = $(null);

	// Register item for keyboard navigation
	queueMicrotask(() => {
		if (itemRef.$ && !disabled) {
			ctx.registerItem(itemRef);
		}
	});

	const handleSelect = () => {
		if (disabled) return;
		onSelect?.();
		ctx.setOpen(false);
	};

	const handleKeyDown = (event) => {
		if (event.key === Keys.Enter || event.key === Keys.Space) {
			event.preventDefault();
			handleSelect();
		}
	};

	return html`<div ${{
		role: "menuitem",
		tabindex: disabled ? undefined : "-1",
		"aria-disabled": disabled,
		"data-disabled": disabled ? "" : undefined,
		"data-highlighted": undefined,
		[on.click]: handleSelect,
		[on.keydown]: handleKeyDown,
		[on.focus]: (e) => { e.target.dataset.highlighted = ""; },
		[on.blur]: (e) => { delete e.target.dataset.highlighted; },
		[on.pointermove]: (e) => { if (!disabled) e.target.focus(); },
		...props,
	}}>${children}</div>`.on(([item]) => {
		itemRef.$ = item;
	});
}

/**
 * DropdownMenu CheckboxItem
 * @param {Object} props
 * @param {boolean|Pointer<boolean>} [props.checked] - Checked state
 * @param {Function} [props.onCheckedChange] - Checked change callback
 * @param {boolean} [props.disabled=false] - Disable this item
 * @param {Function} [props.onSelect] - Selection callback
 * @param {*} props.children - Item content
 * @returns {NodeList}
 */
export function DropdownMenuCheckboxItem({
	checked,
	onCheckedChange,
	disabled = false,
	onSelect,
	children,
	...props
}) {
	const ctx = DropdownMenuContext.use();
	const itemRef = $(null);
	const checkedState = typeof checked?.$ !== "undefined" ? checked : $(checked ?? false);

	queueMicrotask(() => {
		if (itemRef.$ && !disabled) {
			ctx.registerItem(itemRef);
		}
	});

	const handleSelect = () => {
		if (disabled) return;
		const newValue = !checkedState.$;
		checkedState.$ = newValue;
		onCheckedChange?.(newValue);
		onSelect?.();
	};

	return html`<div ${{
		role: "menuitemcheckbox",
		"aria-checked": checkedState,
		tabindex: disabled ? undefined : "-1",
		"aria-disabled": disabled,
		"data-disabled": disabled ? "" : undefined,
		"data-state": checkedState.into(c => c ? "checked" : "unchecked"),
		[on.click]: handleSelect,
		[on.keydown]: (e) => {
			if (e.key === Keys.Enter || e.key === Keys.Space) {
				e.preventDefault();
				handleSelect();
			}
		},
		[on.focus]: (e) => { e.target.dataset.highlighted = ""; },
		[on.blur]: (e) => { delete e.target.dataset.highlighted; },
		...props,
	}}>${children}</div>`.on(([item]) => {
		itemRef.$ = item;
	});
}

/**
 * DropdownMenu RadioGroup
 * @param {Object} props
 * @param {string|Pointer<string>} [props.value] - Selected value
 * @param {Function} [props.onValueChange] - Value change callback
 * @param {*} props.children - Radio items
 * @returns {NodeList}
 */
export function DropdownMenuRadioGroup({ value, onValueChange, children, ...props }) {
	const valueState = typeof value?.$ !== "undefined" ? value : $(value ?? "");

	const itemContext = {
		value: valueState,
		onValueChange: (newValue) => {
			valueState.$ = newValue;
			onValueChange?.(newValue);
		},
	};

	return html`<div ${{
		role: "group",
		...props,
	}}>${DropdownMenuItemContext.Provider(itemContext, children)}</div>`;
}

/**
 * DropdownMenu RadioItem
 * @param {Object} props
 * @param {string} props.value - Item value
 * @param {boolean} [props.disabled=false] - Disable this item
 * @param {Function} [props.onSelect] - Selection callback
 * @param {*} props.children - Item content
 * @returns {NodeList}
 */
export function DropdownMenuRadioItem({ value, disabled = false, onSelect, children, ...props }) {
	const menuCtx = DropdownMenuContext.use();
	const radioCtx = DropdownMenuItemContext.use();
	const itemRef = $(null);

	const isChecked = radioCtx.value.into(v => v === value);

	queueMicrotask(() => {
		if (itemRef.$ && !disabled) {
			menuCtx.registerItem(itemRef);
		}
	});

	const handleSelect = () => {
		if (disabled) return;
		radioCtx.onValueChange(value);
		onSelect?.();
		menuCtx.setOpen(false);
	};

	return html`<div ${{
		role: "menuitemradio",
		"aria-checked": isChecked,
		tabindex: disabled ? undefined : "-1",
		"aria-disabled": disabled,
		"data-disabled": disabled ? "" : undefined,
		"data-state": isChecked.into(c => c ? "checked" : "unchecked"),
		[on.click]: handleSelect,
		[on.keydown]: (e) => {
			if (e.key === Keys.Enter || e.key === Keys.Space) {
				e.preventDefault();
				handleSelect();
			}
		},
		[on.focus]: (e) => { e.target.dataset.highlighted = ""; },
		[on.blur]: (e) => { delete e.target.dataset.highlighted; },
		...props,
	}}>${children}</div>`.on(([item]) => {
		itemRef.$ = item;
	});
}

/**
 * DropdownMenu ItemIndicator
 * @param {Object} props
 * @param {boolean} [props.forceMount=false] - Force mount
 * @param {*} props.children - Indicator content
 * @returns {NodeList}
 */
export function DropdownMenuItemIndicator({ forceMount = false, children, ...props }) {
	return html`<span ${{ ...props }}>${children}</span>`;
}

/**
 * DropdownMenu Label
 * @param {Object} props
 * @param {*} props.children - Label text
 * @returns {NodeList}
 */
export function DropdownMenuLabel({ children, ...props }) {
	return html`<div ${{ ...props }}>${children}</div>`;
}

/**
 * DropdownMenu Separator
 * @param {Object} props
 * @returns {NodeList}
 */
export function DropdownMenuSeparator({ ...props }) {
	return html`<div ${{ role: "separator", "aria-orientation": "horizontal", ...props }}></div>`;
}

/**
 * DropdownMenu Group
 * @param {Object} props
 * @param {*} props.children - Group items
 * @returns {NodeList}
 */
export function DropdownMenuGroup({ children, ...props }) {
	return html`<div ${{ role: "group", ...props }}>${children}</div>`;
}

/**
 * DropdownMenu Shortcut hint
 * @param {Object} props
 * @param {*} props.children - Shortcut text
 * @returns {NodeList}
 */
export function DropdownMenuShortcut({ children, ...props }) {
	return html`<span ${{ ...props }}>${children}</span>`;
}

export { DropdownMenuContext, DropdownMenuItemContext };
