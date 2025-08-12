import { listen } from "./core/listen.js";
import { Prop } from "./core/prop.js";

const

	inputListener = listen("input"),

	io = Prop((name) => (pointer, ref) => {

		if(ref instanceof HTMLElement) {

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