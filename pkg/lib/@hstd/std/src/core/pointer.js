import { isConstructedFrom } from "./checker.js";
import { Memo } from "./memo.js";
import { createObserver } from "./observer.js";

const

	{ Promise, Function } = globalThis,

	PTR_IDENTIFIER = Symbol.for("PTR_IDENTIFIER"),
	ARRAY_PTR_IDENTIFIER = Symbol.for("ARRAY_PTR_IDENTIFIER"),
	DEFERRED_PTR_IDENTIFIER = Symbol.for("DEFERRED_PTR_IDENTIFIER"),

	// Buffer indices for readability
	VALUE = 0, OBSERVER = 1, NAME = 2, PARENT = 3,

	publishedPtr = {},
	bufferOf = new WeakMap(),
	isPointer = (ptr) => ptr?.[PTR_IDENTIFIER],

	createSignature = () => String.fromCharCode(...Array.from({ length: 52 }, () => {
		let buf = Math.floor(Math.random() * 31);
		return 0x7f + buf + (buf > 0x8d) + (buf > 0x9c);
	})),

	// Binary operations (auto-generated methods)
	binaryOps = {
		is: Object.is, leq: (a, b) => a == b, seq: (a, b) => a === b,
		or: (a, b) => a || b, and: (a, b) => a && b, xor: (a, b) => a ^ b,
		sum: (a, b) => a + b, sub: (a, b) => a - b, mul: (a, b) => a * b,
		div: (a, b) => a / b, mod: (a, b) => a % b,
	},

	// Unary operations (auto-generated methods)
	unaryOps = { not: $ => !$, bool: $ => !!$ },

	execWatchers = (buffer, value, force) => {
		(force || value !== buffer[VALUE]) && (
			buffer[VALUE] = value,
			buffer[OBSERVER].notify(value)
		);
	},

	ops = Object.assign(Object.create(null), {

		[Symbol.toPrimitive](hint) {
			const value = bufferOf.get(this)[VALUE];
			return typeof hint === "string"
				? hint === "string" && isConstructedFrom(value, Function) ? this.publish() : value.toString()
				: hint === PTR_IDENTIFIER;
		},

		watch(watcherFn) {
			return bufferOf.get(this)[OBSERVER].watch(watcherFn, this);
		},

		abort(watcherFn) {
			return bufferOf.get(this)[OBSERVER].abort(watcherFn, this);
		},

		into(transformerFn = $ => $) {
			const buffer = bufferOf.get(this),
				binder = value => {
					const result = transformerFn(value);
					return isConstructedFrom(result, Promise)
						? (result.then($ => derived.$ = $), undefined)
						: derived.$ = result;
				},
				derived = Pointer(undefined, [], this)
			;

			binder(buffer[VALUE]);
			this.watch(binder);
			return derived;
		},

		until(value) {
			const buffer = bufferOf.get(this), self = this;
			return new Promise(resolve => {
				const check = ($) => isConstructedFrom(value, Function) ? value($) : $ === value;
				if(check(buffer[VALUE])) return resolve(self);
				const watcherFn = $ => { if(check($)) { self.abort(watcherFn); resolve(self); } };
				self.watch(watcherFn);
			});
		},

		switch() { this.$ = !this.$; return this; },
		isit(ifTrue, ifFalse) { return this.into($ => $ ? ifTrue : ifFalse); },
		tick() { let flag = false; return this.into(() => flag = !flag); },

		toString(base) {
			const baseIsPtr = isPointer(base),
				ptr = this.into($ => $.toString(baseIsPtr ? base.$ : base));
			baseIsPtr ? base.watch($ => ptr.$ = this.$.toString($)) : 0;
			return ptr;
		},

		publish() {
			const symbol = Symbol(bufferOf.get(this)[NAME]);
			publishedPtr[symbol] = this;
			return symbol;
		},

		timeout(delay) {
			const ptr = Pointer(this.$);
			let timeoutId;
			this.watch($ => {
				clearTimeout(timeoutId);
				timeoutId = setTimeout(() => ptr.$ = $, isPointer(delay) ? delay.$ : delay);
			});
			return ptr;
		},

		from(callback) {
			let shouldRefresh = true;
			callback(
				(newValue) => shouldRefresh ? this.$ = newValue : newValue,
				(flag) => shouldRefresh = flag
			);
			return this;
		},

	},
	// Auto-generate unary operators
	...Object.keys(unaryOps).map(op => ({
		[op]() { return this.into(unaryOps[op]); }
	})),
	// Auto-generate binary operators
	...Object.keys(binaryOps).map(op => ({
		[op](value) {
			const valueIsPtr = isPointer(value),
				opFn = binaryOps[op],
				ptr = this.into($ => opFn($, valueIsPtr ? value.$ : value));
			valueIsPtr ? value.watch($ => ptr.$ = opFn(this.$, $)) : 0;
			return ptr;
		}
	}))),

	opCache = Memo(prop => Memo(ptr => ops[prop].bind(ptr), true)),

	resolveMethod = (receiver, prop) => (...args) => {

		const argMap = args.map((arg, i) =>
			isPointer(arg)
				? arg.watch($ => (argMap[i] = $, ptrBuf.$ = receiver.$[prop](...argMap))).$
				: arg
			),
			ptrBuf = receiver.into($ => $[prop](...argMap))
		;

		return ptrBuf;
	},

	Pointer = (value, [setter, options] = [], parent = null) => {

		const
			{ name = "$", writable = true } = options || {},
			observer = createObserver(),
			buffer = [value, observer, signature + name, parent],

			ptr = new Proxy(

				Object.defineProperties(Object(function(...args) {
					return isConstructedFrom(buffer[VALUE], Function) ? buffer[VALUE].apply(null, args) : buffer[VALUE];
				}), { name: { value: name } }),

				{
					get(_, prop, receiver) {
						const value = buffer[VALUE];
						return (
							prop === "$"						? value
							: prop === "refresh"				? () => (execWatchers(buffer, value, !0), receiver)
							: prop === "constructor"			? !0
							: prop === Symbol.asyncIterator		? false

							: prop === PTR_IDENTIFIER			? !0
							: prop === ARRAY_PTR_IDENTIFIER
								|| prop === DEFERRED_PTR_IDENTIFIER	? !1
							: prop === Symbol.hasInstance		? () => !1

							: prop === "up"						? buffer[PARENT]
							: prop === "then"					? undefined

							: prop in ops						? opCache(prop)(receiver)

							: isConstructedFrom(value[prop], Function)
								? resolveMethod(receiver, prop)
								: receiver.into($ => $[prop])
						);
					},

					set(_, prop, newValue) {
						if(writable) {
							if(prop == "$") {
								if(isPointer(newValue)) {
									ptr.from(set => (set(newValue.$), newValue.watch(set)));
								} else {
									const value = setter ? setter(newValue) : newValue;
									isConstructedFrom(value, Promise)
										? value.then(resolved => execWatchers(buffer, resolved))
										: execWatchers(buffer, value);
								}
							} else {
								buffer[VALUE][prop] = isPointer(newValue)
									? newValue.watch($ => buffer[VALUE][prop] = $).$
									: newValue;
							}
						}
						return !0;
					}
				}
			)
		;

		bufferOf.set(ptr, buffer);
		return ptr;
	}
;

let signature;
while((signature = createSignature()) in globalThis);

Object.defineProperty(globalThis, signature, {
	value: (symbol) => publishedPtr[symbol],
	configurable: !1,
	enumerable: !1
});

export { Pointer, createSignature, isPointer }
