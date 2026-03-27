const DEFERRED_PTR_IDENTIFIER = Symbol.for("DEFERRED_PTR_IDENTIFIER");

const createDeferredPointer = (propName) => ({
	[DEFERRED_PTR_IDENTIFIER]: true,
	prop: propName
});

const isDeferredPointer = (ptr) => ptr?.[DEFERRED_PTR_IDENTIFIER];

const thisProxy = new Proxy({}, {
	get(_, prop) {
		return prop === DEFERRED_PTR_IDENTIFIER ? false : createDeferredPointer(prop);
	}
});

export { DEFERRED_PTR_IDENTIFIER, createDeferredPointer, isDeferredPointer, thisProxy };
