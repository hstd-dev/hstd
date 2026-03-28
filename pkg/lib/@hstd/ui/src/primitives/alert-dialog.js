import { h as html, $, css, on } from "@hstd/std";
import { Portal } from "../core/portal.js";
import { FocusScope } from "../core/focus-scope.js";
import { DismissableLayer } from "../core/dismissable-layer.js";
import { Presence } from "../core/presence.js";
import { createContext } from "../core/context.js";
import { generateId } from "../utils/id.js";

/**
 * AlertDialog primitive - Modal dialog that interrupts user workflow
 * Similar to Dialog but with stricter interaction model:
 * - Cannot be dismissed by clicking outside
 * - Requires explicit action
 */

const AlertDialogContext = createContext(null);

/**
 * AlertDialog Root
 * @param {Object} props
 * @param {boolean|Pointer<boolean>} [props.open] - Controlled open state
 * @param {boolean} [props.defaultOpen=false] - Default open state
 * @param {Function} [props.onOpenChange] - Callback when open state changes
 * @param {*} props.children - Content
 * @returns {NodeList}
 */
export function AlertDialog({
	open,
	defaultOpen = false,
	onOpenChange,
	children,
}) {
	const isControlled = open !== undefined;
	const openState = isControlled
		? (typeof open?.$ !== "undefined" ? open : $(open))
		: $(defaultOpen);

	const titleId = generateId("alert-title");
	const descriptionId = generateId("alert-desc");
	const contentId = generateId("alert-content");
	const cancelRef = $(null);

	const setOpen = (value) => {
		if (!isControlled) {
			openState.$ = value;
		}
		onOpenChange?.(value);
	};

	const context = {
		open: openState,
		setOpen,
		titleId,
		descriptionId,
		contentId,
		cancelRef,
	};

	return AlertDialogContext.Provider(context, children);
}

/**
 * AlertDialog Trigger
 * @param {Object} props
 * @param {*} props.children - Trigger content
 * @returns {NodeList}
 */
export function AlertDialogTrigger({ children, ...props }) {
	const ctx = AlertDialogContext.use();

	return html`<button ${{
		type: "button",
		"aria-haspopup": "dialog",
		"aria-expanded": ctx.open,
		"aria-controls": ctx.contentId,
		[on.click]: () => ctx.setOpen(true),
		...props,
	}}>${children}</button>`;
}

/**
 * AlertDialog Portal
 * @param {Object} props
 * @param {Element} [props.container] - Portal container
 * @param {*} props.children - Content
 * @returns {NodeList}
 */
export function AlertDialogPortal({ container, children }) {
	const ctx = AlertDialogContext.use();

	return html`${ctx.open.into(isOpen => {
		if (!isOpen) return "";
		return Portal({ container, children: AlertDialogContext.Provider(ctx, children) });
	})}`;
}

/**
 * AlertDialog Overlay
 * @param {Object} props
 * @returns {NodeList}
 */
export function AlertDialogOverlay({ ...props }) {
	const ctx = AlertDialogContext.use();

	return html`${Presence({
		present: ctx.open,
		children: ({ state }) => html`<div ${{
			"data-state": state.into(s => s === "mounted" ? "open" : "closed"),
			[css]: {
				position: "fixed",
				inset: "0",
				zIndex: "50",
			},
			...props,
		}}></div>`,
	})}`;
}

/**
 * AlertDialog Content
 * @param {Object} props
 * @param {Function} [props.onEscapeKeyDown] - Escape key handler
 * @param {Function} [props.onOpenAutoFocus] - Auto focus handler
 * @param {Function} [props.onCloseAutoFocus] - Close focus handler
 * @param {*} props.children - Content
 * @returns {NodeList}
 */
export function AlertDialogContent({
	onEscapeKeyDown,
	onOpenAutoFocus,
	onCloseAutoFocus,
	children,
	...props
}) {
	const ctx = AlertDialogContext.use();

	return html`${Presence({
		present: ctx.open,
		children: ({ state }) => DismissableLayer({
			// Alert dialogs only dismiss on Escape, not outside click
			onEscapeKeyDown: (e) => {
				onEscapeKeyDown?.(e);
				if (!e.defaultPrevented) ctx.setOpen(false);
			},
			onDismiss: () => ctx.setOpen(false),
			children: FocusScope({
				trapped: true,
				loop: true,
				onMountAutoFocus: (e) => {
					if (onOpenAutoFocus) {
						onOpenAutoFocus(e);
					} else {
						// Focus cancel button by default
						e.preventDefault();
						const cancelEl = ctx.cancelRef.$;
						if (cancelEl) cancelEl.focus();
					}
				},
				onUnmountAutoFocus: onCloseAutoFocus,
				children: html`<div ${{
					role: "alertdialog",
					id: ctx.contentId,
					"aria-modal": "true",
					"aria-labelledby": ctx.titleId,
					"aria-describedby": ctx.descriptionId,
					"data-state": state.into(s => s === "mounted" ? "open" : "closed"),
					tabindex: "-1",
					[css]: {
						position: "fixed",
						left: "50%",
						top: "50%",
						transform: "translate(-50%, -50%)",
						zIndex: "50",
					},
					...props,
				}}>${children}</div>`,
			}),
		}),
	})}`;
}

/**
 * AlertDialog Title
 * @param {Object} props
 * @param {*} props.children - Title content
 * @returns {NodeList}
 */
export function AlertDialogTitle({ children, ...props }) {
	const ctx = AlertDialogContext.use();

	return html`<h2 ${{
		id: ctx.titleId,
		...props,
	}}>${children}</h2>`;
}

/**
 * AlertDialog Description
 * @param {Object} props
 * @param {*} props.children - Description content
 * @returns {NodeList}
 */
export function AlertDialogDescription({ children, ...props }) {
	const ctx = AlertDialogContext.use();

	return html`<p ${{
		id: ctx.descriptionId,
		...props,
	}}>${children}</p>`;
}

/**
 * AlertDialog Cancel - Closes dialog without action
 * @param {Object} props
 * @param {*} props.children - Cancel button content
 * @returns {NodeList}
 */
export function AlertDialogCancel({ children, ...props }) {
	const ctx = AlertDialogContext.use();

	return html`<button ${{
		type: "button",
		id: ctx.cancelRef,
		[on.click]: () => ctx.setOpen(false),
		...props,
	}}>${children}</button>`;
}

/**
 * AlertDialog Action - Performs action and closes
 * @param {Object} props
 * @param {*} props.children - Action button content
 * @returns {NodeList}
 */
export function AlertDialogAction({ children, ...props }) {
	const ctx = AlertDialogContext.use();

	return html`<button ${{
		type: "button",
		[on.click]: () => ctx.setOpen(false),
		...props,
	}}>${children}</button>`;
}

export { AlertDialogContext };
