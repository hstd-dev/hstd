import { Cache } from "./core/cache.js"
import { Pointer } from "./core/pointer.js";
import { listen } from "./core/listen.js";

const

	inputListener = listen("input"),

	bindCache = Cache((name) => Pointer((pointer, ref) => {

		if(ref instanceof HTMLElement) {

			let fromInput = false;

			inputListener(({ target: { [name]: value } }) => {
				fromInput = true;
				pointer.$ = "number\0range".includes(ref.type) ? Number(value) : value;
				fromInput = false;
			}, ref);

			ref[name] = pointer.watch($ => fromInput ? 0 : ref[name] = $).$;
		};
	}))
;

export const io = new Proxy({}, { get: (_, prop) => bindCache(prop) })