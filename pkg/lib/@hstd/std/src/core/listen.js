import { Memo } from "./memo.js";

const

	targetCache = Memo(() => ({}), true),

	/**
	 * @param { string } eventName
	 * @param { Function } callbackFn
	 * @param { HTMLElement } ref
	 * 
	 * @returns { void }
	 */
	listen = Memo((eventName) => {

		addEventListener(
			eventName,
			e => targetCache(e.target)[eventName]?.forEach?.(x => x(e)),
			{ passive: true }
		);

		return (callbackFn, ref) => (targetCache(ref)[eventName] ||= []).push(callbackFn);
	})
;

export { listen };