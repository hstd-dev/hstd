import { NOT_FOUND } from "./constant.js";

export const Task = () => {

	let unresolved = true;

	const
		resolvers = [],
		rejectors = [],

		dispatch = (targets, value) => {
			if(unresolved) {
				unresolved = false;
				queueMicrotask(() => unresolved = true);
				targets.forEach(x => x(value));
				resolvers.length = rejectors.length = 0;
			}
		}
	;

	return (result = NOT_FOUND) => (
		result === NOT_FOUND		? new Promise((rs, rj) => { resolvers.push(rs); rejectors.push(rj); })
		: result instanceof Error	? dispatch(rejectors, result)
		:							dispatch(resolvers, result)
	)
};
