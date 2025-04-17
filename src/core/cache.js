/**
 * 
 * @param { (object: (void | object)) => any } setter 
 * @returns { (object: object) => any }
 */

export const createCache = (setter) => {

	const 
		cacheWeakMap = new WeakMap(),
		cacheMap = new Map()
	;

	return (object) => {

		const
			map = "function\0object".includes(typeof object) ? cacheWeakMap : cacheMap
		;

		let result;

		return map.has(object)
			? map.get(object)
			: (map.set(object, result = setter(object)), result)
		;
	}
}