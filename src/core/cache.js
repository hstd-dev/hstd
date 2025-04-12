export const createCache = (setter) => {

	const cacheMap = new WeakMap();

	return (template) => {

		let resultBuf = cacheMap.get(template);

		if(!resultBuf) cacheMap.set(template, resultBuf = setter(template));

		return resultBuf;

	}

}