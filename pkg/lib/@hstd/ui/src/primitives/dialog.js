import { h as html, $, css, on } from "@hstd/std";
import { Portal } from "../core/portal.js";
import { FocusScope } from "../core/focus-scope.js";
import { DismissableLayer } from "../core/dismissable-layer.js";
import { Presence } from "../core/presence.js";
import { createContext } from "../core/context.js";
import { generateId } from "../utils/id.js";

/**
 * Dialog primitive - Modal dialog component
 * Follows WAI-ARIA Dialog pattern
 */

const DialogContext = createContext(null);

/**
 * Dialog Root - Container and state management
 * @param {Object} props
 * @param {boolean|Pointer<boolean>} [props.open] - Controlled open state
 * @param {boolean} [props.defaultOpen=false] - Default open state
 * @param {Function} [props.onOpenChange] - Callback when open state changes
 * @param {boolean} [props.modal=true] - Whether dialog is modal
 * @param {*} props.children - Dialog content
 * @returns {NodeList}
 */
export function Dialog({
	open,
	defaultOpen = false,
	onOpenChange,
	modal = true,
	children,
}) {
	const isControlled = open !== undefined;
	const openState = isControlled
		? (typeof open?.$ !== "undefined" ? open : $(open))
		: $(defaultOpen);

	const titleId = generateId("dialog-title");
	const descriptionId = generateId("dialog-desc");
	const contentId = generateId("dialog-content");

	const setOpen = (value) => {
		if (!isControlled) {
			openState.$ = value;
		}
		onOpenChange?.(value);
	};

	const context = {
		open: openState,
		setOpen,
		modal,
		titleId,
		descriptionId,
		contentId,
	};

	return DialogContext.Provider(context, children);
}

/**
 * Dialog Trigger - Button to open dialog
 * @param {Object} props
 * @param {*} props.children - Trigger content
 * @param {boolean} [props.asChild=false] - Render as child element
 * @returns {NodeList}
 */
export function DialogTrigger({ children, asChild = false, ...props }) {
	const ctx = DialogContext.use();

	const handleClick = () => {
		ctx.setOpen(true);
	};

	if (asChild) {
		return html`<span ${{
			[on.click]: handleClick,
		}}>${children}</span>`;
	}

	return html`<button ${{
		type: "button",
		"aria-haspopup": "dialog",
		"aria-expanded": ctx.open,
		"aria-controls": ctx.contentId,
		[on.click]: handleClick,
		...props,
	}}>${children}</button>`;
}

/**
 * Dialog Portal - Renders content in portal
 * @param {Object} props
 * @param {Element} [props.container] - Portal container
 * @param {*} props.children - Content
 * @returns {NodeList}
 */
export function DialogPortal({ container, children }) {
	const ctx = DialogContext.use();

	return html`${ctx.open.into(isOpen => {
		if (!isOpen) return "";
		return Portal({ container, children: DialogContext.Provider(ctx, children) });
	})}`;
}

/**
 * Dialog Overlay - Background overlay
 * @param {Object} props
 * @returns {NodeList}
 */
export function DialogOverlay({ ...props }) {
	const ctx = DialogContext.use();

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
 * Dialog Content - Main content container
 * @param {Object} props
 * @param {Function} [props.onEscapeKeyDown] - Escape key handler
 * @param {Function} [props.onPointerDownOutside] - Outside click handler
 * @param {Function} [props.onOpenAutoFocus] - Auto focus handler
 * @param {Function} [props.onCloseAutoFocus] - Close focus handler
 * @param {*} props.children - Content
 * @returns {NodeList}
 */
export function DialogContent({
	onEscapeKeyDown,
	onPointerDownOutside,
	onOpenAutoFocus,
	onCloseAutoFocus,
	children,
	...props
}) {
	const ctx = DialogContext.use();

	return html`${Presence({
		present: ctx.open,
		children: ({ state }) => {
			const content = html`<div ${{
				role: "dialog",
				id: ctx.contentId,
				"aria-modal": ctx.modal,
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
			}}>${children}</div>`;

			if (ctx.modal) {
				return DismissableLayer({
					onEscapeKeyDown: (e) => {
						onEscapeKeyDown?.(e);
						if (!e.defaultPrevented) ctx.setOpen(false);
					},
					onPointerDownOutside: (e) => {
						onPointerDownOutside?.(e);
						if (!e.defaultPrevented) ctx.setOpen(false);
					},
					onDismiss: () => ctx.setOpen(false),
					children: FocusScope({
						trapped: true,
						loop: true,
						onMountAutoFocus: onOpenAutoFocus,
						onUnmountAutoFocus: onCloseAutoFocus,
						children: content,
					}),
				});
			}

			return content;
		},
	})}`;
}

/**
 * Dialog Close - Button to close dialog
 * @param {Object} props
 * @param {*} props.children - Close button content
 * @returns {NodeList}
 */
export function DialogClose({ children, ...props }) {
	const ctx = DialogContext.use();

	return html`<button ${{
		type: "button",
		[on.click]: () => ctx.setOpen(false),
		...props,
	}}>${children}</button>`;
}

/**
 * Dialog Title - Dialog heading
 * @param {Object} props
 * @param {*} props.children - Title content
 * @returns {NodeList}
 */
export function DialogTitle({ children, ...props }) {
	const ctx = DialogContext.use();

	return html`<h2 ${{
		id: ctx.titleId,
		...props,
	}}>${children}</h2>`;
}

/**
 * Dialog Description - Dialog description
 * @param {Object} props
 * @param {*} props.children - Description content
 * @returns {NodeList}
 */
export function DialogDescription({ children, ...props }) {
	const ctx = DialogContext.use();

	return html`<p ${{
		id: ctx.descriptionId,
		...props,
	}}>${children}</p>`;
}

export { DialogContext };
