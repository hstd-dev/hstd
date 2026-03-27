export const

	isConstructedFrom = (object, proto) => object?.constructor === proto,

	isFrozenArray = (arr) => Object.isFrozen(arr) && isConstructedFrom(arr, Array),

	isAsyncGenerator = (gen) => gen != null && typeof gen[Symbol.asyncIterator] == "function",

	isGenerator = (gen) => gen != null && typeof gen[Symbol.iterator] == "function"

;