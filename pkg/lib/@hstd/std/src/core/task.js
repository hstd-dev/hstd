export const Task = () => {

    let resolve, reject;

	return Object.assign(new Promise((...r) => [resolve, reject] = r), { resolve, reject });
}