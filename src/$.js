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

				if(!tmp) {

					if(globalPropCaptureTarget.includes(`\0${tmp}\0`)) {

						tmp = globalPropPtrCache[prop] = createPointer(globalThis[prop], void 0, { writable: false });

						listen(
							window,
							"resize",
							() => tmp.$ = globalThis[prop]
						)

					};
				}

				return tmp || globalPtr[prop];

			}
		}
	)
;

// [

// 	["innerWidth\0innerHeight\0outerWidth\0outerHeight", "resize"]

// ].forEach((props, eventType) => {

// 	aEL(
// 		globalThis,
// 		eventType,
// 		() => props.forEach(prop => globalPropPtrCache[prop].$ = globalThis[prop])
// 	)

// });

const globalPtr = createPointer(globalThis);

/**
 * 
 * @param { number | string | any[] } value 
 * @param { Function } setterFn 
 * @param { object } options 
 * @returns { object }
 */
export { $ };