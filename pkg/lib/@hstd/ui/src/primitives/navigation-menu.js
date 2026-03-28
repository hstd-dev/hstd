import { h as html, $, css, on } from "@hstd/std";
import { Portal } from "../core/portal.js";
import { Presence } from "../core/presence.js";
import { createContext } from "../core/context.js";
import { generateId } from "../utils/id.js";
import { Keys, handleArrowNavigation } from "../utils/keyboard.js";

/**
 * NavigationMenu primitive - Site navigation with submenus
 * Designed for site-wide navigation patterns
 */

const NavigationMenuContext = createContext(null);
const NavigationMenuItemContext = createContext(null);

/**
 * NavigationMenu Root
 * @param {Object} props
 * @param {string|Pointer<string>} [props.value] - Controlled active item
 * @param {string} [props.defaultValue] - Default active item
 * @param {Function} [props.onValueChange] - Value change callback
 * @param {number} [props.delayDuration=200] - Open delay in ms
 * @param {number} [props.skipDelayDuration=300] - Skip delay after recent close
 * @param {"horizontal" | "vertical"} [props.orientation="horizontal"] - Orientation
 * @param {"ltr" | "rtl"} [props.dir="ltr"] - Text direction
 * @param {*} props.children - Navigation items
 * @returns {NodeList}
 */
export function NavigationMenu({
	value,
	defaultValue,
	onValueChange,
	delayDuration = 200,
	skipDelayDuration = 300,
	orientation = "horizontal",
	dir = "ltr",
	children,
	...props
}) {
	const isControlled = value !== undefined;
	const valueState = isControlled
		? (typeof value?.$ !== "undefined" ? value : $(value))
		: $(defaultValue || "");

	const triggerRefs = new Map();
	const contentRefs = new Map();
	const isDelayed = $(true);
	let skipDelayTimer = null;
	let openTimer = null;

	const setValue = (newValue, immediate = false) => {
		clearTimeout(openTimer);

		const setNewValue = () => {
			if (!isControlled) {
				valueState.$ = newValue;
			}
			onValueChange?.(newValue);

			if (newValue) {
				clearTimeout(skipDelayTimer);
				isDelayed.$ = false;
			} else {
				skipDelayTimer = setTimeout(() => {
					isDelayed.$ = true;
				}, skipDelayDuration);
			}
		};

		if (immediate || !isDelayed.$) {
			setNewValue();
		} else {
			openTimer = setTimeout(setNewValue, delayDuration);
		}
	};

	const registerTrigger = (itemValue, ref) => {
		triggerRefs.set(itemValue, ref);
	};

	const registerContent = (itemValue, ref) => {
		contentRefs.set(itemValue, ref);
	};

	const handleKeyDown = (event) => {
		const triggers = [...triggerRefs.entries()];
		const currentIndex = triggers.findIndex(([_, ref]) =>
			ref.$ === document.activeElement
		);

		const newIndex = handleArrowNavigation(event, {
			currentIndex,
			maxIndex: triggers.length - 1,
			orientation,
		});

		if (newIndex !== null) {
			event.preventDefault();
			triggers[newIndex][1].$?.focus();
		}
	};

	const context = {
		value: valueState,
		setValue,
		orientation,
		dir,
		registerTrigger,
		registerContent,
		triggerRefs,
		contentRefs,
	};

	return html`<nav ${{
		"aria-label": "Main",
		"data-orientation": orientation,
		dir,
		[on.keydown]: handleKeyDown,
		...props,
	}}>${NavigationMenuContext.Provider(context, children)}</nav>`;
}

/**
 * NavigationMenu List
 * @param {Object} props
 * @param {*} props.children - Navigation items
 * @returns {NodeList}
 */
export function NavigationMenuList({ children, ...props }) {
	const ctx = NavigationMenuContext.use();

	return html`<ul ${{
		"data-orientation": ctx.orientation,
		[css]: {
			display: "flex",
			listStyle: "none",
			margin: "0",
			padding: "0",
			flexDirection: ctx.orientation === "vertical" ? "column" : "row",
		},
		...props,
	}}>${children}</ul>`;
}

/**
 * NavigationMenu Item
 * @param {Object} props
 * @param {string} [props.value] - Item value
 * @param {*} props.children - Item content
 * @returns {NodeList}
 */
export function NavigationMenuItem({ value, children, ...props }) {
	const itemValue = value || generateId("nav-item");

	const itemContext = {
		value: itemValue,
	};

	return html`<li ${{
		...props,
	}}>${NavigationMenuItemContext.Provider(itemContext, children)}</li>`;
}

/**
 * NavigationMenu Trigger
 * @param {Object} props
 * @param {boolean} [props.disabled=false] - Disable the trigger
 * @param {*} props.children - Trigger content
 * @returns {NodeList}
 */
export function NavigationMenuTrigger({ disabled = false, children, ...props }) {
	const ctx = NavigationMenuContext.use();
	const itemCtx = NavigationMenuItemContext.use();
	const triggerRef = $(null);

	const contentId = generateId("nav-content");

	queueMicrotask(() => {
		if (triggerRef.$) {
			ctx.registerTrigger(itemCtx.value, triggerRef);
		}
	});

	const isOpen = ctx.value.into(v => v === itemCtx.value);

	const handleClick = () => {
		if (disabled) return;
		ctx.setValue(ctx.value.$ === itemCtx.value ? "" : itemCtx.value, true);
	};

	const handlePointerEnter = () => {
		if (disabled) return;
		ctx.setValue(itemCtx.value);
	};

	const handlePointerLeave = () => {
		ctx.setValue("");
	};

	return html`<button ${{
		type: "button",
		"aria-expanded": isOpen,
		"aria-controls": contentId,
		"data-state": isOpen.into(o => o ? "open" : "closed"),
		"data-disabled": disabled ? "" : undefined,
		disabled,
		[on.click]: handleClick,
		[on.pointerenter]: handlePointerEnter,
		[on.pointerleave]: handlePointerLeave,
		[on.keydown]: (e) => {
			if (e.key === Keys.ArrowDown || e.key === Keys.Enter || e.key === Keys.Space) {
				e.preventDefault();
				ctx.setValue(itemCtx.value, true);
			}
		},
		...props,
	}}>${children}</button>`.on(([trigger]) => {
		triggerRef.$ = trigger;
		trigger._contentId = contentId;
	});
}

/**
 * NavigationMenu Content
 * @param {Object} props
 * @param {boolean} [props.forceMount=false] - Force mount
 * @param {*} props.children - Content
 * @returns {NodeList}
 */
export function NavigationMenuContent({ forceMount = false, children, ...props }) {
	const ctx = NavigationMenuContext.use();
	const itemCtx = NavigationMenuItemContext.use();
	const contentRef = $(null);

	queueMicrotask(() => {
		if (contentRef.$) {
			ctx.registerContent(itemCtx.value, contentRef);
		}
	});

	const isOpen = ctx.value.into(v => v === itemCtx.value);

	const handlePointerEnter = () => {
		ctx.setValue(itemCtx.value, true);
	};

	const handlePointerLeave = () => {
		ctx.setValue("");
	};

	if (forceMount) {
		return html`<div ${{
			"data-state": isOpen.into(o => o ? "open" : "closed"),
			"data-orientation": ctx.orientation,
			hidden: isOpen.into(o => o ? undefined : true),
			[on.pointerenter]: handlePointerEnter,
			[on.pointerleave]: handlePointerLeave,
			...props,
		}}>${children}</div>`.on(([content]) => {
			contentRef.$ = content;
		});
	}

	return html`${Presence({
		present: isOpen,
		children: ({ state }) => html`<div ${{
			"data-state": state.into(s => s === "mounted" ? "open" : "closed"),
			"data-orientation": ctx.orientation,
			[on.pointerenter]: handlePointerEnter,
			[on.pointerleave]: handlePointerLeave,
			...props,
		}}>${children}</div>`.on(([content]) => {
			contentRef.$ = content;
		}),
	})}`;
}

/**
 * NavigationMenu Link
 * @param {Object} props
 * @param {string} props.href - Link URL
 * @param {boolean} [props.active=false] - Mark as active
 * @param {Function} [props.onSelect] - Selection callback
 * @param {*} props.children - Link content
 * @returns {NodeList}
 */
export function NavigationMenuLink({ href, active = false, onSelect, children, ...props }) {
	const ctx = NavigationMenuContext.use();

	const handleSelect = (event) => {
		onSelect?.(event);
		if (!event.defaultPrevented) {
			ctx.setValue("");
		}
	};

	return html`<a ${{
		href,
		"aria-current": active ? "page" : undefined,
		"data-active": active ? "" : undefined,
		[on.click]: handleSelect,
		...props,
	}}>${children}</a>`;
}

/**
 * NavigationMenu Indicator
 * @param {Object} props
 * @param {boolean} [props.forceMount=false] - Force mount
 * @returns {NodeList}
 */
export function NavigationMenuIndicator({ forceMount = false, ...props }) {
	const ctx = NavigationMenuContext.use();

	const hasValue = ctx.value.into(v => !!v);

	if (forceMount) {
		return html`<div ${{
			"data-state": hasValue.into(h => h ? "visible" : "hidden"),
			"data-orientation": ctx.orientation,
			...props,
		}}><div ${{ [css]: { position: "relative", width: "100%", height: "100%" } }}></div></div>`;
	}

	return html`${Presence({
		present: hasValue,
		children: () => html`<div ${{
			"data-state": "visible",
			"data-orientation": ctx.orientation,
			...props,
		}}><div ${{ [css]: { position: "relative", width: "100%", height: "100%" } }}></div></div>`,
	})}`;
}

/**
 * NavigationMenu Viewport
 * @param {Object} props
 * @param {boolean} [props.forceMount=false] - Force mount
 * @returns {NodeList}
 */
export function NavigationMenuViewport({ forceMount = false, ...props }) {
	const ctx = NavigationMenuContext.use();

	const hasValue = ctx.value.into(v => !!v);

	const content = ctx.value.into(v => {
		if (!v) return "";
		const contentRef = ctx.contentRefs.get(v);
		return contentRef?.$?.innerHTML || "";
	});

	if (forceMount) {
		return html`<div ${{
			"data-state": hasValue.into(h => h ? "open" : "closed"),
			"data-orientation": ctx.orientation,
			...props,
		}}>${content}</div>`;
	}

	return html`${Presence({
		present: hasValue,
		children: () => html`<div ${{
			"data-state": "open",
			"data-orientation": ctx.orientation,
			...props,
		}}>${content}</div>`,
	})}`;
}

export { NavigationMenuContext, NavigationMenuItemContext };
