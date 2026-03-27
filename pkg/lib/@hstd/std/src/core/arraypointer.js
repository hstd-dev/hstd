import { Pointer } from "./pointer.js";

const
	ARRAY_PTR_IDENTIFIER = Symbol.for("ARRAY_PTR_IDENTIFIER"),

	isArrayPointer = (ptr) => ptr?.[ARRAY_PTR_IDENTIFIER],

	// Creates a reactive Pointer that auto-updates when the array mutates
	reactiveQuery = (receiver, target, queryFn) => {
		const ptr = Pointer(queryFn(target));
		receiver.on(() => { ptr.$ = queryFn(target); });
		return ptr;
	},

	ArrayPointer = (initialArray = []) => {

		const
			array = [...initialArray],
			watchers = [],
			watcherInfo = new WeakMap(),
			elementPtrs = new Map(),

			notify = (element, index, type = "update") => {
				watchers.forEach(fn => {
					if(watcherInfo.get(fn)?.[1]) fn(element, index, type, proxy);
				});
			},

			getElementPtr = (index) => {
				if(!elementPtrs.has(index)) elementPtrs.set(index, Pointer(array[index]));
				return elementPtrs.get(index);
			},

			rebuildElementPtrs = () => {
				const oldPtrs = new Map(elementPtrs);
				elementPtrs.clear();
				array.forEach((val, i) => {
					const oldPtr = oldPtrs.get(i);
					if(oldPtr) { oldPtr.$ = val; elementPtrs.set(i, oldPtr); }
				});
			},

			// Bulk mutation: mutate array, rebuild element pointers, notify
			bulkMutate = (mutateFn, type) => {
				mutateFn();
				rebuildElementPtrs();
				notify(null, -1, type);
			},

			methods = {

				watch(watcherFn) {
					if(watcherFn) watcherInfo.set(watcherFn, [watchers.push(watcherFn) - 1, true]);
					return proxy;
				},

				abort(watcherFn) {
					if(watcherFn) {
						const info = watcherInfo.get(watcherFn);
						if(info) { info[1] = false; delete watchers[info[0]]; }
					}
					return proxy;
				},

				at: (index) => getElementPtr(index < 0 ? array.length + index : index),

				swap(indexA, indexB) {
					[array[indexA], array[indexB]] = [array[indexB], array[indexA]];

					const ptrA = elementPtrs.get(indexA), ptrB = elementPtrs.get(indexB);
					if(ptrA) ptrA.$ = array[indexA];
					if(ptrB) ptrB.$ = array[indexB];

					notify(array[indexA], indexA, "swap");
					notify(array[indexB], indexB, "swap");
					return proxy;
				},

				swapOf(valueA, valueB) {
					const indexA = array.indexOf(valueA), indexB = array.indexOf(valueB);
					return (indexA !== -1 && indexB !== -1) ? proxy.swap(indexA, indexB) : proxy;
				},

				set(index, value) {
					const oldValue = array[index];
					array[index] = value;

					const ptr = elementPtrs.get(index);
					if(ptr) ptr.$ = value;
					if(oldValue !== value) notify(value, index, "set");

					return proxy;
				},

				into(transformerFn = $ => $) {
					const derived = ArrayPointer(array.map(transformerFn));

					proxy.on((element, index, type) => {
						const actions = {
							push: () => derived.push(transformerFn(element)),
							pop: () => derived.pop(),
							shift: () => derived.shift(),
							unshift: () => derived.unshift(transformerFn(element)),
							set: () => derived.set(index, transformerFn(element)),
							swap: () => derived.set(index, transformerFn(element)),
							update: () => derived.set(index, transformerFn(element)),
						};
						(actions[type] || (() => { derived.$ = array.map(transformerFn); }))();
					});

					return derived;
				},

				push(...items) {
					const startIndex = array.length;
					const result = array.push(...items);
					items.forEach((item, i) => notify(item, startIndex + i, "push"));
					return result;
				},

				pop() {
					const index = array.length - 1;
					const removed = array.pop();
					elementPtrs.delete(index);
					notify(removed, index, "pop");
					return removed;
				},

				shift() {
					const removed = array.shift();
					rebuildElementPtrs();
					notify(removed, 0, "shift");
					return removed;
				},

				unshift(...items) {
					const result = array.unshift(...items);
					rebuildElementPtrs();
					items.forEach((item, i) => notify(item, i, "unshift"));
					return result;
				},

				splice(start, deleteCount, ...items) {
					const removed = array.splice(start, deleteCount, ...items);
					rebuildElementPtrs();
					notify(removed, start, "splice");
					return removed;
				},

				sort:    (compareFn) => (bulkMutate(() => array.sort(compareFn), "sort"), proxy),
				reverse: ()          => (bulkMutate(() => array.reverse(), "reverse"), proxy),
				map:     (mapFn)     => proxy.into(mapFn),
				filter:  (filterFn)  => ArrayPointer(array.filter(filterFn)),
				indexOf: (value)     => array.indexOf(value),
				forEach: (fn)        => array.forEach(fn),

				find:      (fn) => reactiveQuery(proxy, array, arr => arr.find(fn)),
				findIndex: (fn) => reactiveQuery(proxy, array, arr => arr.findIndex(fn)),
				includes:  (v)  => reactiveQuery(proxy, array, arr => arr.includes(v)),
				reduce:    (fn, init) => reactiveQuery(proxy, array, arr => arr.reduce(fn, init)),
				some:      (fn) => reactiveQuery(proxy, array, arr => arr.some(fn)),
				every:     (fn) => reactiveQuery(proxy, array, arr => arr.every(fn)),
			},

			proxy = new Proxy(array, {

				get(target, prop, receiver) {

					if(prop === ARRAY_PTR_IDENTIFIER) return true;
					if(prop === "constructor") return true;
					if(prop === Symbol.iterator) return target[Symbol.iterator].bind(target);
					if(prop === "$") return [...target];
					if(prop === "length") return target.length;
					if(prop === "on") return methods.watch;

					if(prop in methods) return methods[prop];

					if(typeof prop === "string" && !isNaN(parseInt(prop))) {
						return getElementPtr(parseInt(prop));
					}

					return target[prop];
				},

				set(target, prop, value) {

					if(prop === "$") {
						target.length = 0;
						target.push(...value);
						rebuildElementPtrs();
						notify(null, -1, "replace");
						return true;
					}

					if(typeof prop === "string" && !isNaN(parseInt(prop))) {
						const index = parseInt(prop), oldValue = target[index];
						target[index] = value;

						const ptr = elementPtrs.get(index);
						if(ptr) ptr.$ = value;
						if(oldValue !== value) notify(value, index, "set");

						return true;
					}

					target[prop] = value;
					return true;
				}
			})
		;

		// methods reference proxy, so bind watch alias after proxy creation
		methods.watch = methods.watch.bind(null);

		return proxy;
	}
;

export { ArrayPointer, isArrayPointer };
