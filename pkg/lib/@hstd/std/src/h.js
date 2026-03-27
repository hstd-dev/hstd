import { isPointer } from "./core/pointer.js";
import { isArrayPointer } from "./core/arraypointer.js";
import { Memo } from "./core/memo.js";
import { isAsyncGenerator, isConstructedFrom, isFrozenArray } from "./core/checker.js";
import { getPrototype } from "./core/prototype.js";
import { random } from "./core/random.js";
import { isDeferredPointer } from "./core/deferred.js";

const { replaceWith } = getPrototype(Element);

const HTML_IDENTIFIER = Symbol.for("HTML_IDENTIFIER");

const DF = document.createDocumentFragment();

const FRAGMENT_TEMP = {

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

};

const REF_PROXY_HANDLER = {

	get(target, prop) {
		if(prop in Element.prototype) return;
		const targetValue = target[prop];
		return isConstructedFrom(targetValue, Function) ? targetValue.bind(target) : targetValue;
	},

	set(target, prop, newValue) {
		if(!(prop in Element.prototype)) resolveAttr(null, target, { [prop]: newValue });
		return true;
	}
};

const createHiddenDiv = () => Object.assign(document.createElement("div"), { hidden: true });

// Clear all DOM nodes between two marker elements
const clearBetween = (markerBegin, markerEnd) => {
	let current = markerBegin.nextSibling;
	while(current && current !== markerEnd) {
		const next = current.nextSibling;
		current.remove();
		current = next;
	}
};

// Resolve DeferredPointer by looking up the referenced property in the context object
const resolveDeferredValue = (value, context) => {
	if(isDeferredPointer(value)) {
		return resolveDeferredValue(context[value.prop], context);
	}
	return value;
};

// Resolve all DeferredPointers within an object using itself as context
const resolveDeferredInObject = (obj) => {
	if(!obj || obj.constructor !== Object) return obj;
	const resolved = {};
	for(const key of Reflect.ownKeys(obj)) {
		resolved[key] = resolveDeferredValue(obj[key], obj);
	}
	return resolved;
};

const resolveAttr = (ref, attr, id) => Reflect.ownKeys(attr).forEach((attrProp) => {

	let attrValue = resolveDeferredValue(attr[attrProp], attr);
	const attrPropType = typeof attrProp;

	if(attrPropType == "symbol") {

		const attrPtr = globalThis[attrProp.description.slice(0, 52)]?.(attrProp);
		if(!isPointer(attrPtr)) return;

		const resolvedValue = resolveDeferredInObject(attrValue);
		const buf = attrPtr.$(resolvedValue, ref);
		if(buf?.constructor !== Object) return;

		resolveAttr(ref, buf, id);

	} else if(attrPropType == "string") {

		if(attrProp == "id") {

			const refProxy = new Proxy(ref, REF_PROXY_HANDLER);

			if(isPointer(attrValue)) {
				if(attrValue.$ === undefined) attrValue.$ = refProxy;
			} else if(!(attrValue in id)) {
				id[attrValue] = refProxy;
			}

		} else {
			ref[attrProp] = attrValue;
		}
	}
});

// Process an async generator, inserting yielded content between markers
const processAsyncGenerator = (body, markerBegin, markerEnd, markerParentRef) => {
	let aborted = false;
	const abort = () => { aborted = true; };

	(async () => {
		let isInitial = true, doReplace = true;

		for await(const yielded of body) {
			if(aborted) break;

			if(isInitial && yielded === "append") {
				doReplace = isInitial = false;
				continue;
			}
			isInitial = false;

			if(doReplace) clearBetween(markerBegin, markerEnd);

			const placeholder = createHiddenDiv();
			(markerParentRef.node ||= markerEnd.parentNode).insertBefore(placeholder, markerEnd);
			resolveBody(placeholder, yielded);
		}

		if(!aborted) { markerBegin.remove(); markerEnd.remove(); }
	})();

	return abort;
};

const resolveBody = (ref, body) => {

	if(body instanceof Promise) {

		const marker = createHiddenDiv();
		body.then(resolveBody.bind(null, marker));
		ref.replaceWith(marker);

	} else if(isAsyncGenerator(body)) {

		const markerBegin = createHiddenDiv(), markerEnd = createHiddenDiv();
		ref.replaceWith(markerBegin, markerEnd);
		processAsyncGenerator(body, markerBegin, markerEnd, {});

	} else if(isArrayPointer(body)) {

		const markerBegin = createHiddenDiv(), markerEnd = createHiddenDiv();
		const elementNodes = new Map();
		let markerParent;

		const renderElement = (element) =>
			isConstructedFrom(element, NodeList) || element?.[Symbol.iterator]
				? [...element]
				: [element instanceof Node ? element : new Text(String(element))];

		const insertAt = (nodes, index) => {
			const entries = [...elementNodes.entries()].sort((a, b) => a[0] - b[0]);
			let insertBefore = markerEnd;
			for(const [idx, n] of entries) {
				if(idx > index) { insertBefore = n[0]; break; }
			}
			nodes.forEach(node => (markerParent ||= markerEnd.parentNode).insertBefore(node, insertBefore));
			elementNodes.set(index, nodes);
		};

		const remapKeys = (offset) => {
			const newMap = new Map();
			elementNodes.forEach((v, k) => newMap.set(k + offset, v));
			elementNodes.clear();
			newMap.forEach((v, k) => elementNodes.set(k, v));
		};

		const replaceAll = () => {
			elementNodes.forEach(nodes => nodes.forEach(n => n.remove()));
			elementNodes.clear();
			body.$.forEach((el, i) => insertAt(renderElement(el), i));
		};

		body.$.forEach((element, index) => elementNodes.set(index, renderElement(element)));
		ref.replaceWith(markerBegin, ...([...elementNodes.values()].flat()), markerEnd);

		body.on((element, index, type) => {
			markerParent ||= markerEnd.parentNode;

			if(type === "push") {
				insertAt(renderElement(element), index);
			} else if(type === "pop" || type === "shift") {
				const nodes = elementNodes.get(index);
				if(nodes) { nodes.forEach(n => n.remove()); elementNodes.delete(index); }
				if(type === "shift") remapKeys(-1);
			} else if(type === "unshift") {
				remapKeys(1);
				insertAt(renderElement(element), 0);
			} else if(type === "set" || type === "swap") {
				const oldNodes = elementNodes.get(index);
				if(oldNodes) {
					const newNodes = renderElement(element);
					oldNodes[0].before(...newNodes);
					oldNodes.forEach(n => n.remove());
					elementNodes.set(index, newNodes);
				}
			} else {
				replaceAll();
			}
		});

	} else if(isPointer(body)) {

		const markerBegin = createHiddenDiv(), markerEnd = createHiddenDiv();
		let markerParent, currentAbort = null;

		const renderPointerValue = (value) => {
			clearBetween(markerBegin, markerEnd);
			if(currentAbort) { currentAbort(); currentAbort = null; }

			markerParent ||= markerEnd.parentNode;

			if(isAsyncGenerator(value)) {
				currentAbort = processAsyncGenerator(value, markerBegin, markerEnd, { node: markerParent });
			} else if(value instanceof Node) {
				markerParent.insertBefore(value, markerEnd);
			} else if(value instanceof NodeList || (value?.[Symbol.iterator] && value[0] instanceof Node)) {
				[...value].forEach(node => markerParent.insertBefore(node, markerEnd));
			} else {
				markerParent.insertBefore(new Text(String(value ?? '')), markerEnd);
			}
		};

		ref.replaceWith(markerBegin, markerEnd);
		renderPointerValue(body.$);
		body.watch(renderPointerValue);

	} else {

		replaceWith.apply(ref, (
			isConstructedFrom(body, Array)	? body.map(frag => [...frag]).flat(1)
			: body instanceof NodeList		? body
			:								[new Text(body)]
		))
	}
};

const hCache = Memo((s) => {

	let
		tokenBuf = "t" + random(),
		joined = s.join(tokenBuf),
		replacementCounter = 0
	;

	const tokenLength = tokenBuf.length;
	const bodyMatch = [...joined.matchAll(new RegExp(tokenBuf + "(?!([^<]*>))", 'g'))]
		.map(({ 0: { length }, index }) => index + length);

	const placeholder = [];
	const node = createHiddenDiv();
	const cloneNode = node.cloneNode.bind(node, true);

	DF.appendChild(node);

	node.innerHTML = joined.replaceAll(
		tokenBuf,
		(_, index) => (placeholder[replacementCounter++] = bodyMatch.includes(index + tokenLength))
			? `<br ${tokenBuf}>`
			: tokenBuf
	);

	return (v) => {

		const newNode = cloneNode();
		const id = {};

		newNode.querySelectorAll(`[${tokenBuf}]`).forEach((ref, index) => {

			const body = v[index];

			if(placeholder[index]) {
				// Body position — plain attribute objects are not valid here
				if(body != null && isConstructedFrom(body, Object)) {
					throw new Error(
						`[hstd] Object literal in body position (interpolation #${index + 1}). ` +
						`Did you mean to use attribute syntax? e.g. <tag \${{ ... }}>`
					);
				}
				resolveBody(ref, body);
			} else {
				// Attribute position — must receive a plain object
				if(body == null || !isConstructedFrom(body, Object)) {
					throw new Error(
						`[hstd] ${body == null ? String(body) : typeof body} in attribute position (interpolation #${index + 1}). ` +
						`Attributes require an object. e.g. <tag \${{ prop: value }}>`
					);
				}
				resolveAttr(ref, body, id);
			}

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

}, true);

const appenderFlag = Symbol();

const h = Object.assign(
	(s, ...v) => {
		if(isFrozenArray(s)) return hCache(s)(v);
		const ref = createHiddenDiv();
		resolveBody(ref, s);
		return ref;
	},
	{
		[Symbol.toPrimitive](hint) {
			return hint == "string" ? appenderFlag : undefined;
		}
	}
);

Object.defineProperty(HTMLElement.prototype, appenderFlag, {
	set(fragment) {
		this.textContent = "";
		this.append(...h`${fragment}`);
		return fragment;
	},
	enumerable: true,
	configurable: true
})

export { h }
