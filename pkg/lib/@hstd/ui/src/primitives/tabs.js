import { h as html, $, css, on } from "@hstd/std";
import { createContext } from "../core/context.js";
import { generateId } from "../utils/id.js";
import { Keys, handleArrowNavigation } from "../utils/keyboard.js";

/**
 * Tabs primitive - Tabbed interface component
 * Follows WAI-ARIA Tabs pattern
 */

const TabsContext = createContext(null);

/**
 * Tabs Root
 * @param {Object} props
 * @param {string} [props.value] - Controlled active tab value
 * @param {string} [props.defaultValue] - Default active tab
 * @param {Function} [props.onValueChange] - Value change callback
 * @param {"horizontal" | "vertical"} [props.orientation="horizontal"] - Tab orientation
 * @param {"automatic" | "manual"} [props.activationMode="automatic"] - Activation mode
 * @param {*} props.children - Tab content
 * @returns {NodeList}
 */
export function Tabs({
	value,
	defaultValue,
	onValueChange,
	orientation = "horizontal",
	activationMode = "automatic",
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

	const registerTrigger = (value, ref) => {
		triggerRefs.set(value, ref);
	};

	const focusTrigger = (value) => {
		const ref = triggerRefs.get(value);
		if (ref?.$) ref.$.focus();
	};

	const context = {
		value: valueState,
		setValue,
		orientation,
		activationMode,
		registerTrigger,
		focusTrigger,
		triggerRefs,
	};

	return html`<div ${{
		"data-orientation": orientation,
		...props,
	}}>${TabsContext.Provider(context, children)}</div>`;
}

/**
 * Tabs List - Container for tab triggers
 * @param {Object} props
 * @param {boolean} [props.loop=true] - Loop keyboard navigation
 * @param {*} props.children - Tab triggers
 * @returns {NodeList}
 */
export function TabsList({ loop = true, children, ...props }) {
	const ctx = TabsContext.use();

	const handleKeyDown = (event) => {
		const triggers = [...ctx.triggerRefs.entries()];
		const currentIndex = triggers.findIndex(([_, ref]) =>
			ref.$ === document.activeElement
		);

		const newIndex = handleArrowNavigation(event, {
			currentIndex,
			maxIndex: triggers.length - 1,
			loop,
			orientation: ctx.orientation,
		});

		if (newIndex !== null) {
			event.preventDefault();
			const [newValue, newRef] = triggers[newIndex];
			newRef.$?.focus();

			if (ctx.activationMode === "automatic") {
				ctx.setValue(newValue);
			}
		}
	};

	return html`<div ${{
		role: "tablist",
		"aria-orientation": ctx.orientation,
		"data-orientation": ctx.orientation,
		[on.keydown]: handleKeyDown,
		...props,
	}}>${children}</div>`;
}

/**
 * Tabs Trigger - Individual tab button
 * @param {Object} props
 * @param {string} props.value - Tab value
 * @param {boolean} [props.disabled=false] - Disable this tab
 * @param {*} props.children - Tab label
 * @returns {NodeList}
 */
export function TabsTrigger({ value, disabled = false, children, ...props }) {
	const ctx = TabsContext.use();
	const triggerRef = $(null);
	const triggerId = generateId("tab");
	const contentId = generateId("tabpanel");

	// Register trigger
	queueMicrotask(() => {
		if (triggerRef.$) {
			ctx.registerTrigger(value, triggerRef);
		}
	});

	const isSelected = ctx.value.into(v => v === value);

	const handleClick = () => {
		if (!disabled) {
			ctx.setValue(value);
		}
	};

	const handleKeyDown = (event) => {
		if (event.key === Keys.Enter || event.key === Keys.Space) {
			event.preventDefault();
			handleClick();
		}
	};

	return html`<button ${{
		type: "button",
		role: "tab",
		id: triggerId,
		"aria-selected": isSelected,
		"aria-controls": contentId,
		"aria-disabled": disabled,
		disabled,
		tabindex: isSelected.into(s => s ? "0" : "-1"),
		"data-state": isSelected.into(s => s ? "active" : "inactive"),
		"data-disabled": disabled ? "" : undefined,
		"data-orientation": ctx.orientation,
		"data-value": value,
		[on.click]: handleClick,
		[on.keydown]: handleKeyDown,
		[on.focus]: () => {
			// Activate on focus in automatic mode
			if (ctx.activationMode === "automatic" && !disabled) {
				ctx.setValue(value);
			}
		},
		...props,
	}}>${children}</button>`.on(([trigger]) => {
		triggerRef.$ = trigger;
		trigger._tabValue = value;
		trigger._contentId = contentId;
	});
}

/**
 * Tabs Content - Tab panel content
 * @param {Object} props
 * @param {string} props.value - Tab value this content belongs to
 * @param {boolean} [props.forceMount=false] - Force mount even when inactive
 * @param {*} props.children - Panel content
 * @returns {NodeList}
 */
export function TabsContent({ value, forceMount = false, children, ...props }) {
	const ctx = TabsContext.use();
	const contentId = generateId("tabpanel");

	const isSelected = ctx.value.into(v => v === value);

	// Find corresponding trigger ID
	const triggerId = `tab-${value}`;

	if (forceMount) {
		return html`<div ${{
			role: "tabpanel",
			id: contentId,
			"aria-labelledby": triggerId,
			tabindex: "0",
			"data-state": isSelected.into(s => s ? "active" : "inactive"),
			"data-orientation": ctx.orientation,
			hidden: isSelected.into(s => s ? undefined : true),
			...props,
		}}>${children}</div>`;
	}

	return html`${isSelected.into(selected => {
		if (!selected) return "";

		return html`<div ${{
			role: "tabpanel",
			id: contentId,
			"aria-labelledby": triggerId,
			tabindex: "0",
			"data-state": "active",
			"data-orientation": ctx.orientation,
			...props,
		}}>${children}</div>`;
	})}`;
}

export { TabsContext };
