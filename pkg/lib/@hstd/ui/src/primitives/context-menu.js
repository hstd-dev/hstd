import { h as html, $, on } from "@hstd/std";
import { Portal } from "../core/portal.js";
import { FocusScope } from "../core/focus-scope.js";
import { DismissableLayer } from "../core/dismissable-layer.js";
import { Presence } from "../core/presence.js";
import { createContext } from "../core/context.js";
import { generateId } from "../utils/id.js";
import { Keys, handleArrowNavigation } from "../utils/keyboard.js";

/**
 * ContextMenu primitive - Right-click context menu
 * Opens at pointer position on right-click
 */

const ContextMenuContext = createContext(null);

/**
 * ContextMenu Root
 * @param {Object} props
 * @param {boolean|Pointer<boolean>} [props.open] - Controlled open state
 * @param {Function} [props.onOpenChange] - Open state change callback
 * @param {boolean} [props.modal=true] - Whether menu is modal
 * @param {"ltr" | "rtl"} [props.dir="ltr"] - Text direction
 * @param {*} props.children - Menu parts
 * @returns {NodeList}
 */
export function ContextMenu({
	open,
	onOpenChange,
	modal = true,
	dir = "ltr",
	children,
}) {
	const isControlled = open !== undefined;
	const openState = isControlled
		? (typeof open?.$ !== "undefined" ? open : $(open))
		: $(false);

	const position = $({ x: 0, y: 0 });
	const contentId = generateId("context-menu");
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
		position,
		modal,
		dir,
		contentId,
		itemRefs,
		registerItem,
	};

	return ContextMenuContext.Provider(context, children);
}

/**
 * ContextMenu Trigger - Area that responds to right-click
 * @param {Object} props
 * @param {boolean} [props.disabled=false] - Disable trigger
 * @param {*} props.children - Trigger content
 * @returns {NodeList}
 */
export function ContextMenuTrigger({ disabled = false, children, ...props }) {
	const ctx = ContextMenuContext.use();

	const handleContextMenu = (event) => {
		if (disabled) return;

		event.preventDefault();
		ctx.position.$ = { x: event.clientX, y: event.clientY };
		ctx.setOpen(true);
	};

	return html`<span ${{
		"data-state": ctx.open.into(o => o ? "open" : "closed"),
		"data-disabled": disabled ? "" : undefined,
		[on.contextmenu]: handleContextMenu,
		...props,
	}}>${children}</span>`;
}

/**
 * ContextMenu Portal
 * @param {Object} props
 * @param {Element} [props.container] - Portal container
 * @param {*} props.children - Content
 * @returns {NodeList}
 */
export function ContextMenuPortal({ container, children }) {
	const ctx = ContextMenuContext.use();

	return html`${ctx.open.into(isOpen => {
		if (!isOpen) return "";
		return Portal({ container, children: ContextMenuContext.Provider(ctx, children) });
	})}`;
}

/**
 * ContextMenu Content
 * @param {Object} props
 * @param {boolean} [props.loop=false] - Loop keyboard navigation
 * @param {Function} [props.onCloseAutoFocus] - Close focus callback
 * @param {Function} [props.onEscapeKeyDown] - Escape key callback
 * @param {Function} [props.onPointerDownOutside] - Outside click callback
 * @param {number} [props.alignOffset=0] - Alignment offset
 * @param {*} props.children - Menu items
 * @returns {NodeList}
 */
export function ContextMenuContent({
	loop = false,
	onCloseAutoFocus,
	onEscapeKeyDown,
	onPointerDownOutside,
	alignOffset = 0,
	children,
	...props
}) {
	const ctx = ContextMenuContext.use();

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

	const getStyle = (pos) => ({
		position: "fixed",
		left: `${pos.x + alignOffset}px`,
		top: `${pos.y}px`,
		zIndex: "9999",
	});

	return html`${Presence({
		present: ctx.open,
		children: ({ state }) => DismissableLayer({
			onEscapeKeyDown: (e) => {
				onEscapeKeyDown?.(e);
				if (!e.defaultPrevented) ctx.setOpen(false);
			},
			onPointerDownOutside: (e) => {
				onPointerDownOutside?.(e);
				if (!e.defaultPrevented) ctx.setOpen(false);
			},
			children: FocusScope({
				trapped: ctx.modal,
				onUnmountAutoFocus: onCloseAutoFocus,
				children: html`<div ${{
					role: "menu",
					id: ctx.contentId,
					"aria-orientation": "vertical",
					"data-state": state.into(s => s === "mounted" ? "open" : "closed"),
					dir: ctx.dir,
					tabindex: "-1",
					style: ctx.position.into(getStyle),
					[on.keydown]: handleKeyDown,
					...props,
				}}>${children}</div>`,
			}),
		}),
	})}`;
}

/**
 * ContextMenu Item
 * @param {Object} props
 * @param {boolean} [props.disabled=false] - Disable this item
 * @param {Function} [props.onSelect] - Selection callback
 * @param {*} props.children - Item content
 * @returns {NodeList}
 */
export function ContextMenuItem({ disabled = false, onSelect, children, ...props }) {
	const ctx = ContextMenuContext.use();
	const itemRef = $(null);

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
 * ContextMenu CheckboxItem
 */
export function ContextMenuCheckboxItem({
	checked,
	onCheckedChange,
	disabled = false,
	onSelect,
	children,
	...props
}) {
	const ctx = ContextMenuContext.use();
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
 * ContextMenu RadioGroup
 */
export function ContextMenuRadioGroup({ value, onValueChange, children, ...props }) {
	const valueState = typeof value?.$ !== "undefined" ? value : $(value ?? "");

	return html`<div ${{
		role: "group",
		...props,
	}}>${children}</div>`;
}

/**
 * ContextMenu RadioItem
 */
export function ContextMenuRadioItem({ value, disabled = false, onSelect, children, ...props }) {
	const ctx = ContextMenuContext.use();
	const itemRef = $(null);

	return html`<div ${{
		role: "menuitemradio",
		tabindex: disabled ? undefined : "-1",
		"aria-disabled": disabled,
		[on.click]: () => {
			if (!disabled) {
				onSelect?.();
				ctx.setOpen(false);
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
 * ContextMenu Label
 */
export function ContextMenuLabel({ children, ...props }) {
	return html`<div ${{ ...props }}>${children}</div>`;
}

/**
 * ContextMenu Separator
 */
export function ContextMenuSeparator({ ...props }) {
	return html`<div ${{ role: "separator", ...props }}></div>`;
}

/**
 * ContextMenu Group
 */
export function ContextMenuGroup({ children, ...props }) {
	return html`<div ${{ role: "group", ...props }}>${children}</div>`;
}

export { ContextMenuContext };
