import { Pointer, Memo } from "hstd";

export const NOT_FOUND = Symbol('NOT_FOUND');

const performOp = (mode, callback) => new Promise((resolve, reject) => {
	const request = indexedDB.open('kv', 1);

	request.onupgradeneeded = (event) => {
		event.target.result.createObjectStore('s');
	};

	request.onerror = () => reject(request.error);

	request.onsuccess = () => {
		try {
			const store = request.result.transaction('s', mode).objectStore('s');
			const opRequest = callback(store);

			opRequest.onsuccess = () => resolve(opRequest.result);
			opRequest.onerror = () => reject(opRequest.error);
		} catch (err) {
			reject(err);
		}
	};
});


export const get = (key) =>
	performOp('readonly', (store) => store.get(key))
		.then((value) => (value === undefined ? NOT_FOUND : value));

export const set = (key, value) =>
	performOp('readwrite', (store) => store.put(value, key));

const dbMemo = Memo((key) => {
	const pointer = Pointer();
	pointer.watch($ => set(key, $))
	return (init) => {

	};
})

export const $$ = new Proxy({}, {
	get: (_, key) => (init) => dbMemo(key)(init)
})