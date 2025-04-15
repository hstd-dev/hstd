/**
 * 
 * @param { (object: (void | object)) => any } setter 
 * @returns { (object: object) => any }
 */

export const createWeakCache = (setter, cacheMap = new WeakMap(), resultBuf) => (object) => (
	cacheMap.has(object)
		? cacheMap.get(object)
		: (cacheMap.set(object, resultBuf = setter(object)), resultBuf)
);