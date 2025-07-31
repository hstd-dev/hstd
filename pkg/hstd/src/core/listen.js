import { cache } from "./cache.js";

let registeredEvent = "\0";

const

	targetCache = cache(() => ({}), !0),

	/**
	 * @param { string } eventName
	 * @param { Function } callbackFn
	 * @param { HTMLElement } ref
	 * 
	 * @returns { void }
	 */
	listen = (eventName) => (callbackFn, ref) => {

		if(!registeredEvent.includes(`\0${eventName}\0`)) {

			globalThis.addEventListener(
				eventName,
				e => targetCache(e.target)[eventName]?.forEach?.(x => x(e)),
				{ passive: !0 }
			);

			registeredEvent += eventName + "\0";

		};

		(targetCache(ref)[eventName] ||= []).push(callbackFn);

	}
;

export { listen };