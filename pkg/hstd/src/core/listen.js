import { cache } from "./cache.js";

const

	targetCache = cache(() => ({}), true),

	/**
	 * @param { string } eventName
	 * @param { Function } callbackFn
	 * @param { HTMLElement } ref
	 * 
	 * @returns { void }
	 */
	listen = cache((eventName) => {

		addEventListener(
			eventName,
			e => targetCache(e.target)[eventName]?.forEach?.(x => x(e)),
			{ passive: true }
		);

		return (callbackFn, ref) => (targetCache(ref)[eventName] ||= []).push(callbackFn);
	})
;

export { listen };