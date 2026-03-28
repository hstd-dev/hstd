import { h as html, $, $array, css, on } from "@hstd/std";
import { Presence } from "../core/presence.js";
import { createContext } from "../core/context.js";
import { generateId } from "../utils/id.js";
import { Keys, handleArrowNavigation } from "../utils/keyboard.js";

/**
 * Accordion primitive - Collapsible content sections
 * Supports single or multiple open items
 */

const AccordionContext = createContext(null);
const AccordionItemContext = createContext(null);

/**
 * Accordion Root
 * @param {Object} props
 * @param {"single" | "multiple"} [props.type="single"] - Selection type
 * @param {string|string[]} [props.value] - Controlled value
 * @param {string|string[]} [props.defaultValue] - Default value
 * @param {Function} [props.onValueChange] - Value change callback
 * @param {boolean} [props.collapsible=false] - Allow collapsing all items (single mode)
 * @param {boolean} [props.disabled=false] - Disable all items
 * @param {"vertical" | "horizontal"} [props.orientation="vertical"] - Layout orientation
 * @param {*} props.children - Accordion items
 * @returns {NodeList}
 */
export function Accordion({
	type = "single",
	value,
	defaultValue,
	onValueChange,
	collapsible = false,
	disabled = false,
	orientation = "vertical",
	children,
	...props
}) {
	const isControlled = value !== undefined;
	const initialValue = type === "multiple"
		? (defaultValue || [])
		: (defaultValue || (collapsible ? "" : ""));

	const valueState = isControlled
		? (typeof value?.$ !== "undefined" ? value : $(value))
		: $(initialValue);

	const triggerRefs = [];

	const isOpen = (itemValue) => {
		const current = valueState.$;
		if (type === "multiple") {
			return Array.isArray(current) && current.includes(itemValue);
		}
		return current === itemValue;
	};

	const toggle = (itemValue) => {
		let newValue;

		if (type === "multiple") {
			const current = Array.isArray(valueState.$) ? valueState.$ : [];
			if (current.includes(itemValue)) {
				newValue = current.filter(v => v !== itemValue);
			} else {
				newValue = [...current, itemValue];
			}
		} else {
			if (valueState.$ === itemValue) {
				newValue = collapsible ? "" : itemValue;
			} else {
				newValue = itemValue;
			}
		}

		if (!isControlled) {
			valueState.$ = newValue;
		}
		onValueChange?.(newValue);
	};

	const registerTrigger = (ref) => {
		triggerRefs.push(ref);
	};

	const handleKeyDown = (event, currentValue) => {
		const currentIndex = triggerRefs.findIndex(ref => ref.$ === document.activeElement);
		const newIndex = handleArrowNavigation(event, {
			currentIndex,
			maxIndex: triggerRefs.length - 1,
			orientation,
		});

		if (newIndex !== null) {
			event.preventDefault();
			triggerRefs[newIndex].$?.focus();
		}
	};

	const context = {
		type,
		value: valueState,
		disabled,
		orientation,
		isOpen,
		toggle,
		registerTrigger,
		handleKeyDown,
	};

	return html`<div ${{
		"data-orientation": orientation,
		...props,
	}}>${AccordionContext.Provider(context, children)}</div>`;
}

/**
 * Accordion Item
 * @param {Object} props
 * @param {string} props.value - Unique value for this item
 * @param {boolean} [props.disabled=false] - Disable this item
 * @param {*} props.children - Item content
 * @returns {NodeList}
 */
export function AccordionItem({ value, disabled = false, children, ...props }) {
	const accordionCtx = AccordionContext.use();
	const triggerId = generateId("accordion-trigger");
	const contentId = generateId("accordion-content");

	const isDisabled = disabled || accordionCtx.disabled;

	const itemContext = {
		value,
		triggerId,
		contentId,
		disabled: isDisabled,
		isOpen: () => accordionCtx.isOpen(value),
	};

	return html`<div ${{
		"data-state": accordionCtx.value.into(() =>
			accordionCtx.isOpen(value) ? "open" : "closed"
		),
		"data-disabled": isDisabled ? "" : undefined,
		"data-orientation": accordionCtx.orientation,
		...props,
	}}>${AccordionItemContext.Provider(itemContext,
		AccordionContext.Provider(accordionCtx, children)
	)}</div>`;
}

/**
 * Accordion Header
 * @param {Object} props
 * @param {*} props.children - Header content
 * @returns {NodeList}
 */
export function AccordionHeader({ children, ...props }) {
	const accordionCtx = AccordionContext.use();

	return html`<h3 ${{
		"data-orientation": accordionCtx.orientation,
		...props,
	}}>${children}</h3>`;
}

/**
 * Accordion Trigger
 * @param {Object} props
 * @param {*} props.children - Trigger content
 * @returns {NodeList}
 */
export function AccordionTrigger({ children, ...props }) {
	const accordionCtx = AccordionContext.use();
	const itemCtx = AccordionItemContext.use();
	const triggerRef = $(null);

	// Register trigger for keyboard navigation
	queueMicrotask(() => {
		if (triggerRef.$) {
			accordionCtx.registerTrigger(triggerRef);
		}
	});

	return html`<button ${{
		type: "button",
		id: itemCtx.triggerId,
		"aria-expanded": accordionCtx.value.into(() => accordionCtx.isOpen(itemCtx.value)),
		"aria-controls": itemCtx.contentId,
		"aria-disabled": itemCtx.disabled,
		disabled: itemCtx.disabled,
		"data-state": accordionCtx.value.into(() =>
			accordionCtx.isOpen(itemCtx.value) ? "open" : "closed"
		),
		"data-disabled": itemCtx.disabled ? "" : undefined,
		"data-orientation": accordionCtx.orientation,
		[on.click]: () => {
			if (!itemCtx.disabled) {
				accordionCtx.toggle(itemCtx.value);
			}
		},
		[on.keydown]: (e) => accordionCtx.handleKeyDown(e, itemCtx.value),
		...props,
	}}>${children}</button>`.on(([trigger]) => {
		triggerRef.$ = trigger;
	});
}

/**
 * Accordion Content
 * @param {Object} props
 * @param {boolean} [props.forceMount=false] - Force mount even when closed
 * @param {*} props.children - Content
 * @returns {NodeList}
 */
export function AccordionContent({ forceMount = false, children, ...props }) {
	const accordionCtx = AccordionContext.use();
	const itemCtx = AccordionItemContext.use();

	const isOpen = accordionCtx.value.into(() => accordionCtx.isOpen(itemCtx.value));

	if (forceMount) {
		return html`<div ${{
			role: "region",
			id: itemCtx.contentId,
			"aria-labelledby": itemCtx.triggerId,
			"data-state": isOpen.into(o => o ? "open" : "closed"),
			"data-disabled": itemCtx.disabled ? "" : undefined,
			"data-orientation": accordionCtx.orientation,
			hidden: isOpen.into(o => o ? undefined : true),
			...props,
		}}>${children}</div>`;
	}

	return html`${Presence({
		present: isOpen,
		children: ({ state }) => html`<div ${{
			role: "region",
			id: itemCtx.contentId,
			"aria-labelledby": itemCtx.triggerId,
			"data-state": state.into(s => s === "mounted" ? "open" : "closed"),
			"data-disabled": itemCtx.disabled ? "" : undefined,
			"data-orientation": accordionCtx.orientation,
			...props,
		}}>${children}</div>`,
	})}`;
}

export { AccordionContext, AccordionItemContext };
