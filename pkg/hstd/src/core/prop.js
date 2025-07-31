import { cache } from "./cache.js";
import { createPointer } from "./pointer.js"

/**
 * 
 * @param { (prop: string) => (value: any, ref: HTMLElement) => void } callback 
 * @param { (name: string) => string } nameFn 
 * @returns { object }
 */
export const createProp = (callback, nameFn/**, staticProperties */) => {

	const

		propCache = cache((prop) => createPointer(callback(prop), undefined, { name: nameFn ? nameFn(prop) : "" })),

		proxy = new Proxy({}, {
			get(_, prop) {
				return (
					prop === Symbol.toPrimitive	? publisher
					: prop === "$"				? publisher()
					:							propCache(prop).publish()
				)
			}
		}),

		bundled = createPointer((value) => Reflect.ownKeys(value).reduce((acc, prop) => (acc[proxy[prop]] = value[prop], acc), {})),

		publisher = bundled.publish.bind(bundled)
	;

	return proxy;

};