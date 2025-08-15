/**
 * @description Memo() stores its setters calculation result.
 * 
 * @param { (object: (void | object)) => any } setter 
 * @returns { (object: object) => any }
 */

export const Memo = (setter, isWeak = false) => {

	const
		map = new (isWeak ? WeakMap : Map),
		get = map.get.bind(map),
		set = map.set.bind(map)
	;

	return (object) => {

		let result = get(object);
   
		return result || (set(object, result = setter(object)), result);
	}
}