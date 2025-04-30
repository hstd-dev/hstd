import { listen } from "./core/listen.js";
import { isPointer } from "./core/pointer.js";
import { createCache } from "./core/cache.js";
import { isConstructedFrom } from "./core/checker.js";
import { getPrototype } from "./core/prototype.js";

const { replaceWith } = getPrototype(Element);
const { cloneNode } = getPrototype(Node);

const

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

		}
	},

	bindResolver = (id, ref, attrBody) => Reflect.ownKeys(attrBody).forEach(attrResolve.bind(null, id, ref, attrBody)),

	attrResolve = function(id, ref, attrBody, attrProp) {

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

					listen(
						"input",
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
	},

	// resolveVBody = (vBody) => (
	// 	isConstructedFrom(vBody, Array)					? vBody.map(frag => [...frag]).flat(1)
	// 	: vBody[Symbol.toPrimitive]?.(HTML_IDENTIFIER)	? vBody
	// 	: isPointer(vBody)								? vBody.text()
	// 	:												[new Text(vBody)]
	// ),

	resolveQuery = function([tokenBuf, propLocation], v, id, ref, index) {

		const vBody = v[index];

		propLocation[index]
			? bindResolver(id, ref, vBody)
			: replaceWith.apply(ref, (
				isConstructedFrom(vBody, Array)					? vBody.map(frag => [...frag]).flat(1)
				: vBody[Symbol.toPrimitive]?.(HTML_IDENTIFIER)	? vBody
				: isPointer(vBody)								? vBody.text()
				:												[new Text(vBody)]
			))
		;

		ref.removeAttribute(tokenBuf);
	},

	then = function(id, onloadCallbackFn) {

		onloadCallbackFn(id);

		return this;

	},

	elementTempBase = function (tokenBuf__propLocation__node, v) {

		const
			newNode = tokenBuf__propLocation__node[2](),
			id = {}
		;
		
		newNode.querySelectorAll(`[${tokenBuf__propLocation__node[0]}]`).forEach(resolveQuery.bind(null, tokenBuf__propLocation__node, v, id));

		return Object.assign(

			newNode.childNodes,
			fragmentTemp,
			{ then: then.bind(null, id) }
	
		);
	},

	hCache = createCache((s) => {

		let
			joined = s.join(""),
			replacementCounter = 0,
			tokenBuf = "t"
		;

		while(joined.includes(tokenBuf += BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)).toString(36)));

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

		return elementTempBase.bind(null, [tokenBuf, placeholder, cloneNode.bind(node, !0)]);

	})
;

/**
 * @param { TemplateStringsArray } s
 * @param { (string | number | { [key: (string | symbol)]: any })[] } v
 * 
 * @returns { NodeList }
 */

export const h = (s, ...v) => hCache(s)(v);