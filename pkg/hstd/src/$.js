import { listen } from "./core/listen.js";
import { Cache } from "./core/cache.js";
import { isFrozenArray, isConstructedFrom } from "./core/checker.js";
import { Pointer, createSignature, isPointer } from "./core/pointer.js";

const

	getLiteralTempCache = Cache((s) => {

		const code = createSignature();

		return [s.join(code), new RegExp(code, "g")]

	}, true),

	createTemp = (s, v) => {

		const
			[temp, tempMatcherRegex] = getLiteralTempCache(s),
			vMap = v.map((vt, i) => (
				isPointer(vt)
					? vt.watch(() => (vMap[i] = vt.$, ptr.$ = refreshTemp())).$
					: vt
			)),
			refreshTemp = (x = 0) => temp.replaceAll(tempMatcherRegex, () => vMap[x++]),
			ptr = Pointer(refreshTemp())
		;

		return ptr;

	},


	globalPropPtrCache = {},
	
	$ = new Proxy(

		(x, ...y) => (isFrozenArray(x) && isFrozenArray(x?.raw) ? createTemp : Pointer)(x, y),

		{
			get: (_, prop) => {

				if(prop === Symbol.hasInstance) return isPointer;

				if(prop === "this") {

					return;
				}

				let tmp = globalPropPtrCache[prop];

				if(!tmp && !isConstructedFrom(globalThis[prop], Function)) {

					tmp = globalPropPtrCache[prop] = Pointer(globalThis[prop]);

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

const globalPtr = Pointer(globalThis);

/**
 * 
 * @param { number | string | any[] } value 
 * @param { Function } setterFn 
 * @param { object } options 
 * @returns { object }
 */
export { $, Pointer };