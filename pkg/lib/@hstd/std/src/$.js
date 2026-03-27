import { listen } from "./core/listen.js";
import { Memo } from "./core/memo.js";
import { isFrozenArray, isConstructedFrom } from "./core/checker.js";
import { Pointer, createSignature, isPointer } from "./core/pointer.js";
import { ArrayPointer, isArrayPointer } from "./core/arraypointer.js";
import { thisProxy } from "./core/deferred.js";

const

	getLiteralTempCache = Memo((s) => {
		const code = createSignature();
		return [s.join(code), new RegExp(code, "g")]
	}, true),

	createTemp = (s, v) => {

		const
			[temp, tempMatcherRegex] = getLiteralTempCache(s),
			parents = v.filter(isPointer),
			vMap = v.map((vt, i) => (
				isPointer(vt)
					? vt.watch(() => (vMap[i] = vt.$, ptr.$ = refreshTemp())).$
					: vt
			)),
			refreshTemp = (x = 0) => temp.replaceAll(tempMatcherRegex, () => vMap[x++]),
			ptr = Pointer(refreshTemp(), [], parents.length ? parents : null)
		;

		return ptr;
	},

	createPointer = (x, y) => {
		if(isFrozenArray(x) && isFrozenArray(x?.raw)) return createTemp(x, y);
		if(isConstructedFrom(x, Array)) return ArrayPointer(x);
		return Pointer(x, y);
	},

	globalPropPtrCache = {},
	globalPtr = Pointer(globalThis),

	$ = new Proxy(

		(x, ...y) => createPointer(x, y),

		{
			get: (_, prop) => {

				if(prop === Symbol.hasInstance) return (v) => isPointer(v) || isArrayPointer(v);
				if(prop === "this") return thisProxy;

				let cached = globalPropPtrCache[prop];

				if(!cached && !isConstructedFrom(globalThis[prop], Function)) {
					cached = globalPropPtrCache[prop] = Pointer(globalThis[prop]);
					listen("resize", ({ target }) => cached.$ = target[prop], globalThis);
				}

				return cached || globalPtr[prop];
			}
		}
	)
;

export { $ };
