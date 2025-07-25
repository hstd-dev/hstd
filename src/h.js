import { listen } from "./core/listen.js";
import { isPointer } from "./core/pointer.js";
import { createCache } from "./core/cache.js";
import { isConstructedFrom } from "./core/checker.js";
import { getPrototype } from "./core/prototype.js";
import { random } from "./core/random.js";

const

	{ replaceWith } = getPrototype(Element),

	HTML_IDENTIFIER = Symbol.for("HTML_IDENTIFIER"),

	df = document.createDocumentFragment(),

	fragmentTemp = {

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

	refProxyHandler = {

		get(target, prop) {

			const targetValue = target[prop];

			return isConstructedFrom(targetValue, Function)
				? targetValue.bind(target)
				: targetValue
			;

		},

		set(target, prop, newValue) {

			console.log(prop)

			if(prop !== "id") resolveAttr(null, target, { [prop]: newValue });

			return true;

		}
	},

	listenInput = listen("input"),

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

	resolveAttr = (id, ref, attr) => Reflect.ownKeys(attr).forEach((attrProp) => {

		const
			attrValue = attr[attrProp],
			attrPropType = typeof attrProp
		;

		if(attrPropType == "symbol") {

			const attrPtr = globalThis[attrProp.description.slice(0, 52)]?.(attrProp);
			if(!isPointer(attrPtr)) return;
			
			const buf = attrPtr.$(attrValue, ref);
			if(buf?.constructor !== Object) return;

			resolveAttr(id, ref, buf);

		} else if(attrPropType == "string") {

			if(isPointer(attrValue)) {

				ref[attrProp] = attrValue.watch($ => ref[attrProp] = $).$;

				if("\0value\0checked\0".includes(`\0${attrProp}\0`) && attrProp in ref) {

					listenInput(
						({ target: { [attrProp]: value } }) => attrValue.$ = (
							"number\0range".includes(ref.type)
								? Number(value)
								: value
						),
						ref
					)

				};

			} else {

				ref[attrProp] = attrValue;

			}

			if(attrProp == "id" && !(attrValue in id)) {

				id[attrValue] = new Proxy(ref, refProxyHandler);

			}
		}
	}),

	resolveBody = (ref, body) => {

		if(body instanceof Promise) {

			const comment = Object.assign(document.createElement("div"), { hidden: true });
			body.then(resolveBody.bind(null, comment));
			ref.replaceWith(comment);

		} else if(typeof body[Symbol.asyncIterator] === 'function') {

			const
				markerBegin = document.createComment(""),
				markerEnd = document.createComment(""),
				markerReplacement = Object.assign(document.createElement("div"), { hidden: true })
			;

			let markerParent;

			let isInitial = true;
			let doReplace = true;

			(async () => {

				for await(const yielded of body) {

					if(isInitial && yielded === "append") {
						doReplace = false;
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

					}

					markerParent ||= markerEnd.parentNode;

					markerParent.insertBefore(markerReplacement, markerEnd);

					resolveBody(markerReplacement, yielded);
				}

				markerBegin.remove();
				markerEnd.remove();

			})();

			ref.replaceWith(markerBegin, markerEnd);
			
		} else {
			replaceWith.apply(ref, (
				isConstructedFrom(body, Array)					? body.map(frag => [...frag]).flat(1)
				: body instanceof NodeList						? body
				: isPointer(body)								? body.text()
				:												[new Text(body)]
			))
		}
	},

	hCache = createCache((s) => {

		let
			joined = s.join(""),
			replacementCounter = 0,
			tokenBuf = "t"
		;

		while(joined.includes(tokenBuf += random()));

		joined = s.join(tokenBuf);

		const
			TOKEN_LENGTH = tokenBuf.length,
			attrMatch = [...joined.matchAll(new RegExp(`<(?:(!--|\\/[^a-zA-Z])|(\\/?[a-zA-Z][^>\\s]*)|(\\/?$))[\\s].*?${tokenBuf}`, "g"))]
				.map(({ 0: { length }, index }) => index + length)
			,
			placeholder = [],
			node = document.createElement("div")
		;

		df.appendChild(node);

		node.innerHTML = joined.replaceAll(
			tokenBuf,
			(_, index) => (placeholder[replacementCounter++] = attrMatch.includes(index + TOKEN_LENGTH))
				? tokenBuf
				: `<br ${tokenBuf}>`
		);

		return (v) => {

			const
				newNode = node.cloneNode(true),
				id = {}
			;
			
			newNode.querySelectorAll(`[${tokenBuf}]`).forEach((ref, index) => {

				const body = v[index];
		
				placeholder[index]
					? resolveAttr(id, ref, body)
					: resolveBody(ref, body);
				;
		
				ref.removeAttribute(tokenBuf);
			});
	
			const nodeList = Object.assign(
	
				newNode.childNodes,
				fragmentTemp,
				{
					on(...onloadCallbacks) {

						onloadCallbacks.forEach(fn => fn(id));

						return nodeList;
			
					}
				}
		
			);

			return nodeList
		};

	}, true),

	h = (s, ...v) => hCache(s)(v)
;

export { h }