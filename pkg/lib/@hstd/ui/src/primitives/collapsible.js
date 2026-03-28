import { h as html, $, on } from "@hstd/std";
import { Presence } from "../core/presence.js";
import { createContext } from "../core/context.js";
import { generateId } from "../utils/id.js";

/**
 * Collapsible primitive - Expandable/collapsible content section
 */

const CollapsibleContext = createContext(null);

/**
 * Collapsible Root
 * @param {Object} props
 * @param {boolean|Pointer<boolean>} [props.open] - Controlled open state
 * @param {boolean} [props.defaultOpen=false] - Default open state
 * @param {Function} [props.onOpenChange] - Open state change callback
 * @param {boolean} [props.disabled=false] - Disable the collapsible
 * @param {*} props.children - Collapsible parts
 * @returns {NodeList}
 */
export function Collapsible({
	open,
	defaultOpen = false,
	onOpenChange,
	disabled = false,
	children,
	...props
}) {
	const isControlled = open !== undefined;
	const openState = isControlled
		? (typeof open?.$ !== "undefined" ? open : $(open))
		: $(defaultOpen);

	const contentId = generateId("collapsible");

	const setOpen = (newOpen) => {
		if (disabled) return;

		if (!isControlled) {
			openState.$ = newOpen;
		}
		onOpenChange?.(newOpen);
	};

	const toggle = () => setOpen(!openState.$);

	const context = {
		open: openState,
		disabled,
		contentId,
		setOpen,
		toggle,
	};

	return html`<div ${{
		"data-state": openState.into(o => o ? "open" : "closed"),
		"data-disabled": disabled ? "" : undefined,
		...props,
	}}>${CollapsibleContext.Provider(context, children)}</div>`;
}

/**
 * Collapsible Trigger
 * @param {Object} props
 * @param {*} props.children - Trigger content
 * @returns {NodeList}
 */
export function CollapsibleTrigger({ children, ...props }) {
	const ctx = CollapsibleContext.use();

	return html`<button ${{
		type: "button",
		"aria-expanded": ctx.open,
		"aria-controls": ctx.contentId,
		"data-state": ctx.open.into(o => o ? "open" : "closed"),
		"data-disabled": ctx.disabled ? "" : undefined,
		disabled: ctx.disabled,
		[on.click]: ctx.toggle,
		...props,
	}}>${children}</button>`;
}

/**
 * Collapsible Content
 * @param {Object} props
 * @param {boolean} [props.forceMount=false] - Force mount
 * @param {*} props.children - Content
 * @returns {NodeList}
 */
export function CollapsibleContent({ forceMount = false, children, ...props }) {
	const ctx = CollapsibleContext.use();

	if (forceMount) {
		return html`<div ${{
			id: ctx.contentId,
			"data-state": ctx.open.into(o => o ? "open" : "closed"),
			"data-disabled": ctx.disabled ? "" : undefined,
			hidden: ctx.open.into(o => o ? undefined : true),
			...props,
		}}>${children}</div>`;
	}

	return html`${Presence({
		present: ctx.open,
		children: ({ state }) => html`<div ${{
			id: ctx.contentId,
			"data-state": state.into(s => s === "mounted" ? "open" : "closed"),
			"data-disabled": ctx.disabled ? "" : undefined,
			...props,
		}}>${children}</div>`,
	})}`;
}

export { CollapsibleContext };
