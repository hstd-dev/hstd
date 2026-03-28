import { h as html, $, css, on } from "@hstd/std";
import { createContext } from "../core/context.js";

/**
 * Avatar primitive - User profile image with fallback
 */

const AvatarContext = createContext(null);

/**
 * Avatar Root
 * @param {Object} props
 * @param {*} props.children - Avatar parts (Image, Fallback)
 * @returns {NodeList}
 */
export function Avatar({ children, ...props }) {
	const imageLoadingStatus = $("idle"); // "idle" | "loading" | "loaded" | "error"

	const context = {
		imageLoadingStatus,
	};

	return html`<span ${{
		...props,
	}}>${AvatarContext.Provider(context, children)}</span>`;
}

/**
 * Avatar Image
 * @param {Object} props
 * @param {string} props.src - Image source URL
 * @param {string} [props.alt] - Alt text
 * @param {Function} [props.onLoadingStatusChange] - Loading status callback
 * @returns {NodeList}
 */
export function AvatarImage({ src, alt = "", onLoadingStatusChange, ...props }) {
	const ctx = AvatarContext.use();

	const handleLoad = () => {
		ctx.imageLoadingStatus.$ = "loaded";
		onLoadingStatusChange?.("loaded");
	};

	const handleError = () => {
		ctx.imageLoadingStatus.$ = "error";
		onLoadingStatusChange?.("error");
	};

	// Start loading
	queueMicrotask(() => {
		if (src) {
			ctx.imageLoadingStatus.$ = "loading";
			onLoadingStatusChange?.("loading");
		}
	});

	return html`${ctx.imageLoadingStatus.into(status => {
		if (status === "error") return "";

		return html`<img ${{
			src,
			alt,
			[on.load]: handleLoad,
			[on.error]: handleError,
			[css]: status !== "loaded" ? { display: "none" } : {},
			...props,
		}}>`;
	})}`;
}

/**
 * Avatar Fallback
 * @param {Object} props
 * @param {number} [props.delayMs=0] - Delay before showing fallback
 * @param {*} props.children - Fallback content (initials, icon)
 * @returns {NodeList}
 */
export function AvatarFallback({ delayMs = 0, children, ...props }) {
	const ctx = AvatarContext.use();
	const canRender = $(delayMs === 0);

	if (delayMs > 0) {
		setTimeout(() => {
			canRender.$ = true;
		}, delayMs);
	}

	return html`${ctx.imageLoadingStatus.into(status => {
		if (status === "loaded") return "";
		if (!canRender.$) return "";

		return html`<span ${{ ...props }}>${children}</span>`;
	})}`;
}

export { AvatarContext };
