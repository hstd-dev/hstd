import { listen } from "./core/listen.js";
import { createPointer, createSignature, isPointer } from "./core/pointer.js";
import { isFrozenArray, isConstructedFrom } from "./core/checker.js";
import { createCache } from "./core/cache.js";


const

	getTempCache = createCache((s) => {
		const code = createSignature();
		return [s.join(code), new RegExp(code, "g")]
	}),

	createTemp = (s, v) => {

		const
			[temp, tempMatcherRegex] = getTempCache(s),
			vMap = v.map((vt, i) => (
				isPointer(vt)
					? vt.watch(() => (vMap[i] = vt.$, ptr.$ = refreshTemp())).$
					: vt
			)),
			refreshTemp = (x = 0) => temp.replaceAll(tempMatcherRegex, () => vMap[x++]),
			ptr = createPointer(refreshTemp())
		;

		return ptr;

	},


	globalPropPtrCache = {},

	globalPropCaptureTarget = "\0innerWidth\0innerHeight\0outerWidth\0outerHeight\0",

	// valueFetcherRAFCallback = () => {
		
	// }

	$ = new Proxy(
		(x, ...y) => (isFrozenArray(x) && isFrozenArray(x?.raw) ? createTemp : createPointer)(x, y),
		{
			get: (_, prop) => {

				if(prop === Symbol.hasInstance) return isPointer;

				let tmp = globalPropPtrCache[prop];

				if(!tmp && !isConstructedFrom(globalThis[prop], Function)) {

					tmp = globalPropPtrCache[prop] = createPointer(globalThis[prop]);

					listen(
						"resize",
						({ target }) => tmp.$ = target[prop],
						globalThis,
					);

				}

				return tmp || globalPtr[prop];

			}
		}
	)
;

const globalPtr = createPointer(globalThis);

/**
 * 
 * @param { number | string | any[] } value 
 * @param { Function } setterFn 
 * @param { object } options 
 * @returns { object }
 */
export { $ };