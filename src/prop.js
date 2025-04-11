import { createPtr } from "./$.js"

/**
 * 
 * @param { (prop: string, value: any, ref: HTMLElement) => void } callback 
 * @param { (name: string) => string } nameFn 
 * @returns { object }
 */
export const prop = (callback, nameFn) => {

	const
		cache = {},

		proxy = new Proxy({}, {
			get(_, prop) {
				return (
					prop === Symbol.toPrimitive	? publisher
					: prop === "$"				? publisher()
					:							(cache[prop] ||= createPtr(callback.bind(null, prop), undefined, { name: nameFn ? nameFn(prop) : "" })).publish()
				)
			}
		}),

		bundled = createPtr((value) => {

			const buf = {};

			Object.keys(value).forEach((prop) => buf[proxy[prop]] = value[prop]);

			return buf;

		}),

		publisher = () => bundled.publish()
	;

	return proxy;

};