import { isPointer } from "./core/pointer.js";
import { Memo } from "./core/memo.js";
import { isAsyncGenerator, isConstructedFrom, isFrozenArray } from "./core/checker.js";
import { getPrototype } from "./core/prototype.js";
import { random } from "./core/random.js";

const

	{ replaceWith } = getPrototype(Element),

	HTML_IDENTIFIER = Symbol.for("HTML_IDENTIFIER"),

	DF = document.createDocumentFragment(),

	FRAGMENT_TEMP = {

		[Symbol.toPrimitive](hint) {
			return (
				typeof hint == "string"
					? [...this[Symbol.iterator]().map(element => element.outerHTML)].join("")
					: hint === HTML_IDENTIFIER
			)
		},
		toString() {
			return this[Symbol.toPrimitive]("string")
		}

	},

	REF_PROXY_HANDLER = {

		get(target, prop) {

			if(prop in Element.prototype) return;

			const targetValue = target[prop];

			return isConstructedFrom(targetValue, Function)
				? targetValue.bind(target)
				: targetValue
			;

		},

		set(target, prop, newValue) {

			if(!(prop in Element.prototype)) resolveAttr(null, target, { [prop]: newValue });

			return true;

		}
	},

	// arrayOpCollection = {
	// 	triggerSwapEvent() {
			
	// 	},
	// 	insert(array, index) {

	// 	}
	// },

	// arrayMethodArchive = Object.fromEntries(Object.getOwnPropertyNames(Array.prototype).filter(x => typeof [][x] == "function").map(x => {

	// 	const ogMethod = (function() {}).apply.bind([][x]);

	// 	return [x, function() {

	// 		return ogMethod(this, arguments);
	// 	}]

	// })),

	// resolveArray = (id, ref, array) => {
	// 	Object.assign(array, Object.fromEntries(arrayMethodArchive))
	// },

	resolveAttr = (ref, attr, id) => Reflect.ownKeys(attr).forEach((attrProp) => {

		const
			attrValue = attr[attrProp],
			attrPropType = typeof attrProp
		;

		if(attrPropType == "symbol") {

			const attrPtr = globalThis[attrProp.description.slice(0, 52)]?.(attrProp);
			if(!isPointer(attrPtr)) return;
			
			const buf = attrPtr.$(attrValue, ref);
			if(buf?.constructor !== Object) return;

			resolveAttr(ref, buf, id);

		} else if(attrPropType == "string") {

			if(attrProp == "id") {

				const refProxy = new Proxy(ref, REF_PROXY_HANDLER);

				if(isPointer(attrValue)) {

					if(attrValue.$ === undefined) {

						attrValue.$ = refProxy;

					}

				} else if(!(attrValue in id)) {

					id[attrValue] = refProxy;
				}


			} else {

				ref[attrProp] = attrValue;
	
			}
		}
	}),

	createHiddenDiv = () => Object.assign(document.createElement("div"), { hidden: true }),

	resolveBody = (ref, body) => {

		const markerReplacement = createHiddenDiv();

		if(body instanceof Promise) {

			body.then(resolveBody.bind(null, markerReplacement));
			ref.replaceWith(markerReplacement);

		} else if(isAsyncGenerator(body)) {

			const
				markerBegin = createHiddenDiv(),
				markerEnd = createHiddenDiv()
			;

			let
				isInitial = true,
				doReplace = true,
				
				markerParent
			;

			(async () => {

				for await(const yielded of body) {

					if(isInitial && yielded === "append") {
						doReplace = isInitial = false;
						continue;
					};

					isInitial = false;

					if(doReplace) {

						let currentMarker = markerBegin.nextSibling;
	
						while (currentMarker && currentMarker !== markerEnd) {
							const next = currentMarker.nextSibling;
							currentMarker.remove();
							currentMarker = next;
						}

					};

					(markerParent ||= markerEnd.parentNode).insertBefore(markerReplacement, markerEnd);

					resolveBody(markerReplacement, yielded);
				}

				markerBegin.remove();
				markerEnd.remove();

			})();

			ref.replaceWith(markerBegin, markerEnd);
			
		} else if(isPointer(body)) {

			const text = new Text(body.watch($ => text.textContent = $).$);

			ref.replaceWith(text);

		} else {

			replaceWith.apply(ref, (
				isConstructedFrom(body, Array)	? body.map(frag => [...frag]).flat(1)
				: body instanceof NodeList		? body
				:								[new Text(body)]
			))
		}
	},

	hCache = Memo((s) => {

		let
			tokenBuf = "t" + random(),
			joined = s.join(tokenBuf),
			replacementCounter = 0
		;

		const
			tokenLength = tokenBuf.length,              
			bodyMatch = [...joined.matchAll(new RegExp(tokenBuf + "(?!([^<]*>))", 'g'))]
				.map(({ 0: { length }, index }) => index + length)
			,
			placeholder = [],
			node = createHiddenDiv(),
			cloneNode = node.cloneNode.bind(node, true)
		;

		DF.appendChild(node);

		node.innerHTML = joined.replaceAll(
			tokenBuf,
			(_, index) => (placeholder[replacementCounter++] = bodyMatch.includes(index + tokenLength))
				? `<br ${tokenBuf}>`
				: tokenBuf
		);

		return (v) => {

			const
				newNode = cloneNode(),
				id = {}
			;
			
			newNode.querySelectorAll(`[${tokenBuf}]`).forEach((ref, index) => {

				const body = v[index];
		
				placeholder[index]
					? resolveBody(ref, body)
					: resolveAttr(ref, body, id)
				;
		
				ref.removeAttribute(tokenBuf);
			});

			return Object.assign(
	
				newNode.childNodes,
				FRAGMENT_TEMP,
				{
					on(...onloadCallbacks) {

						onloadCallbacks.forEach(fn => fn(id));

						return this;
			
					}
				}
		
			);
		};

	}, true),

	h = (s, ...v) => {

		if(isFrozenArray(s)) return hCache(s)(v);

		const ref = createHiddenDiv();
		resolveBody(ref, s);
		return ref;
	}
;

export { h }