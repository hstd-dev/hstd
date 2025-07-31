import { cache } from "./core/cache.js"
import { createPointer } from "./core/pointer.js";
import { listen } from "./on.js";

const inputListener = listen("input");

const bindCache = cache((name) => createPointer((pointer, ref) => {

	if(ref instanceof HTMLElement) {

		let fromInput = false;

		inputListener(({ target: { [name]: value } }) => {
			fromInput = true;
			pointer.$ = "number\0range".includes(ref.type) ? Number(value) : value;
			fromInput = false;
		}, ref);

		ref[name] = pointer.watch($ => fromInput ? 0 : ref[name] = $).$;
	};

}));

export const io = new Proxy({}, {

	get(_, prop) {

		return bindCache(prop);
	}
})