import { Pointer, Memo } from "hstd";

const NOT_FOUND = Symbol('NOT_FOUND');

const performOp = (mode, callback) => new Promise((resolve, reject) => {
	const request = indexedDB.open('hstd-db', 1);

	request.onupgradeneeded = (event) => {
		event.target.result.createObjectStore('0');
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
	let init = true;
	let changeBuf = NOT_FOUND;
	const pointer = Pointer().watch($ => {
		if(changeBuf === NOT_FOUND) {
			queueMicrotask(() => (set(key, changeBuf), changeBuf = NOT_FOUND));
		}
		changeBuf = $;
	});
	return async (value, setter, options) => {
		if(init && )
	};
})

export const $$ = new Proxy({}, {
	get: (_, key) => dbMemo(key)
});

const count = await $$.count(0);