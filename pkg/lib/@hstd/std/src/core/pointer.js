import { isConstructedFrom } from "./checker.js";
import { Memo } from "./memo.js";

const

	{ Promise, Function } = globalThis,

	PTR_IDENTIFIER = Symbol.for("PTR_IDENTIFIER"),

	publishedPtr = {},
	
	createSignature = () => String.fromCharCode(...resolverSignatureGenCB()),
	
	isPointer = (ptr) => ptr?.[PTR_IDENTIFIER],

	resolverSignatureGenCB = function*(length = 52) {
		let c = 0;
		while(c++ < length) {
			let buf = Math.floor(Math.random() * 31)
			yield 0x7f + buf + (buf > 0x8d) + (buf > 0x9c)
		};
	},

	logicOps = {
		is:						Object.is,
		leq:					(a, b) => a == b,
		seq:					(a, b) => a === b,
		or:						(a, b) => a || b,
		and:					(a, b) => a && b,
		xor:					(a, b) => a ^ b,

		sum:					(a, b) => a + b,
		sub:					(a, b) => a - b,
		mul:					(a, b) => a * b,
		div:					(a, b) => a / b,
		mod:					(a, b) => a % b,

		// rsh:					(a, b) => a >> b,
		// ursh:				(a, b) => a >>> b,
		// lsh:					(a, b) => a << b,
	},

	opTemp = Object.assign(

		{

			[Symbol.toPrimitive]([value], hint) {

				return (
					typeof hint === "string"
						? hint === "string" && isConstructedFrom(value, Function)
							? this.publish()
							: value.toString()
						: hint === PTR_IDENTIFIER
				);

			},

			/**
			 * watch(watcherFn) - add watcher to pointer, which observes the mutation of attatched value.
			 */

			watch(buffer, watcherFn) {

				if(watcherFn) {
					buffer[2].set(watcherFn, [
						buffer[1].push(watcherFn) - 1,
						!0
					])
				};

				return this;

			},

			abort(buffer, watcherFn) {

				if(watcherFn) {
					const info = buffer[2].get(watcherFn);
					info[1] = !1;
					delete buffer[1][info?.[0]];
				};

				return this;

			},

			into([value], transformerFn = $ => $) {

				const
					binder = value => {
						const tmp = transformerFn(value);
						return isConstructedFrom(tmp, Promise) ? (tmp.then($ => newPtr.$ = $), undefined)
							// : isPtr(tmp) ? newPtr
							: newPtr.$ = tmp;
					},
					newPtr = Pointer()
				;

				binder(value);

				this.watch(binder);

				return newPtr;
			},

			until(_, value) {

				return new Promise(r => {

					const watcherFn = $ => (isConstructedFrom(value, Function) ? value($) : $ === value)
						? (this.abort(watcherFn), r(this))
						: 0
					;

					this.watch(watcherFn);

				})
			},

			switch() {

				this.$ = !this.$;

				return this;

			},

			not() {

				return this.into($ => !$)

			},

			bool() {

				return this.into($ => !!$)

			},

			isit(ifTrue, ifFalse) {
				
				return this.into($ => $ ? ifTrue : ifFalse);

			},

			tick() {

				let bool = false;

				return this.into(() => bool = !bool)

			},

			toString(_, base) {

				const
					isPtrCache = isPointer(base),
					ptr = this.into($ => $.toString(isPtrCache ? base.$ : base))
				;

				isPtrCache ? base.watch($ => ptr.$ = this.$.toString($)) : 0;

				return ptr;

			},

			publish(buffer) {

				const symbol = Symbol(buffer[3]);

				publishedPtr[symbol] = this;

				return symbol;

			},

			timeout(_, delay) {

				const ptr = Pointer(this.$);
				let timeoutIdBuf;

				this.watch($ => {
					clearTimeout(timeoutIdBuf);
					timeoutIdBuf = setTimeout(() => ptr.$ = $, isPointer(delay) ? delay.$ : delay)
				})

				return ptr;

			},

			from(_, callback) {

				let shouldRefresh = true;

				callback(
					(newValue) => shouldRefresh ? this.$ = newValue : newValue,
					(shouldRefreshBoolean) => shouldRefresh = shouldRefreshBoolean
				);

				return this;

			}
		},

		...Object.keys(logicOps).map(op => ({

			[op](_, value) {

				const
					isPtrCache = isPointer(value),
					boolOp = logicOps[op],
					ptr = this.into($ => boolOp($, isPtrCache ? value.$ : value))
				;

				isPtrCache ? value.watch($ => ptr.$ = boolOp(this.$, $)) : 0;

				return ptr;

			}

		}))

	),

	ptrFromBuffer = new WeakMap(),

	recieverResolver = (reciever, prop) => (...args) => {
									
		const
			argMap = args.map((arg, i) => (

				isPointer(arg)

					? arg.watch($ => (

						argMap[i] = $,
						ptrBuf.$ = reciever.$[prop](...argMap)

					)).$

					: arg
			)),

			ptrBuf = reciever.into($ => $[prop](...argMap))
		;

		return ptrBuf

	},

	execWatcherTemp = (buffer) => function(value, force, ptr) {
		const watcherInfo = buffer[2];
		(force || (value !== buffer[0]))
			? (buffer[0] = value, buffer[1].forEach(fn => watcherInfo.get(fn)?.[1] ? fn(value) : 0))
			: 0
		;
		return ptr;
	},

	opBinder = Memo((prop) => Memo((buffer) => opTemp[prop].bind(ptrFromBuffer.get(buffer), buffer), true)),
	
	hasOp = hasOwnProperty.bind(opTemp),

	Pointer = (value, [setter, options] = []) => {

		const
			watchers = [],
			watcherInfo = new WeakMap(),
			formattedOptions = Object.assign({ name: "$", writable: true }, options),
			buffer = [
				value,
				watchers,
				watcherInfo,
				signature + formattedOptions.name
			],
			execWatcher = execWatcherTemp(buffer),

			ptr = new Proxy(

				Object.defineProperties(Object(function(...args) {
	
					const [tmp] = buffer;
	
					return isConstructedFrom(tmp, Function) ? tmp.apply(null, args) : tmp;
	
				}), { name: { value: formattedOptions.name } }),
	
				{
	
					get(_, prop, reciever) {
	
						const
							[tmp] = buffer
						;
				
						return (
								prop === "$"					? tmp
								: prop === "refresh"			? execWatcher.bind(null, tmp, !0, reciever)
								: prop === "constructor"		? !0
								: prop === Symbol.asyncIterator	? false
				
								: prop === PTR_IDENTIFIER		? !0
								: prop === Symbol.hasInstance	? () => !1
	
								: hasOp(prop)					? opBinder(prop)(buffer)
				
								: (
									isConstructedFrom(tmp[prop], Function)
			
										? recieverResolver(reciever, prop)
			
										: reciever.into($ => $[prop])
								)
						);
					},
	
					set(_, prop, newValue) {
	
						if(formattedOptions.writable) {
				
							if(prop == "$") {
				
								const tmp = setter ? setter(newValue) : newValue;
				
								isConstructedFrom(tmp, Promise) ? tmp.then(execWatcher) : execWatcher(tmp)
				
							} else {
								
								buffer[0][prop] = (
									isPointer(newValue)
										? newValue.watch($ => buffer[0][prop] = $).$
										: newValue
								)
							}
						}
				
				
						return !0;
				
					}
	
				}
	
			)
		;

		ptrFromBuffer.set(buffer, ptr);

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