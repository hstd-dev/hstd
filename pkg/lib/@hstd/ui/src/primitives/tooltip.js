import { h as html, $, css, on } from "@hstd/std";
import { Portal } from "../core/portal.js";
import { Presence } from "../core/presence.js";
import { Popper } from "../core/popper.js";
import { VisuallyHidden } from "../core/visually-hidden.js";
import { createContext } from "../core/context.js";
import { generateId } from "../utils/id.js";

/**
 * Tooltip primitive - Informational popup on hover/focus
 * Non-interactive, dismisses on pointer leave
 */

const TooltipProviderContext = createContext(null);
const TooltipContext = createContext(null);

/**
 * TooltipProvider - Provides shared delay settings
 * @param {Object} props
 * @param {number} [props.delayDuration=700] - Open delay in ms
 * @param {number} [props.skipDelayDuration=300] - Skip delay after recent close
 * @param {boolean} [props.disableHoverableContent=false] - Disable hovering content
 * @param {*} props.children - Tooltips
 * @returns {NodeList}
 */
export function TooltipProvider({
	delayDuration = 700,
	skipDelayDuration = 300,
	disableHoverableContent = false,
	children,
}) {
	const isOpenDelayed = $(true);
	let skipDelayTimer = null;

	const onOpen = () => {
		clearTimeout(skipDelayTimer);
		isOpenDelayed.$ = false;
	};

	const onClose = () => {
		clearTimeout(skipDelayTimer);
		skipDelayTimer = setTimeout(() => {
			isOpenDelayed.$ = true;
		}, skipDelayDuration);
	};

	const context = {
		delayDuration,
		skipDelayDuration,
		disableHoverableContent,
		isOpenDelayed,
		onOpen,
		onClose,
	};

	return TooltipProviderContext.Provider(context, children);
}

/**
 * Tooltip Root
 * @param {Object} props
 * @param {boolean|Pointer<boolean>} [props.open] - Controlled open state
 * @param {boolean} [props.defaultOpen=false] - Default open state
 * @param {Function} [props.onOpenChange] - Open state change callback
 * @param {number} [props.delayDuration] - Override provider delay
 * @param {boolean} [props.disableHoverableContent] - Override provider setting
 * @param {*} props.children - Tooltip parts
 * @returns {NodeList}
 */
export function Tooltip({
	open,
	defaultOpen = false,
	onOpenChange,
	delayDuration,
	disableHoverableContent,
	children,
}) {
	const provider = TooltipProviderContext.use();
	const isControlled = open !== undefined;
	const openState = isControlled
		? (typeof open?.$ !== "undefined" ? open : $(open))
		: $(defaultOpen);

	const triggerRef = $(null);
	const contentId = generateId("tooltip");

	let openTimer = null;

	const actualDelay = delayDuration ?? provider?.delayDuration ?? 700;
	const actualDisableHoverable = disableHoverableContent ?? provider?.disableHoverableContent ?? false;

	const setOpen = (newOpen) => {
		clearTimeout(openTimer);

		if (!isControlled) {
			openState.$ = newOpen;
		}
		onOpenChange?.(newOpen);

		if (newOpen) {
			provider?.onOpen?.();
		} else {
			provider?.onClose?.();
		}
	};

	const handleOpen = () => {
		clearTimeout(openTimer);
		const shouldDelay = provider?.isOpenDelayed?.$ ?? true;

		if (shouldDelay) {
			openTimer = setTimeout(() => setOpen(true), actualDelay);
		} else {
			setOpen(true);
		}
	};

	const handleClose = () => {
		clearTimeout(openTimer);
		setOpen(false);
	};

	const context = {
		open: openState,
		setOpen,
		handleOpen,
		handleClose,
		triggerRef,
		contentId,
		disableHoverableContent: actualDisableHoverable,
	};

	return TooltipContext.Provider(context, children);
}

/**
 * Tooltip Trigger
 * @param {Object} props
 * @param {*} props.children - Trigger content
 * @returns {NodeList}
 */
export function TooltipTrigger({ children, ...props }) {
	const ctx = TooltipContext.use();

	return html`<button ${{
		type: "button",
		"aria-describedby": ctx.open.into(o => o ? ctx.contentId : undefined),
		"data-state": ctx.open.into(o => o ? "delayed-open" : "closed"),
		[on.pointerenter]: ctx.handleOpen,
		[on.pointerleave]: ctx.handleClose,
		[on.focus]: ctx.handleOpen,
		[on.blur]: ctx.handleClose,
		[on.click]: ctx.handleClose,
		...props,
	}}>${children}</button>`.on(([trigger]) => {
		ctx.triggerRef.$ = trigger;
	});
}

/**
 * Tooltip Portal
 * @param {Object} props
 * @param {Element} [props.container] - Portal container
 * @param {*} props.children - Content
 * @returns {NodeList}
 */
export function TooltipPortal({ container, children }) {
	const ctx = TooltipContext.use();

	return html`${ctx.open.into(isOpen => {
		if (!isOpen) return "";
		return Portal({ container, children: TooltipContext.Provider(ctx, children) });
	})}`;
}

/**
 * Tooltip Content
 * @param {Object} props
 * @param {string} [props.side="top"] - Preferred side
 * @param {number} [props.sideOffset=0] - Offset from trigger
 * @param {string} [props.align="center"] - Alignment
 * @param {boolean} [props.avoidCollisions=true] - Avoid viewport edges
 * @param {*} props.children - Tooltip content
 * @returns {NodeList}
 */
export function TooltipContent({
	side = "top",
	sideOffset = 0,
	align = "center",
	avoidCollisions = true,
	children,
	...props
}) {
	const ctx = TooltipContext.use();

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
				role: "tooltip",
				id: ctx.contentId,
				"data-state": state.into(s => s === "mounted" ? "delayed-open" : "closed"),
				"data-side": side,
				"data-align": align,
				[on.pointerenter]: () => {
					if (!ctx.disableHoverableContent) {
						// Keep open while hovering content
					}
				},
				[on.pointerleave]: () => {
					if (!ctx.disableHoverableContent) {
						ctx.handleClose();
					}
				},
				...props,
			}}>${children}</div>`,
		}),
	})}`;
}

/**
 * Tooltip Arrow
 * @param {Object} props
 * @param {number} [props.width=10] - Arrow width
 * @param {number} [props.height=5] - Arrow height
 * @returns {NodeList}
 */
export function TooltipArrow({ width = 10, height = 5, ...props }) {
	return html`<svg ${{
		width,
		height,
		viewBox: `0 0 ${width} ${height}`,
		...props,
	}}><polygon points="${width / 2},${height} 0,0 ${width},0"/></svg>`;
}

export { TooltipProviderContext, TooltipContext };
