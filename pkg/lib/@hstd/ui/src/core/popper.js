import { h as html, $, css } from "@hstd/std";

/**
 * Popper handles positioning of floating elements.
 * Implements positioning logic similar to Floating UI.
 */

/**
 * @typedef {"top" | "right" | "bottom" | "left"} Side
 * @typedef {"start" | "center" | "end"} Alignment
 * @typedef {`${Side}` | `${Side}-${Alignment}`} Placement
 */

/**
 * @typedef {Object} PopperOptions
 * @property {Placement} [placement="bottom"] - Preferred placement
 * @property {number} [offset=0] - Offset from anchor
 * @property {boolean} [flip=true] - Flip to opposite side if no space
 * @property {boolean} [shift=true] - Shift along axis to stay in view
 * @property {number} [padding=8] - Padding from viewport edges
 * @property {"fixed" | "absolute"} [strategy="absolute"] - Positioning strategy
 */

/**
 * Get the opposite side
 * @param {Side} side
 * @returns {Side}
 */
function getOppositeSide(side) {
	const opposites = { top: "bottom", bottom: "top", left: "right", right: "left" };
	return opposites[side];
}

/**
 * Parse placement into side and alignment
 * @param {Placement} placement
 * @returns {{ side: Side, alignment: Alignment }}
 */
function parsePlacement(placement) {
	const [side, alignment = "center"] = placement.split("-");
	return { side, alignment };
}

/**
 * Get bounding rect of an element
 * @param {Element} element
 * @returns {DOMRect}
 */
function getElementRect(element) {
	return element.getBoundingClientRect();
}

/**
 * Get viewport dimensions
 * @returns {{ width: number, height: number }}
 */
function getViewport() {
	return {
		width: window.innerWidth,
		height: window.innerHeight,
	};
}

/**
 * Calculate position for floating element
 * @param {Element} anchor - The anchor element
 * @param {Element} floating - The floating element
 * @param {PopperOptions} options
 * @returns {{ x: number, y: number, placement: Placement }}
 */
export function computePosition(anchor, floating, options = {}) {
	const {
		placement = "bottom",
		offset = 0,
		flip = true,
		shift = true,
		padding = 8,
		strategy = "absolute",
	} = options;

	const anchorRect = getElementRect(anchor);
	const floatingRect = getElementRect(floating);
	const viewport = getViewport();

	let { side, alignment } = parsePlacement(placement);
	let x = 0;
	let y = 0;

	// Calculate initial position based on side
	const computeCoords = (currentSide, currentAlignment) => {
		let cx = 0, cy = 0;

		switch (currentSide) {
			case "top":
				cx = anchorRect.left + (anchorRect.width - floatingRect.width) / 2;
				cy = anchorRect.top - floatingRect.height - offset;
				break;
			case "bottom":
				cx = anchorRect.left + (anchorRect.width - floatingRect.width) / 2;
				cy = anchorRect.bottom + offset;
				break;
			case "left":
				cx = anchorRect.left - floatingRect.width - offset;
				cy = anchorRect.top + (anchorRect.height - floatingRect.height) / 2;
				break;
			case "right":
				cx = anchorRect.right + offset;
				cy = anchorRect.top + (anchorRect.height - floatingRect.height) / 2;
				break;
		}

		// Apply alignment
		if (currentSide === "top" || currentSide === "bottom") {
			if (currentAlignment === "start") {
				cx = anchorRect.left;
			} else if (currentAlignment === "end") {
				cx = anchorRect.right - floatingRect.width;
			}
		} else {
			if (currentAlignment === "start") {
				cy = anchorRect.top;
			} else if (currentAlignment === "end") {
				cy = anchorRect.bottom - floatingRect.height;
			}
		}

		return { x: cx, y: cy };
	};

	({ x, y } = computeCoords(side, alignment));

	// Flip if necessary
	if (flip) {
		const isVertical = side === "top" || side === "bottom";
		const overflows = isVertical
			? { start: y < padding, end: y + floatingRect.height > viewport.height - padding }
			: { start: x < padding, end: x + floatingRect.width > viewport.width - padding };

		if ((side === "top" && overflows.start) || (side === "left" && overflows.start) ||
			(side === "bottom" && overflows.end) || (side === "right" && overflows.end)) {
			side = getOppositeSide(side);
			({ x, y } = computeCoords(side, alignment));
		}
	}

	// Shift to keep in viewport
	if (shift) {
		const isVertical = side === "top" || side === "bottom";

		if (isVertical) {
			// Shift horizontally
			if (x < padding) x = padding;
			if (x + floatingRect.width > viewport.width - padding) {
				x = viewport.width - floatingRect.width - padding;
			}
		} else {
			// Shift vertically
			if (y < padding) y = padding;
			if (y + floatingRect.height > viewport.height - padding) {
				y = viewport.height - floatingRect.height - padding;
			}
		}
	}

	// Adjust for scroll if using absolute positioning
	if (strategy === "absolute") {
		x += window.scrollX;
		y += window.scrollY;
	}

	return {
		x,
		y,
		placement: alignment === "center" ? side : `${side}-${alignment}`,
	};
}

/**
 * @typedef {Object} PopperProps
 * @property {Element|Pointer<Element>} anchor - The anchor element
 * @property {*} children - Content to position
 * @property {Placement} [placement="bottom"] - Preferred placement
 * @property {number} [offset=8] - Offset from anchor
 * @property {boolean} [flip=true] - Flip if no space
 * @property {boolean} [shift=true] - Shift to stay in view
 */

/**
 * Popper component for positioned floating content
 * @param {PopperProps} props
 * @returns {NodeList}
 */
export function Popper({
	anchor,
	children,
	placement = "bottom",
	offset = 8,
	flip = true,
	shift = true,
}) {
	const floatingRef = $(null);
	const position = $({ x: 0, y: 0, placement });

	const update = () => {
		const anchorEl = typeof anchor?.$ !== "undefined" ? anchor.$ : anchor;
		const floatingEl = floatingRef.$;

		if (!anchorEl || !floatingEl) return;

		const coords = computePosition(anchorEl, floatingEl, {
			placement,
			offset,
			flip,
			shift,
		});

		position.$ = coords;
	};

	// Update position on mount and anchor changes
	const setup = (floating) => {
		floatingRef.$ = floating;

		// Initial position
		queueMicrotask(update);

		// Update on scroll/resize
		window.addEventListener("scroll", update, true);
		window.addEventListener("resize", update);

		// Watch anchor changes if it's a pointer
		if (typeof anchor?.watch === "function") {
			anchor.watch(update);
		}
	};

	const cleanup = () => {
		window.removeEventListener("scroll", update, true);
		window.removeEventListener("resize", update);
	};

	return html`<div ${{
		id: (ref) => {
			setup(ref.$);

			const observer = new MutationObserver((mutations) => {
				for (const mutation of mutations) {
					for (const removed of mutation.removedNodes) {
						if (removed === ref.$ || (removed.contains && removed.contains(ref.$))) {
							cleanup();
							observer.disconnect();
							return;
						}
					}
				}
			});
			if (ref.$.parentNode) {
				observer.observe(ref.$.parentNode, { childList: true, subtree: true });
			}
		},
		[css]: {
			position: "fixed",
			left: "0",
			top: "0",
			transform: position.into(p => `translate(${p.x}px, ${p.y}px)`),
			zIndex: "9999",
		},
	}}>${children}</div>`;
}

/**
 * Arrow component for popper
 * @param {Object} props
 * @param {number} [props.size=8] - Arrow size in pixels
 * @param {Placement} props.placement - Current placement
 * @returns {NodeList}
 */
export function PopperArrow({ size = 8, placement }) {
	const { side } = parsePlacement(typeof placement?.$ !== "undefined" ? placement.$ : placement);

	const getArrowStyle = (currentSide) => {
		const base = {
			position: "absolute",
			width: `${size}px`,
			height: `${size}px`,
			background: "inherit",
			transform: "rotate(45deg)",
		};

		switch (currentSide) {
			case "top":
				return { ...base, bottom: `-${size / 2}px`, left: "50%", marginLeft: `-${size / 2}px` };
			case "bottom":
				return { ...base, top: `-${size / 2}px`, left: "50%", marginLeft: `-${size / 2}px` };
			case "left":
				return { ...base, right: `-${size / 2}px`, top: "50%", marginTop: `-${size / 2}px` };
			case "right":
				return { ...base, left: `-${size / 2}px`, top: "50%", marginTop: `-${size / 2}px` };
		}
	};

	return html`<div ${{
		[css]: typeof placement?.into === "function"
			? placement.into(p => getArrowStyle(parsePlacement(p).side))
			: getArrowStyle(side),
	}}></div>`;
}

/**
 * Hook-style position computing
 * @param {Element} anchor
 * @param {Element} floating
 * @param {PopperOptions} options
 * @returns {{ update: Function, destroy: Function, position: Pointer }}
 */
export function usePopper(anchor, floating, options = {}) {
	const position = $({ x: 0, y: 0, placement: options.placement || "bottom" });

	const update = () => {
		if (!anchor || !floating) return;
		position.$ = computePosition(anchor, floating, options);
	};

	const handleScroll = () => update();
	const handleResize = () => update();

	window.addEventListener("scroll", handleScroll, true);
	window.addEventListener("resize", handleResize);

	update();

	return {
		update,
		destroy() {
			window.removeEventListener("scroll", handleScroll, true);
			window.removeEventListener("resize", handleResize);
		},
		position,
	};
}
