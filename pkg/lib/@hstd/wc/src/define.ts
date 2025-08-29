import { h, Pointer } from "hstd";

const
	WC_TAG_VALIDATOR = /^[a-z](?:[a-z0-9]|[a-z0-9][\-\.][a-z0-9])*-(?:[a-z0-9]|[a-z0-9][\-\.][a-z0-9])*$/,
	createAttrState = () => {
		const body = {};
		return [
			body,
			new Proxy({}, {
				get(_, prop) {
					return body[prop] ||= Pointer("");
				}
			})
		]
	},
	ATTR_BUF = Symbol(),
	IS_CONNECTED = Symbol(),
	CONNECT = Symbol()
;

const define = (componentDeclarations: { [key: string]: [{ [key: string]: (StringConstructor | NumberConstructor | BooleanConstructor) }, (...any) => (NodeList | Promise<NodeList> | AsyncGenerator<NodeList>)] }): void => Object.entries(componentDeclarations).forEach(([name, [attributes, component]]) => {

	if(!WC_TAG_VALIDATOR.test(name)) {
		if(WC_TAG_VALIDATOR.test(`hstd-${name}`)) {
			name = `hstd-${name}`;
		} else {
			throw new SyntaxError(`Failed to execute 'define': '${name}' is not a valid custom element name`)
		}
	};

	let isInit = true;

	const
		initAttrBuf = createAttrState(),
		initNodeListBuf = h`${component(initAttrBuf[1])}`,
		initAttrKeys = Object.keys(initAttrBuf[0]),
		initAttrList = initAttrKeys.reduce((acc, attr) => {
			if(attr.includes(":")) throw new Error("Cannot include property that starts with ':', which is reserved for binding type identifier.");
			acc.push(attr, `${attr}:number`, `${attr}:boolean`);
			return acc;
		}, []);
	;

	if(customElements.get(name)) {

		let altCount = -1;
		while(customElements.get(`${name}-${(++altCount).toString(36)}`));
		name += `-${altCount.toString(36)}`;
	};

	customElements.define(name, class extends HTMLElement {

		static get observedAttributes() {
			return Object.keys(attributes);
		}

		constructor() {
			super();
			const thisRef = this;
			const [attrPtrList] = thisRef[ATTR_BUF] = isInit ? (isInit = false, initAttrBuf) : createAttrState();
			thisRef[IS_CONNECTED] = new Promise(r => thisRef[CONNECT] = r);
			Object.defineProperties(thisRef, initAttrKeys.reduce((acc, key) => {
				const ptr = attrPtrList[name];
				acc[key] = {
					get() {
						return ptr.$;
					},
					set(newValue) {
						return ptr.$ = newValue;
					},
					configurable: false,
					writable: false,
				}
				return acc;
			}, {}))
		}
		
		async attributeChangedCallback(name, _, newValue) {
			await this[IS_CONNECTED];

			this.setAttribute(name, attributes[name] === Boolean ? newValue === "true" : attributes[name](newValue))
		}

		connectedCallback() {
			this.attachShadow({ mode: "open" });
			this.shadowRoot.append(...(isInit
                ? initNodeListBuf
                : h`${component(this[ATTR_BUF][1])}`
            ));
			this[CONNECT]();
		}

	})
});

export { define }