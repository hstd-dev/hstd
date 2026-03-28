import { h as html, $, css, on } from "@hstd/std";
import { createContext } from "../core/context.js";

/**
 * ScrollArea primitive - Custom scrollbar styling
 * Provides consistent scroll experience across browsers
 */

const ScrollAreaContext = createContext(null);

/**
 * ScrollArea Root
 * @param {Object} props
 * @param {"hover" | "scroll" | "auto" | "always"} [props.type="hover"] - Scrollbar visibility
 * @param {number} [props.scrollHideDelay=600] - Delay before hiding scrollbar
 * @param {"ltr" | "rtl"} [props.dir="ltr"] - Text direction
 * @param {*} props.children - ScrollArea parts
 * @returns {NodeList}
 */
export function ScrollArea({
	type = "hover",
	scrollHideDelay = 600,
	dir = "ltr",
	children,
	...props
}) {
	const viewportRef = $(null);
	const scrollbarXRef = $(null);
	const scrollbarYRef = $(null);

	const scrollState = $({
		scrollTop: 0,
		scrollLeft: 0,
		scrollHeight: 0,
		scrollWidth: 0,
		clientHeight: 0,
		clientWidth: 0,
	});

	const isScrolling = $(false);
	let scrollTimeout = null;

	const handleScroll = (event) => {
		const target = event.target;
		scrollState.$ = {
			scrollTop: target.scrollTop,
			scrollLeft: target.scrollLeft,
			scrollHeight: target.scrollHeight,
			scrollWidth: target.scrollWidth,
			clientHeight: target.clientHeight,
			clientWidth: target.clientWidth,
		};

		isScrolling.$ = true;
		clearTimeout(scrollTimeout);
		scrollTimeout = setTimeout(() => {
			isScrolling.$ = false;
		}, scrollHideDelay);
	};

	const context = {
		type,
		dir,
		viewportRef,
		scrollbarXRef,
		scrollbarYRef,
		scrollState,
		isScrolling,
		handleScroll,
	};

	return html`<div ${{
		dir,
		"data-radix-scroll-area-root": "",
		[css]: {
			position: "relative",
			overflow: "hidden",
		},
		...props,
	}}>${ScrollAreaContext.Provider(context, children)}</div>`;
}

/**
 * ScrollArea Viewport
 * @param {Object} props
 * @param {*} props.children - Scrollable content
 * @returns {NodeList}
 */
export function ScrollAreaViewport({ children, ...props }) {
	const ctx = ScrollAreaContext.use();

	return html`<div ${{
		"data-radix-scroll-area-viewport": "",
		[css]: {
			width: "100%",
			height: "100%",
			overflowX: "scroll",
			overflowY: "scroll",
			// Hide native scrollbars
			scrollbarWidth: "none",
			msOverflowStyle: "none",
		},
		[on.scroll]: ctx.handleScroll,
		...props,
	}}>
		<div ${{ [css]: { minWidth: "100%", display: "table" } }}>${children}</div>
	</div>`.on(([viewport]) => {
		ctx.viewportRef.$ = viewport;
	});
}

/**
 * ScrollArea Scrollbar
 * @param {Object} props
 * @param {"horizontal" | "vertical"} [props.orientation="vertical"] - Scrollbar orientation
 * @param {boolean} [props.forceMount=false] - Force mount
 * @param {*} props.children - Scrollbar parts (Thumb)
 * @returns {NodeList}
 */
export function ScrollAreaScrollbar({
	orientation = "vertical",
	forceMount = false,
	children,
	...props
}) {
	const ctx = ScrollAreaContext.use();

	const isVisible = ctx.scrollState.into(state => {
		if (orientation === "vertical") {
			return state.scrollHeight > state.clientHeight;
		}
		return state.scrollWidth > state.clientWidth;
	});

	const getVisibility = () => {
		switch (ctx.type) {
			case "always": return true;
			case "scroll": return ctx.isScrolling.$;
			case "auto": return isVisible.$;
			case "hover":
			default: return true; // Controlled by CSS hover
		}
	};

	const baseStyles = {
		display: "flex",
		touchAction: "none",
		userSelect: "none",
		transition: "opacity 160ms ease-out",
	};

	const orientationStyles = orientation === "vertical"
		? {
			flexDirection: "column",
			position: "absolute",
			top: "0",
			right: ctx.dir === "rtl" ? "auto" : "0",
			left: ctx.dir === "rtl" ? "0" : "auto",
			bottom: "0",
			width: "10px",
		}
		: {
			flexDirection: "row",
			position: "absolute",
			left: "0",
			right: "0",
			bottom: "0",
			height: "10px",
		};

	return html`<div ${{
		"data-orientation": orientation,
		"data-state": ctx.isScrolling.into(s => s ? "visible" : "hidden"),
		[css]: { ...baseStyles, ...orientationStyles },
		...props,
	}}>${children}</div>`.on(([scrollbar]) => {
		if (orientation === "vertical") {
			ctx.scrollbarYRef.$ = scrollbar;
		} else {
			ctx.scrollbarXRef.$ = scrollbar;
		}
	});
}

/**
 * ScrollArea Thumb
 * @param {Object} props
 * @returns {NodeList}
 */
export function ScrollAreaThumb({ ...props }) {
	const ctx = ScrollAreaContext.use();
	const isDragging = $(false);

	const getThumbStyle = (state) => {
		// This is a simplified calculation
		// A full implementation would need orientation context
		const ratio = state.clientHeight / state.scrollHeight;
		const thumbHeight = Math.max(ratio * 100, 10);
		const thumbTop = (state.scrollTop / (state.scrollHeight - state.clientHeight)) * (100 - thumbHeight);

		return {
			position: "relative",
			flex: "1",
			background: "rgba(0, 0, 0, 0.3)",
			borderRadius: "9999px",
			height: `${thumbHeight}%`,
			transform: `translateY(${thumbTop}%)`,
		};
	};

	const handlePointerDown = (event) => {
		event.preventDefault();
		isDragging.$ = true;

		const startY = event.clientY;
		const viewport = ctx.viewportRef.$;
		if (!viewport) return;

		const startScroll = viewport.scrollTop;
		const trackHeight = event.currentTarget.parentElement.clientHeight;
		const scrollRange = viewport.scrollHeight - viewport.clientHeight;

		const handlePointerMove = (e) => {
			const deltaY = e.clientY - startY;
			const scrollDelta = (deltaY / trackHeight) * scrollRange;
			viewport.scrollTop = startScroll + scrollDelta;
		};

		const handlePointerUp = () => {
			isDragging.$ = false;
			document.removeEventListener("pointermove", handlePointerMove);
			document.removeEventListener("pointerup", handlePointerUp);
		};

		document.addEventListener("pointermove", handlePointerMove);
		document.addEventListener("pointerup", handlePointerUp);
	};

	return html`<div ${{
		"data-state": isDragging.into(d => d ? "dragging" : "idle"),
		[css]: ctx.scrollState.into(getThumbStyle),
		[on.pointerdown]: handlePointerDown,
		...props,
	}}></div>`;
}

/**
 * ScrollArea Corner
 * @param {Object} props
 * @returns {NodeList}
 */
export function ScrollAreaCorner({ ...props }) {
	return html`<div ${{
		[css]: {
			position: "absolute",
			right: "0",
			bottom: "0",
		},
		...props,
	}}></div>`;
}

export { ScrollAreaContext };
