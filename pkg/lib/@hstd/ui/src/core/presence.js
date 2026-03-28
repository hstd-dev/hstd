import { h as html, $, css, on } from "@hstd/std";

/**
 * Presence handles mounting and unmounting with animation support.
 * It keeps the element in the DOM during exit animations.
 */

/**
 * @typedef {Object} PresenceProps
 * @property {boolean|Pointer<boolean>} present - Whether the content should be present
 * @property {Function} children - Function that receives presence state and returns content
 * @property {Function} [onExitComplete] - Callback when exit animation completes
 */

/**
 * Presence component for animated mount/unmount
 *
 * @param {PresenceProps} props
 * @returns {NodeList}
 */
export function Presence({ present, children, onExitComplete }) {
	const isPresent = typeof present?.$ !== "undefined" ? present : $(present);
	const node = $(null);
	const state = $("unmounted"); // "mounted" | "unmounting" | "unmounted"

	// Derived pointer for actual presence (includes unmounting state)
	const shouldRender = isPresent.into(p => p || state.$ === "unmounting");

	// Watch for presence changes
	isPresent.watch((nowPresent) => {
		if (nowPresent) {
			state.$ = "mounted";
		} else if (state.$ === "mounted") {
			state.$ = "unmounting";

			// Get the node and wait for animation
			const element = node.$;
			if (element instanceof Element) {
				const animations = element.getAnimations();

				if (animations.length > 0) {
					Promise.all(animations.map(a => a.finished)).then(() => {
						if (state.$ === "unmounting") {
							state.$ = "unmounted";
							onExitComplete?.();
						}
					});
				} else {
					state.$ = "unmounted";
					onExitComplete?.();
				}
			} else {
				state.$ = "unmounted";
				onExitComplete?.();
			}
		}
	});

	return html`${shouldRender.into(render => {
		if (!render) return "";

		const content = children({
			present: isPresent,
			state,
			ref: (el) => { node.$ = el; }
		});

		return content;
	})}`;
}

/**
 * Hook-style presence for more control
 * @param {boolean|Pointer<boolean>} present
 * @returns {{ isPresent: Pointer<boolean>, state: Pointer<string>, ref: Function }}
 */
export function usePresence(present) {
	const isPresent = typeof present?.$ !== "undefined" ? present : $(present);
	const node = $(null);
	const state = $("unmounted");

	isPresent.watch((nowPresent) => {
		if (nowPresent) {
			state.$ = "mounted";
		} else if (state.$ === "mounted") {
			state.$ = "unmounting";

			const element = node.$;
			if (element instanceof Element) {
				const animations = element.getAnimations();
				if (animations.length > 0) {
					Promise.all(animations.map(a => a.finished)).then(() => {
						if (state.$ === "unmounting") {
							state.$ = "unmounted";
						}
					});
				} else {
					state.$ = "unmounted";
				}
			} else {
				state.$ = "unmounted";
			}
		}
	});

	return {
		isPresent: isPresent.into(p => p || state.$ === "unmounting"),
		state,
		ref: (el) => { node.$ = el; }
	};
}
