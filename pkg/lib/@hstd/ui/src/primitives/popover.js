import { h as html, $, on } from "@hstd/std";
import { Portal } from "../core/portal.js";
import { FocusScope } from "../core/focus-scope.js";
import { DismissableLayer } from "../core/dismissable-layer.js";
import { Presence } from "../core/presence.js";
import { Popper } from "../core/popper.js";
import { createContext } from "../core/context.js";
import { generateId } from "../utils/id.js";

/**
 * Popover primitive - Floating content panel
 * Non-modal by default, can be modal
 */

const PopoverContext = createContext(null);

/**
 * Popover Root
 * @param {Object} props
 * @param {boolean|Pointer<boolean>} [props.open] - Controlled open state
 * @param {boolean} [props.defaultOpen=false] - Default open state
 * @param {Function} [props.onOpenChange] - Open state change callback
 * @param {boolean} [props.modal=false] - Whether popover is modal
 * @param {*} props.children - Popover parts
 * @returns {NodeList}
 */
export function Popover({
	open,
	defaultOpen = false,
	onOpenChange,
	modal = false,
	children,
}) {
	const isControlled = open !== undefined;
	const openState = isControlled
		? (typeof open?.$ !== "undefined" ? open : $(open))
		: $(defaultOpen);

	const triggerRef = $(null);
	const contentId = generateId("popover");

	const setOpen = (newOpen) => {
		if (!isControlled) {
			openState.$ = newOpen;
		}
		onOpenChange?.(newOpen);
	};

	const context = {
		open: openState,
		setOpen,
		modal,
		triggerRef,
		contentId,
	};

	return PopoverContext.Provider(context, children);
}

/**
 * Popover Trigger
 * @param {Object} props
 * @param {*} props.children - Trigger content
 * @returns {NodeList}
 */
export function PopoverTrigger({ children, ...props }) {
	const ctx = PopoverContext.use();

	return html`<button ${{
		type: "button",
		"aria-haspopup": "dialog",
		"aria-expanded": ctx.open,
		"aria-controls": ctx.contentId,
		"data-state": ctx.open.into(o => o ? "open" : "closed"),
		[on.click]: () => ctx.setOpen(!ctx.open.$),
		...props,
	}}>${children}</button>`.on(([trigger]) => {
		ctx.triggerRef.$ = trigger;
	});
}

/**
 * Popover Anchor - Alternative anchor point
 * @param {Object} props
 * @param {*} props.children - Anchor content
 * @returns {NodeList}
 */
export function PopoverAnchor({ children, ...props }) {
	const ctx = PopoverContext.use();

	return html`<div ${{ ...props }}>${children}</div>`.on(([anchor]) => {
		ctx.triggerRef.$ = anchor;
	});
}

/**
 * Popover Portal
 * @param {Object} props
 * @param {Element} [props.container] - Portal container
 * @param {*} props.children - Content
 * @returns {NodeList}
 */
export function PopoverPortal({ container, children }) {
	const ctx = PopoverContext.use();

	return html`${ctx.open.into(isOpen => {
		if (!isOpen) return "";
		return Portal({ container, children: PopoverContext.Provider(ctx, children) });
	})}`;
}

/**
 * Popover Content
 * @param {Object} props
 * @param {string} [props.side="bottom"] - Preferred side
 * @param {number} [props.sideOffset=0] - Offset from trigger
 * @param {string} [props.align="center"] - Alignment
 * @param {number} [props.alignOffset=0] - Alignment offset
 * @param {Function} [props.onOpenAutoFocus] - Auto focus callback
 * @param {Function} [props.onCloseAutoFocus] - Close focus callback
 * @param {Function} [props.onEscapeKeyDown] - Escape key callback
 * @param {Function} [props.onPointerDownOutside] - Outside click callback
 * @param {Function} [props.onFocusOutside] - Focus outside callback
 * @param {Function} [props.onInteractOutside] - Any outside interaction
 * @param {boolean} [props.forceMount=false] - Force mount
 * @param {*} props.children - Content
 * @returns {NodeList}
 */
export function PopoverContent({
	side = "bottom",
	sideOffset = 0,
	align = "center",
	alignOffset = 0,
	onOpenAutoFocus,
	onCloseAutoFocus,
	onEscapeKeyDown,
	onPointerDownOutside,
	onFocusOutside,
	onInteractOutside,
	forceMount = false,
	children,
	...props
}) {
	const ctx = PopoverContext.use();

	const placement = align === "center" ? side : `${side}-${align === "start" ? "start" : "end"}`;

	const renderContent = ({ state }) => {
		const content = html`<div ${{
			role: "dialog",
			id: ctx.contentId,
			"data-state": state.into(s => s === "mounted" ? "open" : "closed"),
			"data-side": side,
			"data-align": align,
			tabindex: "-1",
			...props,
		}}>${children}</div>`;

		const positioned = Popper({
			anchor: ctx.triggerRef,
			placement,
			offset: sideOffset,
			children: content,
		});

		if (ctx.modal) {
			return DismissableLayer({
				onEscapeKeyDown: (e) => {
					onEscapeKeyDown?.(e);
					if (!e.defaultPrevented) ctx.setOpen(false);
				},
				onPointerDownOutside: (e) => {
					onPointerDownOutside?.(e);
					onInteractOutside?.(e);
					if (!e.defaultPrevented) ctx.setOpen(false);
				},
				onFocusOutside: (e) => {
					onFocusOutside?.(e);
					onInteractOutside?.(e);
				},
				children: FocusScope({
					trapped: true,
					onMountAutoFocus: onOpenAutoFocus,
					onUnmountAutoFocus: onCloseAutoFocus,
					children: positioned,
				}),
			});
		}

		return DismissableLayer({
			onEscapeKeyDown: (e) => {
				onEscapeKeyDown?.(e);
				if (!e.defaultPrevented) ctx.setOpen(false);
			},
			onPointerDownOutside: (e) => {
				onPointerDownOutside?.(e);
				onInteractOutside?.(e);
				if (!e.defaultPrevented) ctx.setOpen(false);
			},
			children: positioned,
		});
	};

	if (forceMount) {
		return renderContent({ state: $("mounted") });
	}

	return html`${Presence({
		present: ctx.open,
		children: renderContent,
	})}`;
}

/**
 * Popover Close
 * @param {Object} props
 * @param {*} props.children - Close button content
 * @returns {NodeList}
 */
export function PopoverClose({ children, ...props }) {
	const ctx = PopoverContext.use();

	return html`<button ${{
		type: "button",
		[on.click]: () => ctx.setOpen(false),
		...props,
	}}>${children}</button>`;
}

/**
 * Popover Arrow
 * @param {Object} props
 * @param {number} [props.width=10] - Arrow width
 * @param {number} [props.height=5] - Arrow height
 * @returns {NodeList}
 */
export function PopoverArrow({ width = 10, height = 5, ...props }) {
	return html`<svg ${{
		width,
		height,
		viewBox: `0 0 ${width} ${height}`,
		...props,
	}}><polygon points="${width / 2},0 ${width},${height} 0,${height}"/></svg>`;
}

export { PopoverContext };
