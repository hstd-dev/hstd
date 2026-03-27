import { Memo } from "./memo.js";

const

	targetCache = Memo(() => ({}), true),

	listen = Memo((eventName) => {

		addEventListener(
			eventName,
			e => targetCache(e.target)[eventName]?.forEach?.(x => x(e)),
			{ passive: true }
		);

		return (callbackFn, ref) => {

			if(typeof callbackFn !== "function") {
				throw new Error(
					`[hstd] on.${eventName} requires a function handler, but received ${typeof callbackFn}`
				);
			}

			(targetCache(ref)[eventName] ||= []).push(callbackFn);
		};
	})
;

export { listen };
