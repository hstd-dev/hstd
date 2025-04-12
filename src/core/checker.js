export const

	isConstructedFrom = (object, proto) => object?.constructor === proto,

	isFrozenArray = (arr) => Object.isFrozen(arr) && isConstructedFrom(arr, Array)

;