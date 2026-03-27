import { listen } from "./core/listen.js";
import { isPointer } from "./core/pointer.js";
import { Prop } from "./core/prop.js";

const

	inputListener = listen("input"),

	io = Prop((name) => (pointer, ref) => {

		if(ref instanceof HTMLElement) {

			if(!(
				ref instanceof HTMLInputElement ||
				ref instanceof HTMLTextAreaElement ||
				ref instanceof HTMLSelectElement ||
				ref.contentEditable === "true" ||
				ref.contentEditable === ""
			)) {
				throw new Error(
					`[hstd] io.${name} requires <input>, <textarea>, <select>, or contenteditable element, ` +
					`but received <${ref.tagName.toLowerCase()}>`
				);
			}

			if(!isPointer(pointer)) {
				throw new Error(
					`[hstd] io.${name} requires a Pointer value for two-way binding, ` +
					`but received ${typeof pointer}`
				);
			}

			let fromInput = false;

			inputListener(({ target: { [name]: value } }) => {
				fromInput = true;
				pointer.$ = "number\0range".includes(ref.type) ? Number(value) : value;
				fromInput = false;
			}, ref);

			ref[name] = pointer.watch($ => fromInput ? 0 : ref[name] = $).$;
		};
	})
;

export { io }
