const fragmentMap = {};

export const registerFragment = (fragment: any[], templateStringsArray: TemplateStringsArray) => {
	const key = Symbol();
	// fragmentMap[key] = []
};

export const resolveFragment = fragmentMap.get.bind(fragmentMap);