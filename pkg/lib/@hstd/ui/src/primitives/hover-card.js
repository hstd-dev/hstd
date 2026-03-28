import { h as html, $, on } from "@hstd/std";
import { Portal } from "../core/portal.js";
import { Presence } from "../core/presence.js";
import { Popper } from "../core/popper.js";
import { createContext } from "../core/context.js";
import { generateId } from "../utils/id.js";

/**
 * HoverCard primitive - Rich preview popup on hover
 * Can contain interactive elements (unlike Tooltip)
 */

const HoverCardContext = createContext(null);

/**
 * HoverCard Root
 * @param {Object} props
 * @param {boolean|Pointer<boolean>} [props.open] - Controlled open state
 * @param {boolean} [props.defaultOpen=false] - Default open state
 * @param {Function} [props.onOpenChange] - Open state change callback
 * @param {number} [props.openDelay=700] - Open delay in ms
 * @param {number} [props.closeDelay=300] - Close delay in ms
 * @param {*} props.children - HoverCard parts
 * @returns {NodeList}
 */
export function HoverCard({
	open,
	defaultOpen = false,
	onOpenChange,
	openDelay = 700,
	closeDelay = 300,
	children,
}) {
	const isControlled = open !== undefined;
	const openState = isControlled
		? (typeof open?.$ !== "undefined" ? open : $(open))
		: $(defaultOpen);

	const triggerRef = $(null);
	const contentId = generateId("hovercard");

	let openTimer = null;
	let closeTimer = null;

	const setOpen = (newOpen) => {
		clearTimeout(openTimer);
		clearTimeout(closeTimer);

		if (!isControlled) {
			openState.$ = newOpen;
		}
		onOpenChange?.(newOpen);
	};

	const handleOpen = () => {
		clearTimeout(closeTimer);
		openTimer = setTimeout(() => setOpen(true), openDelay);
	};

	const handleClose = () => {
		clearTimeout(openTimer);
		closeTimer = setTimeout(() => setOpen(false), closeDelay);
	};

	const handleDismiss = () => {
		clearTimeout(openTimer);
		clearTimeout(closeTimer);
		setOpen(false);
	};

	const context = {
		open: openState,
		setOpen,
		handleOpen,
		handleClose,
		handleDismiss,
		triggerRef,
		contentId,
	};

	return HoverCardContext.Provider(context, children);
}

/**
 * HoverCard Trigger
 * @param {Object} props
 * @param {*} props.children - Trigger content
 * @returns {NodeList}
 */
export function HoverCardTrigger({ children, ...props }) {
	const ctx = HoverCardContext.use();

	return html`<a ${{
		"data-state": ctx.open.into(o => o ? "open" : "closed"),
		[on.pointerenter]: ctx.handleOpen,
		[on.pointerleave]: ctx.handleClose,
		[on.focus]: ctx.handleOpen,
		[on.blur]: ctx.handleClose,
		...props,
	}}>${children}</a>`.on(([trigger]) => {
		ctx.triggerRef.$ = trigger;
	});
}

/**
 * HoverCard Portal
 * @param {Object} props
 * @param {Element} [props.container] - Portal container
 * @param {*} props.children - Content
 * @returns {NodeList}
 */
export function HoverCardPortal({ container, children }) {
	const ctx = HoverCardContext.use();

	return html`${ctx.open.into(isOpen => {
		if (!isOpen) return "";
		return Portal({ container, children: HoverCardContext.Provider(ctx, children) });
	})}`;
}

/**
 * HoverCard Content
 * @param {Object} props
 * @param {string} [props.side="bottom"] - Preferred side
 * @param {number} [props.sideOffset=0] - Offset from trigger
 * @param {string} [props.align="center"] - Alignment
 * @param {boolean} [props.avoidCollisions=true] - Avoid viewport edges
 * @param {*} props.children - Card content
 * @returns {NodeList}
 */
export function HoverCardContent({
	side = "bottom",
	sideOffset = 0,
	align = "center",
	avoidCollisions = true,
	children,
	...props
}) {
	const ctx = HoverCardContext.use();

	const placement = align === "center" ? side : `${side}-${align === "start" ? "start" : "end"}`;

	return html`${Presence({
		present: ctx.open,
		children: ({ state }) => Popper({
			anchor: ctx.triggerRef,
			placement,
			offset: sideOffset,
			flip: avoidCollisions,
			shift: avoidCollisions,
			children: html`<div ${{
				"data-state": state.into(s => s === "mounted" ? "open" : "closed"),
				"data-side": side,
				"data-align": align,
				[on.pointerenter]: ctx.handleOpen,
				[on.pointerleave]: ctx.handleClose,
				...props,
			}}>${children}</div>`,
		}),
	})}`;
}

/**
 * HoverCard Arrow
 * @param {Object} props
 * @param {number} [props.width=10] - Arrow width
 * @param {number} [props.height=5] - Arrow height
 * @returns {NodeList}
 */
export function HoverCardArrow({ width = 10, height = 5, ...props }) {
	return html`<svg ${{
		width,
		height,
		viewBox: `0 0 ${width} ${height}`,
		...props,
	}}><polygon points="${width / 2},${height} 0,0 ${width},0"/></svg>`;
}

export { HoverCardContext };
