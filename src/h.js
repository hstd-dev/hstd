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

			if(prop !== "id") bindResolver(null, target, { [prop]: newValue });

			return true;

		}
	},

	listenInput = listen("input"),

	bindResolver = (id, ref, attrBody) => Reflect.ownKeys(attrBody).forEach((attrProp) => {

		const
			attrValue = attrBody[attrProp],
			attrPropType = typeof attrProp
		;

		if(attrPropType == "symbol") {

			const attrPtr = globalThis[attrProp.description.slice(0, 52)]?.(attrProp);
			if(!isPointer(attrPtr)) return;
			
			const buf = attrPtr.$(attrValue, ref);
			if(buf?.constructor !== Object) return;

			bindResolver(id, ref, buf);

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

	resolveVBody = (ref, vBody) => {

		if(vBody instanceof Promise) {

			const comment = Object.assign(document.createElement("div"), { hidden: true });
			vBody.then(resolveVBody.bind(null, comment));
			ref.replaceWith(comment);

		} else {
			replaceWith.apply(ref, (
				isConstructedFrom(vBody, Array)					? vBody.map(frag => [...frag]).flat(1)
				: vBody instanceof NodeList						? vBody
				: isPointer(vBody)								? vBody.text()
				:												[new Text(vBody)]
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
				newNode = node.cloneNode(!0),
				id = {}
			;
			
			newNode.querySelectorAll(`[${tokenBuf}]`).forEach((ref, index) => {

				const vBody = v[index];

				// console.log(vBody)
		
				placeholder[index]
					? bindResolver(id, ref, vBody)
					: resolveVBody(ref, vBody);
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