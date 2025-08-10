import { Memo } from "./memo.js";
import { Pointer } from "./pointer.js"

/**
 * 
 * @param { (prop: string) => (value: any, ref: HTMLElement) => void } callback 
 * @param { (name: string) => string } nameFn 
 * @returns { object }
 */
export const Prop = (callback, nameFn/**, staticProperties */) => {

	const

		propCache = Memo((prop) => Pointer(callback(prop), undefined, { name: nameFn ? nameFn(prop) : "" })),

		proxy = new Proxy({}, {
			get(_, prop) {
				return (
					prop === Symbol.toPrimitive	? publisher
					: prop === "$"				? publisher()
					:							propCache(prop).publish()
				)
			}
		}),

		bundled = Pointer((value) => Reflect.ownKeys(value).reduce((acc, prop) => (acc[proxy[prop]] = value[prop], acc), {})),

		publisher = bundled.publish.bind(bundled)
	;

	return proxy;

};