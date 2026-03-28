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
 * Menubar primitive - Horizontal menu bar
 * Follows WAI-ARIA Menubar pattern
 */

const MenubarContext = createContext(null);
const MenubarMenuContext = createContext(null);

/**
 * Menubar Root
 * @param {Object} props
 * @param {string|Pointer<string>} [props.value] - Controlled open menu
 * @param {string} [props.defaultValue] - Default open menu
 * @param {Function} [props.onValueChange] - Value change callback
 * @param {boolean} [props.loop=true] - Loop keyboard navigation
 * @param {"ltr" | "rtl"} [props.dir="ltr"] - Text direction
 * @param {*} props.children - Menubar menus
 * @returns {NodeList}
 */
export function Menubar({
	value,
	defaultValue,
	onValueChange,
	loop = true,
	dir = "ltr",
	children,
	...props
}) {
	const isControlled = value !== undefined;
	const valueState = isControlled
		? (typeof value?.$ !== "undefined" ? value : $(value))
		: $(defaultValue || "");

	const triggerRefs = new Map();

	const setValue = (newValue) => {
		if (!isControlled) {
			valueState.$ = newValue;
		}
		onValueChange?.(newValue);
	};

	const registerTrigger = (menuValue, ref) => {
		triggerRefs.set(menuValue, ref);
	};

	const handleKeyDown = (event) => {
		const triggers = [...triggerRefs.entries()];
		const currentIndex = triggers.findIndex(([_, ref]) =>
			ref.$ === document.activeElement
		);

		const newIndex = handleArrowNavigation(event, {
			currentIndex,
			maxIndex: triggers.length - 1,
			loop,
			orientation: "horizontal",
		});

		if (newIndex !== null) {
			event.preventDefault();
			const [menuValue, ref] = triggers[newIndex];
			ref.$?.focus();

			// If a menu is open, open the new one
			if (valueState.$) {
				setValue(menuValue);
			}
		}
	};

	const context = {
		value: valueState,
		setValue,
		dir,
		loop,
		registerTrigger,
		triggerRefs,
	};

	return html`<div ${{
		role: "menubar",
		dir,
		[on.keydown]: handleKeyDown,
		...props,
	}}>${MenubarContext.Provider(context, children)}</div>`;
}

/**
 * Menubar Menu
 * @param {Object} props
 * @param {string} [props.value] - Menu value (auto-generated if not provided)
 * @param {*} props.children - Menu parts
 * @returns {NodeList}
 */
export function MenubarMenu({ value, children }) {
	const menuValue = value || generateId("menu");

	const menuContext = {
		value: menuValue,
	};

	return MenubarMenuContext.Provider(menuContext, children);
}

/**
 * Menubar Trigger
 * @param {Object} props
 * @param {boolean} [props.disabled=false] - Disable the trigger
 * @param {*} props.children - Trigger content
 * @returns {NodeList}
 */
export function MenubarTrigger({ disabled = false, children, ...props }) {
	const ctx = MenubarContext.use();
	const menuCtx = MenubarMenuContext.use();
	const triggerRef = $(null);

	const contentId = generateId("menubar-content");

	queueMicrotask(() => {
		if (triggerRef.$) {
			ctx.registerTrigger(menuCtx.value, triggerRef);
		}
	});

	const isOpen = ctx.value.into(v => v === menuCtx.value);

	const handleClick = () => {
		if (disabled) return;
		ctx.setValue(ctx.value.$ === menuCtx.value ? "" : menuCtx.value);
	};

	const handleKeyDown = (event) => {
		if (disabled) return;

		if (event.key === Keys.ArrowDown || event.key === Keys.Enter || event.key === Keys.Space) {
			event.preventDefault();
			ctx.setValue(menuCtx.value);
		}
	};

	return html`<button ${{
		type: "button",
		role: "menuitem",
		"aria-haspopup": "menu",
		"aria-expanded": isOpen,
		"aria-controls": contentId,
		"data-state": isOpen.into(o => o ? "open" : "closed"),
		"data-disabled": disabled ? "" : undefined,
		disabled,
		[on.click]: handleClick,
		[on.keydown]: handleKeyDown,
		[on.pointerenter]: () => {
			// Open on hover if another menu is open
			if (ctx.value.$ && ctx.value.$ !== menuCtx.value) {
				ctx.setValue(menuCtx.value);
			}
		},
		...props,
	}}>${children}</button>`.on(([trigger]) => {
		triggerRef.$ = trigger;
		trigger._contentId = contentId;
	});
}

/**
 * Menubar Portal
 * @param {Object} props
 * @param {Element} [props.container] - Portal container
 * @param {*} props.children - Content
 * @returns {NodeList}
 */
export function MenubarPortal({ container, children }) {
	const ctx = MenubarContext.use();
	const menuCtx = MenubarMenuContext.use();

	const isOpen = ctx.value.into(v => v === menuCtx.value);

	return html`${isOpen.into(open => {
		if (!open) return "";
		return Portal({
			container,
			children: MenubarContext.Provider(ctx, MenubarMenuContext.Provider(menuCtx, children)),
		});
	})}`;
}

/**
 * Menubar Content
 * @param {Object} props
 * @param {string} [props.side="bottom"] - Preferred side
 * @param {number} [props.sideOffset=0] - Offset from trigger
 * @param {string} [props.align="start"] - Alignment
 * @param {boolean} [props.loop=false] - Loop keyboard navigation
 * @param {Function} [props.onCloseAutoFocus] - Close focus callback
 * @param {*} props.children - Menu items
 * @returns {NodeList}
 */
export function MenubarContent({
	side = "bottom",
	sideOffset = 0,
	align = "start",
	loop = false,
	onCloseAutoFocus,
	children,
	...props
}) {
	const ctx = MenubarContext.use();
	const menuCtx = MenubarMenuContext.use();
	const itemRefs = [];

	const isOpen = ctx.value.into(v => v === menuCtx.value);

	const registerItem = (ref) => {
		itemRefs.push(ref);
	};

	const handleKeyDown = (event) => {
		if (event.key === Keys.Escape) {
			ctx.setValue("");
			ctx.triggerRefs.get(menuCtx.value)?.$?.focus();
			return;
		}

		const currentIndex = itemRefs.findIndex(ref =>
			ref.$ === document.activeElement
		);

		const newIndex = handleArrowNavigation(event, {
			currentIndex,
			maxIndex: itemRefs.length - 1,
			loop,
			orientation: "vertical",
		});

		if (newIndex !== null) {
			event.preventDefault();
			itemRefs[newIndex].$?.focus();
		}
	};

	const placement = `${side}-${align}`;
	const triggerRef = ctx.triggerRefs.get(menuCtx.value);

	const contentContext = { registerItem };

	return html`${Presence({
		present: isOpen,
		children: ({ state }) => DismissableLayer({
			onDismiss: () => ctx.setValue(""),
			children: FocusScope({
				trapped: true,
				onUnmountAutoFocus: onCloseAutoFocus,
				children: Popper({
					anchor: triggerRef,
					placement,
					offset: sideOffset,
					children: html`<div ${{
						role: "menu",
						"aria-orientation": "vertical",
						"data-state": state.into(s => s === "mounted" ? "open" : "closed"),
						dir: ctx.dir,
						tabindex: "-1",
						[on.keydown]: handleKeyDown,
						...props,
					}}>${MenubarContentContext.Provider(contentContext, children)}</div>`,
				}),
			}),
		}),
	})}`;
}

const MenubarContentContext = createContext(null);

/**
 * Menubar Item
 * @param {Object} props
 * @param {boolean} [props.disabled=false] - Disable this item
 * @param {Function} [props.onSelect] - Selection callback
 * @param {*} props.children - Item content
 * @returns {NodeList}
 */
export function MenubarItem({ disabled = false, onSelect, children, ...props }) {
	const ctx = MenubarContext.use();
	const contentCtx = MenubarContentContext.use();
	const itemRef = $(null);

	queueMicrotask(() => {
		if (itemRef.$ && !disabled) {
			contentCtx?.registerItem(itemRef);
		}
	});

	const handleSelect = () => {
		if (disabled) return;
		onSelect?.();
		ctx.setValue("");
	};

	return html`<div ${{
		role: "menuitem",
		tabindex: disabled ? undefined : "-1",
		"aria-disabled": disabled,
		"data-disabled": disabled ? "" : undefined,
		[on.click]: handleSelect,
		[on.keydown]: (e) => {
			if (e.key === Keys.Enter || e.key === Keys.Space) {
				e.preventDefault();
				handleSelect();
			}
		},
		[on.focus]: (e) => { e.target.dataset.highlighted = ""; },
		[on.blur]: (e) => { delete e.target.dataset.highlighted; },
		[on.pointermove]: (e) => { if (!disabled) e.target.focus(); },
		...props,
	}}>${children}</div>`.on(([item]) => {
		itemRef.$ = item;
	});
}

/**
 * Menubar CheckboxItem
 */
export function MenubarCheckboxItem({
	checked,
	onCheckedChange,
	disabled = false,
	onSelect,
	children,
	...props
}) {
	const ctx = MenubarContext.use();
	const contentCtx = MenubarContentContext.use();
	const itemRef = $(null);
	const checkedState = typeof checked?.$ !== "undefined" ? checked : $(checked ?? false);

	queueMicrotask(() => {
		if (itemRef.$ && !disabled) {
			contentCtx?.registerItem(itemRef);
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
 * Menubar RadioGroup
 */
export function MenubarRadioGroup({ value, onValueChange, children, ...props }) {
	const valueState = typeof value?.$ !== "undefined" ? value : $(value ?? "");

	const radioContext = {
		value: valueState,
		onValueChange: (newValue) => {
			valueState.$ = newValue;
			onValueChange?.(newValue);
		},
	};

	return html`<div ${{
		role: "group",
		...props,
	}}>${MenubarRadioGroupContext.Provider(radioContext, children)}</div>`;
}

const MenubarRadioGroupContext = createContext(null);

/**
 * Menubar RadioItem
 */
export function MenubarRadioItem({ value, disabled = false, onSelect, children, ...props }) {
	const menubarCtx = MenubarContext.use();
	const contentCtx = MenubarContentContext.use();
	const radioCtx = MenubarRadioGroupContext.use();
	const itemRef = $(null);

	const isChecked = radioCtx?.value.into(v => v === value);

	queueMicrotask(() => {
		if (itemRef.$ && !disabled) {
			contentCtx?.registerItem(itemRef);
		}
	});

	const handleSelect = () => {
		if (disabled) return;
		radioCtx?.onValueChange(value);
		onSelect?.();
		menubarCtx.setValue("");
	};

	return html`<div ${{
		role: "menuitemradio",
		"aria-checked": isChecked,
		tabindex: disabled ? undefined : "-1",
		"aria-disabled": disabled,
		"data-state": isChecked?.into(c => c ? "checked" : "unchecked"),
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
 * Menubar ItemIndicator
 */
export function MenubarItemIndicator({ children, ...props }) {
	return html`<span ${{ ...props }}>${children}</span>`;
}

/**
 * Menubar Separator
 */
export function MenubarSeparator({ ...props }) {
	return html`<div ${{ role: "separator", ...props }}></div>`;
}

/**
 * Menubar Label
 */
export function MenubarLabel({ children, ...props }) {
	return html`<div ${{ ...props }}>${children}</div>`;
}

/**
 * Menubar Group
 */
export function MenubarGroup({ children, ...props }) {
	return html`<div ${{ role: "group", ...props }}>${children}</div>`;
}

/**
 * Menubar Shortcut
 */
export function MenubarShortcut({ children, ...props }) {
	return html`<span ${{ ...props }}>${children}</span>`;
}

export {
	MenubarContext,
	MenubarMenuContext,
	MenubarContentContext,
	MenubarRadioGroupContext,
};
