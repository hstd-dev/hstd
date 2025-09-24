import { h } from "@hstd/std";
import { append } from "@hstd/dom";

const appenderFlag = Symbol();

const integratedHtmlTTL = Object.assign(h, {
	[Symbol.toPrimitive](hint) {
		if(hint == "string") {
			return appenderFlag;
		}
	}
});

Object.defineProperty(HTMLElement.prototype, appenderFlag, {
	set: append,
	enumerable: true,
	configurable: true
})

export { integratedHtmlTTL as h };