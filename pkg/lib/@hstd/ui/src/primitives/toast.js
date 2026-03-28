import { h as html, $, $array, css, on } from "@hstd/std";
import { Portal } from "../core/portal.js";
import { Presence } from "../core/presence.js";
import { createContext } from "../core/context.js";
import { generateId } from "../utils/id.js";
import { Keys } from "../utils/keyboard.js";

/**
 * Toast primitive - Transient notification messages
 */

const ToastProviderContext = createContext(null);
const ToastContext = createContext(null);

/**
 * ToastProvider - Manages toast state
 * @param {Object} props
 * @param {number} [props.duration=5000] - Default toast duration
 * @param {string} [props.label="Notification"] - Accessible label
 * @param {number} [props.swipeDirection="right"] - Swipe to dismiss direction
 * @param {number} [props.swipeThreshold=50] - Swipe distance threshold
 * @param {*} props.children - App content
 * @returns {NodeList}
 */
export function ToastProvider({
	duration = 5000,
	label = "Notification",
	swipeDirection = "right",
	swipeThreshold = 50,
	children,
}) {
	const toasts = $array([]);

	const addToast = (toast) => {
		const id = generateId("toast");
		toasts.push({ ...toast, id, open: $(true) });
		return id;
	};

	const removeToast = (id) => {
		const index = toasts.$.findIndex(t => t.id === id);
		if (index > -1) {
			toasts.splice(index, 1);
		}
	};

	const context = {
		toasts,
		duration,
		label,
		swipeDirection,
		swipeThreshold,
		addToast,
		removeToast,
	};

	return ToastProviderContext.Provider(context, children);
}

/**
 * ToastViewport - Container for toasts
 * @param {Object} props
 * @param {string} [props.hotkey="F8"] - Focus hotkey
 * @param {string} [props.label] - Accessible label
 * @param {*} props.children - Static toast elements
 * @returns {NodeList}
 */
export function ToastViewport({ hotkey = "F8", label, children, ...props }) {
	const ctx = ToastProviderContext.use();
	const viewportLabel = label || ctx.label;

	const handleKeyDown = (event) => {
		if (event.key === hotkey) {
			event.preventDefault();
			// Focus first toast
			const viewport = event.currentTarget;
			const firstFocusable = viewport.querySelector("[data-radix-toast]");
			if (firstFocusable) firstFocusable.focus();
		}
	};

	return html`<ol ${{
		role: "region",
		"aria-label": viewportLabel,
		tabindex: "-1",
		[on.keydown]: handleKeyDown,
		[css]: {
			position: "fixed",
			bottom: "0",
			right: "0",
			display: "flex",
			flexDirection: "column",
			gap: "10px",
			padding: "25px",
			margin: "0",
			listStyle: "none",
			zIndex: "9999",
			outline: "none",
		},
		...props,
	}}>
		${ctx.toasts.into(list =>
			list.map(toast => ToastContext.Provider(toast, html`
				<li data-radix-toast>
					${Toast({
						open: toast.open,
						onOpenChange: (open) => {
							toast.open.$ = open;
							if (!open) {
								setTimeout(() => ctx.removeToast(toast.id), 300);
							}
						},
						duration: toast.duration || ctx.duration,
						children: toast.content,
					})}
				</li>
			`))
		)}
		${children}
	</ol>`;
}

/**
 * Toast Root
 * @param {Object} props
 * @param {boolean|Pointer<boolean>} [props.open] - Controlled open state
 * @param {boolean} [props.defaultOpen=true] - Default open state
 * @param {Function} [props.onOpenChange] - Open state change callback
 * @param {"foreground" | "background"} [props.type="foreground"] - Toast type
 * @param {number} [props.duration] - Duration override
 * @param {Function} [props.onEscapeKeyDown] - Escape key handler
 * @param {Function} [props.onPause] - Called when timer pauses
 * @param {Function} [props.onResume] - Called when timer resumes
 * @param {Function} [props.onSwipeStart] - Called on swipe start
 * @param {Function} [props.onSwipeMove] - Called on swipe move
 * @param {Function} [props.onSwipeEnd] - Called on swipe end
 * @param {*} props.children - Toast content
 * @returns {NodeList}
 */
export function Toast({
	open,
	defaultOpen = true,
	onOpenChange,
	type = "foreground",
	duration,
	onEscapeKeyDown,
	onPause,
	onResume,
	onSwipeStart,
	onSwipeMove,
	onSwipeEnd,
	children,
	...props
}) {
	const provider = ToastProviderContext.use();
	const isControlled = open !== undefined;
	const openState = isControlled
		? (typeof open?.$ !== "undefined" ? open : $(open))
		: $(defaultOpen);

	const toastDuration = duration ?? provider?.duration ?? 5000;
	let closeTimer = null;
	let remainingTime = toastDuration;
	let pauseStart = null;

	const setOpen = (newOpen) => {
		if (!isControlled) {
			openState.$ = newOpen;
		}
		onOpenChange?.(newOpen);
	};

	const startTimer = () => {
		if (toastDuration === Infinity) return;

		clearTimeout(closeTimer);
		closeTimer = setTimeout(() => {
			setOpen(false);
		}, remainingTime);
	};

	const pauseTimer = () => {
		if (closeTimer) {
			clearTimeout(closeTimer);
			pauseStart = Date.now();
			onPause?.();
		}
	};

	const resumeTimer = () => {
		if (pauseStart) {
			remainingTime -= Date.now() - pauseStart;
			pauseStart = null;
			startTimer();
			onResume?.();
		}
	};

	// Start timer on mount
	queueMicrotask(startTimer);

	const handleKeyDown = (event) => {
		if (event.key === Keys.Escape) {
			onEscapeKeyDown?.(event);
			if (!event.defaultPrevented) {
				setOpen(false);
			}
		}
	};

	return html`${Presence({
		present: openState,
		children: ({ state }) => html`<div ${{
			role: type === "foreground" ? "alert" : "status",
			"aria-live": type === "foreground" ? "assertive" : "polite",
			"aria-atomic": "true",
			tabindex: "0",
			"data-state": state.into(s => s === "mounted" ? "open" : "closed"),
			"data-swipe-direction": provider?.swipeDirection,
			[on.keydown]: handleKeyDown,
			[on.pointerenter]: pauseTimer,
			[on.pointerleave]: resumeTimer,
			[on.focus]: pauseTimer,
			[on.blur]: resumeTimer,
			...props,
		}}>${children}</div>`,
	})}`;
}

/**
 * Toast Title
 * @param {Object} props
 * @param {*} props.children - Title text
 * @returns {NodeList}
 */
export function ToastTitle({ children, ...props }) {
	return html`<div ${{ ...props }}>${children}</div>`;
}

/**
 * Toast Description
 * @param {Object} props
 * @param {*} props.children - Description text
 * @returns {NodeList}
 */
export function ToastDescription({ children, ...props }) {
	return html`<div ${{ ...props }}>${children}</div>`;
}

/**
 * Toast Action
 * @param {Object} props
 * @param {string} props.altText - Alt text for screen readers
 * @param {*} props.children - Action button
 * @returns {NodeList}
 */
export function ToastAction({ altText, children, ...props }) {
	return html`<div ${{
		"aria-label": altText,
		...props,
	}}>${children}</div>`;
}

/**
 * Toast Close
 * @param {Object} props
 * @param {*} props.children - Close button content
 * @returns {NodeList}
 */
export function ToastClose({ children, ...props }) {
	const ctx = ToastContext.use();

	return html`<button ${{
		type: "button",
		[on.click]: () => ctx?.open && (ctx.open.$ = false),
		...props,
	}}>${children}</button>`;
}

/**
 * Programmatic toast function
 * Must be used within ToastProvider
 */
export function useToast() {
	const ctx = ToastProviderContext.use();

	return {
		toast: (props) => ctx?.addToast?.(props),
		dismiss: (id) => ctx?.removeToast?.(id),
	};
}

export { ToastProviderContext, ToastContext };
