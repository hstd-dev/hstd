/**
 * @description createCache() stores its setters calculation result.
 * 
 * @param { (object: (void | object)) => any } setter 
 * @returns { (object: object) => any }
 */

export const createCache = (setter, isWeak = false) => {

	const map = new (isWeak ? WeakMap : Map);

	return (object) => {

		let result;
   
		return map.has(object)
			? map.get(object)
			: (map.set(object, result = setter(object)), result)
		;
	}

}