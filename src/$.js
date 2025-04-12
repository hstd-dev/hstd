import { listen } from "./core/listen.js";
import { createPointer, createSignature, isPointer } from "./core/pointer.js";
import { isFrozenArray } from "./core/checker.js";


const

	createTemp = (s, v) => {

		const
			code = createSignature(),
			temp = s.join(code),
			tempMatcherRegex = new RegExp(code, "g"),
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


	$ = new Proxy(
		(x, ...y) => (isFrozenArray(x) && isFrozenArray(x?.raw) ? createTemp : createPointer)(x, y),
		{
			get: (_, prop) => {

				let tmp = globalPropPtrCache[prop];

				if(!tmp && globalPropCaptureTarget.includes(`\0${prop}\0`)) {

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