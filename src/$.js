const

	createSignature = () => String.fromCharCode(...resolverSignatureGenCB()),

	publishedPtr = {},

	resolverSignatureGenCB = function*(length = 52) {
		let c = 0;
		while(c++ < length) {
			let buf = Math.floor(Math.random() * 31)
			yield 0x7f + buf + (buf > 0x8d) + (buf > 0x9c)
		};
	}
;

let signature;

while((signature = createSignature()) in globalThis);

Object.defineProperty(globalThis, signature, {
	value: (symbol) => publishedPtr[symbol],
	configurable: !1,
	enumerable: !1
});

const

	{ Promise, Function } = globalThis,

	PTR_IDENTIFIER = Symbol.for("PTR_IDENTIFIER"),

	isPtr = (ptr) => ptr?.[PTR_IDENTIFIER],

	isConstructedFrom = (object, proto) => object?.constructor === proto,

	isFrozenArray = (arr) => Object.isFrozen(arr) && isConstructedFrom(arr, Array),

	logicOps = {
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
						return isConstructedFrom(tmp, Promise)
							? (tmp.then($ => newPtr.$ = $), undefined)
							: newPtr.$ = tmp;
					},
					newPtr = createPtr()
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

			tick() {

				let bool = false;

				return this.into(() => bool = !bool)

			},

			toString(_, base) {

				const
					isPtrCache = isPtr(base),
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

			text() {

				const text = new Text(this.$);

				this.watch($ => text.textContent = $);

				return [text]

			},

			timeout(_, delay) {

				const ptr = createPtr(this.$);
				let timeoutIdBuf;

				this.watch($ => {
					clearTimeout(timeoutIdBuf);
					timeoutIdBuf = setTimeout(() => ptr.$ = $, isPtr(delay) ? delay.$ : delay)
				})

				return ptr;

			},
		},

		...Object.keys(logicOps).map(op => ({

			[op](_, value) {

				const
					isPtrCache = isPtr(value),
					boolOp = logicOps[op],
					ptr = this.into($ => boolOp($, isPtrCache ? value.$ : value))
				;

				isPtrCache ? value.watch($ => ptr.$ = boolOp(this.$, $)) : 0;

				return ptr;

			}

		})),

		// ...Object.keys(Math).filter(x => typeof Math[x] == "function").map(x => ({
		// 	[x](buffer, args) {
		//		
		// 	}
		// }))

	),

	createPtr = (value, [setter, options] = []) => {

		const
			watchers = [],
			watcherInfo = new WeakMap(),
			formattedOptions = Object.assign({ name: "$" }, options),
			execWatcher = function (value, force, ptr) {
				(force || (value !== buffer[0]))
					? (buffer[0] = value, watchers.forEach(fn => watcherInfo.get(fn)?.[1] ? fn(value) : 0))
					: 0
				;
				return ptr;
			},
			buffer = [
				value,
				watchers,
				watcherInfo,
				signature + (options?.name || "")
			]
		;

		return new Proxy(

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
							prop === "$"											? tmp
							: prop === "refresh"									? execWatcher.bind(null, tmp, !0, reciever)
							: prop === "constructor"								? !0


							: prop === PTR_IDENTIFIER		? !0
							: prop === Symbol.hasInstance	? () => !1

							: (
								opTemp[prop]?.bind?.(reciever, buffer) || (

									isConstructedFrom(tmp[prop], Function)

										? function(...args) {
									
											const
												argMap = args.map((arg, i) => (

													isPtr(arg)

														? arg.watch($ => (
															argMap[i] = $,
															ptrBuf.$ = reciever.$[prop](...argMap)
														)).$

														: arg
												)),

												ptrBuf = reciever.into($ => $[prop](...argMap))
											;
				
											return ptrBuf
				
										}

										: reciever.into($ => $[prop])

								)
							)

							// symbol


							// : (""

							// )
					);

				},

				set(_, prop, newValue) {

					if(prop == "$") {

						const tmp = setter ? setter(newValue) : newValue;

						isConstructedFrom(tmp, Promise) ? tmp.then(execWatcher) : execWatcher(tmp)

					} else {
						
						buffer[0][prop] = (
							isPtr(newValue)
								? newValue.watch($ => buffer[0][prop] = $).$
								: newValue
						)
					}

					return !0;

				}

			}

		)
	},

	createTemp = (s, v) => {

		const
			code = createSignature(),
			temp = s.join(code),
			tempMatcherRegex = new RegExp(code, "g"),
			vMap = v.map((vt, i) => (
				isPtr(vt)
					? vt.watch(() => (vMap[i] = vt.$, ptr.$ = refreshTemp())).$
					: vt
			)),
			refreshTemp = (x = 0) => temp.replaceAll(tempMatcherRegex, () => vMap[x++]),
			ptr = createPtr(refreshTemp())
		;

		return ptr;

	},

	// createEffect = (watcher, ...ptrs) => {

	// 	const tmp = createPtr(watcher());

	// 	ptrs.forEach((ptr) => ptr.watch(() => tmp.$ = watcher()));

	// 	return tmp;

	// },

	globalPtr = createPtr(globalThis),

	$ = new Proxy(
		(x, ...y) => (isFrozenArray(x) && isFrozenArray(x?.raw) ? createTemp : createPtr)(x, y),
		{
			get: (_, prop) => globalPtr[prop]
		}
	)
;

/**
 * 
 * @param { number | string | any[] } value 
 * @param { Function } setterFn 
 * @param { object } options 
 * @returns { object }
 */
export { $, isPtr, createPtr, isConstructedFrom };