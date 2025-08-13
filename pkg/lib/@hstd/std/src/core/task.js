import { NOT_FOUND } from "./constant.js";
import { getPrototype } from "./prototype.js";

export const Task = () => {

	let index = 0, unresolved = true;

	const
		res = [],
		rej = [],
		resrejFn = (isResolve, value) => {
			if(unresolved) {
				unresolved = false;
				queueMicrotask(() => unresolved = true);
				(isResolve ? res : rej)[index](value);
				res[index] = rej[index++] = undefined;
			}
		},
		resolve = resrejFn.bind(null, true),
		reject = resrejFn.bind(null, false)
	;

	return (result = NOT_FOUND) => (

		result === NOT_FOUND		? new Promise((rs, rj) => { resrej[1].push(rs); resrej[0].push(rj); })
		: result instanceof Error	? reject(result)
		:							resolve(result)

	)
}