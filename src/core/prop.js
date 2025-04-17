import { createPointer } from "./pointer.js"

/**
 * 
 * @param { (prop: string, value: any, ref: HTMLElement) => void } callback 
 * @param { (name: string) => string } nameFn 
 * @returns { object }
 */
export const createProp = (callback, nameFn/**, staticProperties */) => {

	const

		cache = {},

		proxy = new Proxy({}, {
			get(_, prop) {
				return (
					prop === Symbol.toPrimitive	? publisher
					: prop === "$"				? publisher()
					:							/** staticProperties[prop] || */(cache[prop] ||= createPointer(callback.bind(null, prop), undefined, { name: nameFn ? nameFn(prop) : "" })).publish()
				)
			}
		}),

		bundled = createPointer((value) => {

			const buf = {};

			Reflect.ownKeys(value).forEach((prop) => buf[proxy[prop]] = value[prop]);

			return buf;

		}),

		publisher = () => bundled.publish()
	;

	return proxy;

};