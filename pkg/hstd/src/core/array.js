const createSuperArray = (array) => {

	const buffer = Object.fromEntries(array.map((x, i) => {
		const id = Symbol();
		return [id, {
			index: i,
			prev: undefined,
			next: m,
			value: x
		}]
	}));

	return new Proxy([], {
		get(array, prop, superArray) {
			return typeof prop == "number" ? array[0]
			: ""
		}
	})
}