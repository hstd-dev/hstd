import { Cache } from "./cache.js";

const

	targetCache = Cache(() => ({}), true),

	/**
	 * @param { string } eventName
	 * @param { Function } callbackFn
	 * @param { HTMLElement } ref
	 * 
	 * @returns { void }
	 */
	listen = Cache((eventName) => {

		addEventListener(
			eventName,
			e => targetCache(e.target)[eventName]?.forEach?.(x => x(e)),
			{ passive: true }
		);

		return (callbackFn, ref) => (targetCache(ref)[eventName] ||= []).push(callbackFn);
	})
;

export { listen };