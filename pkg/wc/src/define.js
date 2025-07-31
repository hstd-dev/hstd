import { h } from "hstd";

const
	WC_TAG_VALIDATOR = /^[a-z](?:[a-z0-9]|[a-z0-9][\-\.][a-z0-9])*-(?:[a-z0-9]|[a-z0-9][\-\.][a-z0-9])*$/,
	createAttrState = () => {
		const body = {};
		return [
			body,
			new Proxy({}, {
				get(_, prop) {
					return body[prop] ||= $("");
				}
			})
		]
	},
	ATTR_BUF = Symbol(),
	IS_CONNECTED = Symbol(),
	CONNECT = Symbol()
;

/**
 * 
 * @param {{ [key: string]: (...any) => (NodeList | Promise<NodeList> | AsyncGenerator<NodeList>) }} componentDeclarations 
 * @returns { void }
 */
const define = (componentDeclarations) => Object.entries(componentDeclarations).forEach(([name, component]) => {

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
		initAttrList = Object.keys(initAttrBuf[0])
	;

	if(customElements.get(name)) {
		let altCount = -1;
		while(customElements.get(`${name}-${(++altCount).toString(36)}`));
		name += `-${altCount.toString(36)}`;
	};

	customElements.define(name, class extends HTMLElement {

		static get observedAttributes() {
			return initAttrList;
		}

		constructor() {
			super();
			this[IS_CONNECTED] = new Promise(r => this[CONNECT] = r);
			this[ATTR_BUF] = isInit ? (isInit = false, initAttrBuf) : createAttrState();
		}
		
		async attributeChangedCallback(name, _, newValue) {
			await this[IS_CONNECTED];
			this[ATTR_BUF][0][name].$ = newValue;
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