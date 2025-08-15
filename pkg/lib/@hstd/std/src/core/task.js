import { NOT_FOUND } from "./constant.js";

export const Task = () => {

	let unresolved = true;

	const
		res = [],
		rej = [],

		resrejFn = (isResolve, value) => {
			if(unresolved) {
				unresolved = false;
				queueMicrotask(() => unresolved = true);
				(isResolve ? res : rej).forEach(x => x(value));
				res.length = rej.length = 0;
			}
		},

		resolve = resrejFn.bind(null, true),
		reject = resrejFn.bind(null, false)
	;

	return (result = NOT_FOUND) => (

		result === NOT_FOUND		? new Promise((rs, rj) => { res.push(rs); rej.push(rj); })
		: result instanceof Error	? reject(result)
		:							resolve(result)
	)
};