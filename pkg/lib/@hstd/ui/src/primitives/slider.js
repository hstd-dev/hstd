import { h as html, $, css, on } from "@hstd/std";
import { createContext } from "../core/context.js";
import { generateId } from "../utils/id.js";
import { Keys } from "../utils/keyboard.js";

/**
 * Slider primitive - Range input control
 * Supports single value or range (two thumbs)
 */

const SliderContext = createContext(null);

/**
 * Clamp value to range
 */
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Round to step
 */
const roundToStep = (value, step, min) => {
	const rounded = Math.round((value - min) / step) * step + min;
	return Number(rounded.toFixed(10)); // Handle floating point
};

/**
 * Slider Root
 * @param {Object} props
 * @param {number[]|Pointer<number[]>} [props.value] - Controlled value(s)
 * @param {number[]} [props.defaultValue=[0]] - Default value(s)
 * @param {Function} [props.onValueChange] - Value change callback
 * @param {Function} [props.onValueCommit] - Called on drag end
 * @param {number} [props.min=0] - Minimum value
 * @param {number} [props.max=100] - Maximum value
 * @param {number} [props.step=1] - Step size
 * @param {number} [props.minStepsBetweenThumbs=0] - Min steps between thumbs
 * @param {boolean} [props.disabled=false] - Disable the slider
 * @param {"horizontal" | "vertical"} [props.orientation="horizontal"] - Orientation
 * @param {boolean} [props.inverted=false] - Invert direction
 * @param {string} [props.name] - Form field name
 * @param {*} props.children - Slider parts
 * @returns {NodeList}
 */
export function Slider({
	value,
	defaultValue = [0],
	onValueChange,
	onValueCommit,
	min = 0,
	max = 100,
	step = 1,
	minStepsBetweenThumbs = 0,
	disabled = false,
	orientation = "horizontal",
	inverted = false,
	name,
	children,
	...props
}) {
	const isControlled = value !== undefined;
	const valueState = isControlled
		? (typeof value?.$ !== "undefined" ? value : $(value))
		: $(defaultValue);

	const thumbRefs = [];
	let draggingIndex = -1;

	const setValue = (newValue, commit = false) => {
		// Ensure values are sorted and within bounds
		const sorted = [...newValue]
			.map(v => clamp(roundToStep(v, step, min), min, max))
			.sort((a, b) => a - b);

		// Enforce minimum steps between thumbs
		if (minStepsBetweenThumbs > 0 && sorted.length > 1) {
			for (let i = 1; i < sorted.length; i++) {
				const minDiff = minStepsBetweenThumbs * step;
				if (sorted[i] - sorted[i - 1] < minDiff) {
					sorted[i] = sorted[i - 1] + minDiff;
				}
			}
		}

		if (!isControlled) {
			valueState.$ = sorted;
		}
		onValueChange?.(sorted);

		if (commit) {
			onValueCommit?.(sorted);
		}
	};

	const getValueFromPosition = (position, rect) => {
		const isHorizontal = orientation === "horizontal";
		const size = isHorizontal ? rect.width : rect.height;
		const offset = isHorizontal
			? position - rect.left
			: rect.bottom - position;

		let percent = offset / size;
		if (inverted) percent = 1 - percent;

		return min + percent * (max - min);
	};

	const registerThumb = (index, ref) => {
		thumbRefs[index] = ref;
	};

	const handleKeyDown = (event, index) => {
		if (disabled) return;

		const values = [...valueState.$];
		let newValue = values[index];

		switch (event.key) {
			case Keys.ArrowRight:
			case Keys.ArrowUp:
				event.preventDefault();
				newValue += step * (inverted ? -1 : 1);
				break;
			case Keys.ArrowLeft:
			case Keys.ArrowDown:
				event.preventDefault();
				newValue -= step * (inverted ? -1 : 1);
				break;
			case Keys.Home:
				event.preventDefault();
				newValue = min;
				break;
			case Keys.End:
				event.preventDefault();
				newValue = max;
				break;
			case Keys.PageUp:
				event.preventDefault();
				newValue += step * 10;
				break;
			case Keys.PageDown:
				event.preventDefault();
				newValue -= step * 10;
				break;
			default:
				return;
		}

		values[index] = newValue;
		setValue(values, true);
	};

	const context = {
		value: valueState,
		min,
		max,
		step,
		disabled,
		orientation,
		inverted,
		setValue,
		getValueFromPosition,
		registerThumb,
		handleKeyDown,
		startDrag: (index) => { draggingIndex = index; },
		endDrag: () => {
			if (draggingIndex >= 0) {
				onValueCommit?.(valueState.$);
				draggingIndex = -1;
			}
		},
		draggingIndex: () => draggingIndex,
	};

	return html`<span ${{
		"data-orientation": orientation,
		"data-disabled": disabled ? "" : undefined,
		"aria-disabled": disabled,
		...props,
	}}>
		${SliderContext.Provider(context, children)}
		${name ? valueState.into(values =>
			values.map((v, i) => html`<input ${{
				type: "hidden",
				name: values.length > 1 ? `${name}[]` : name,
				value: v,
			}}>`)
		) : ""}
	</span>`;
}

/**
 * Slider Track
 * @param {Object} props
 * @param {*} props.children - Track content (Range)
 * @returns {NodeList}
 */
export function SliderTrack({ children, ...props }) {
	const ctx = SliderContext.use();

	const handlePointerDown = (event) => {
		if (ctx.disabled) return;

		const target = event.currentTarget;
		const rect = target.getBoundingClientRect();
		const value = ctx.getValueFromPosition(
			ctx.orientation === "horizontal" ? event.clientX : event.clientY,
			rect
		);

		// Find closest thumb
		const values = ctx.value.$;
		let closestIndex = 0;
		let closestDist = Math.abs(values[0] - value);

		for (let i = 1; i < values.length; i++) {
			const dist = Math.abs(values[i] - value);
			if (dist < closestDist) {
				closestDist = dist;
				closestIndex = i;
			}
		}

		const newValues = [...values];
		newValues[closestIndex] = value;
		ctx.setValue(newValues);
	};

	return html`<span ${{
		"data-orientation": ctx.orientation,
		"data-disabled": ctx.disabled ? "" : undefined,
		[on.pointerdown]: handlePointerDown,
		...props,
	}}>${children}</span>`;
}

/**
 * Slider Range - Filled portion of track
 * @param {Object} props
 * @returns {NodeList}
 */
export function SliderRange({ ...props }) {
	const ctx = SliderContext.use();

	const getStyle = (values) => {
		const sorted = [...values].sort((a, b) => a - b);
		const start = ((sorted[0] - ctx.min) / (ctx.max - ctx.min)) * 100;
		const end = ((sorted[sorted.length - 1] - ctx.min) / (ctx.max - ctx.min)) * 100;

		if (ctx.orientation === "horizontal") {
			return {
				position: "absolute",
				left: `${ctx.inverted ? 100 - end : start}%`,
				right: `${ctx.inverted ? start : 100 - end}%`,
			};
		} else {
			return {
				position: "absolute",
				bottom: `${ctx.inverted ? 100 - end : start}%`,
				top: `${ctx.inverted ? start : 100 - end}%`,
			};
		}
	};

	return html`<span ${{
		"data-orientation": ctx.orientation,
		"data-disabled": ctx.disabled ? "" : undefined,
		[css]: ctx.value.into(getStyle),
		...props,
	}}></span>`;
}

/**
 * Slider Thumb
 * @param {Object} props
 * @param {number} [props.index=0] - Thumb index for multi-thumb sliders
 * @returns {NodeList}
 */
export function SliderThumb({ index = 0, ...props }) {
	const ctx = SliderContext.use();
	const thumbRef = $(null);

	// Register thumb
	queueMicrotask(() => {
		if (thumbRef.$) {
			ctx.registerThumb(index, thumbRef);
		}
	});

	const getPosition = (values) => {
		const value = values[index] ?? ctx.min;
		const percent = ((value - ctx.min) / (ctx.max - ctx.min)) * 100;
		const adjusted = ctx.inverted ? 100 - percent : percent;

		if (ctx.orientation === "horizontal") {
			return { left: `${adjusted}%`, transform: "translateX(-50%)" };
		}
		return { bottom: `${adjusted}%`, transform: "translateY(50%)" };
	};

	const handlePointerDown = (event) => {
		if (ctx.disabled) return;

		event.preventDefault();
		ctx.startDrag(index);
		thumbRef.$?.focus();

		const handlePointerMove = (e) => {
			const track = thumbRef.$?.parentElement;
			if (!track) return;

			const rect = track.getBoundingClientRect();
			const value = ctx.getValueFromPosition(
				ctx.orientation === "horizontal" ? e.clientX : e.clientY,
				rect
			);

			const newValues = [...ctx.value.$];
			newValues[index] = value;
			ctx.setValue(newValues);
		};

		const handlePointerUp = () => {
			ctx.endDrag();
			document.removeEventListener("pointermove", handlePointerMove);
			document.removeEventListener("pointerup", handlePointerUp);
		};

		document.addEventListener("pointermove", handlePointerMove);
		document.addEventListener("pointerup", handlePointerUp);
	};

	return html`<span ${{
		role: "slider",
		tabindex: ctx.disabled ? undefined : "0",
		"aria-valuemin": ctx.min,
		"aria-valuemax": ctx.max,
		"aria-valuenow": ctx.value.into(v => v[index]),
		"aria-orientation": ctx.orientation,
		"aria-disabled": ctx.disabled,
		"data-orientation": ctx.orientation,
		"data-disabled": ctx.disabled ? "" : undefined,
		[css]: ctx.value.into(getPosition),
		[on.keydown]: (e) => ctx.handleKeyDown(e, index),
		[on.pointerdown]: handlePointerDown,
		...props,
	}}></span>`.on(([thumb]) => {
		thumbRef.$ = thumb;
	});
}

export { SliderContext };
