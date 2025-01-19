// ihasq/h ❤ lit-html's textEndRegex ❤

const

	TOKEN_LENGTH = 16,

	PTR_IDENTIFIER = Symbol.for("PTR_IDENTIFIER"),
	HTML_IDENTIFIER = Symbol.for("HTML_IDENTIFIER"),

	createToken = function*(length = TOKEN_LENGTH) {
		for(let i = 0; i < length; i++) {
			yield Math.floor(Math.random() * 26) + 97
		}
	},

	elementTempMap = new WeakMap(),

	df = document.createDocumentFragment(),

	fragmentTemp = {
		then(onloadCallbackFn) {
			onloadCallbackFn(this.id)
			return this;
		},
		[Symbol.toPrimitive](hint) {
			return typeof hint == "string" ? [...this[Symbol.iterator]().map(element => element.outerHTML)].join("") : hint === HTML_IDENTIFIER
		},
		toString() {
			return this[Symbol.toPrimitive]("string")
		}
	},

	bidirectionalElementMap = [
		HTMLInputElement.prototype,
		HTMLSelectElement.prototype,
		HTMLTextAreaElement.prototype
	],

	h = (s, ...v) => {

		let elementTemp = elementTempMap.get(s);

		if(!elementTemp) {

			let joined = s.join(""), tokenBuf;
			while(joined.includes(tokenBuf = String.fromCharCode(...createToken()))) {};
			joined = s.join(tokenBuf);

			const
				attrMatch = Array.from(joined.matchAll(new RegExp(`<(?:(!--|\\/[^a-zA-Z])|(\\/?[a-zA-Z][^>\\s]*)|(\\/?$))[\\s].*?${tokenBuf}`, "g")).map(({ 0: { length }, index }) => index + length)),
				placeholder = {},
				node = document.createElement("div")
			;

			df.appendChild(node);

			node.innerHTML = joined.replaceAll(tokenBuf, (_, index) => {

				let id;
				while(joined.includes(id = String.fromCharCode(...createToken()))) {};
				return (placeholder[id] = attrMatch.includes(index + TOKEN_LENGTH)) ? id : `<br ${id}>` 

			});

			elementTempMap.set(s, elementTemp = [node, placeholder])
		};

		const
			[node, placeholder] = elementTemp,
			newNode = node.cloneNode(true),
			idList = {}
		;

		Object.keys(placeholder).forEach((id, index) => {

			const
				ref = newNode.querySelector(`[${id}]`),
				vBody = v[index]
			;

			if(placeholder[id]) {

				Reflect.ownKeys(vBody).forEach(attrProp => {

					const
						attrValue = vBody[attrProp],
						attrPropType = typeof attrProp
					;

					if(attrPropType == "symbol") {

						const ptr = globalThis[attrProp.description.slice(0, 52)]?.(attrProp);
						if(!ptr?.[Symbol.toPrimitive]?.(PTR_IDENTIFIER)) return;
						ptr.$(attrValue, ref);
						return;

					}
					if(attrPropType == "string") {

						if(attrValue[Symbol.toPrimitive]?.(PTR_IDENTIFIER)) {

							if(attrProp == "value" && "value" in ref) {

								const oninput = $ => ref.value = $;
								attrValue.watch(oninput);

								ref.addEventListener("input", ({ target: { value } }) => setTimeout(() => {

									attrValue.ignore.set(oninput);
									attrValue.$ = value
									attrValue.ignore.delete(oninput);

								}), { passive: true })

							} else {

								attrValue.watch($ => ref[attrProp] = $)

							}

						} else if(attrProp == "id" && !(attrValue in idList)) {

							idList[attrValue] = ref;

						} else {

							ref[attrProp] = attrValue;

						}
					}
				});

			} else {

				const primitiveDef = vBody[Symbol.toPrimitive];

				if(primitiveDef?.(HTML_IDENTIFIER)) {

					ref.replaceWith(...vBody)

				} else {
					
					const txt = new Text("")
					ref.replaceWith(txt)
					primitiveDef?.(PTR_IDENTIFIER) ? vBody.watch($ => txt.textContent = $) : txt.textContent = vBody

				}
			}

			ref.removeAttribute(id);
		});

		return Object.assign(newNode.childNodes, fragmentTemp, { id: idList });
	}
;

/**
 * 
 */
export { h }