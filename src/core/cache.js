export const createCache = (setter) => {

	const cacheMap = new WeakMap();
	let resultBuf;

	return (template) => (cacheMap.has(template)
		? cacheMap.get(template)
		: (cacheMap.set(template, resultBuf = setter(template)), resultBuf)
	);

}