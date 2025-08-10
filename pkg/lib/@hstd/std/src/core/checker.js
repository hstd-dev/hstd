export const

	isConstructedFrom = (object, proto) => object?.constructor === proto,

	isFrozenArray = (arr) => Object.isFrozen(arr) && isConstructedFrom(arr, Array),

	isAsyncGenerator = (gen) => typeof gen[Symbol.asyncIterator] == "function",

	isGenerator = (gen) => typeof gen[Symbol.iterator] == "function"

;