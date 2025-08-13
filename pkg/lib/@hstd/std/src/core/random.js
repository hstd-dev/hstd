const random = (base = 36) => ((x^=(x^seed)<<13,x^=x>>17,x^=x<<5)*(x<0?-1:1)).toString(base);

let
	seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
	x = 1
;

seed += !(seed % 2);

x = random();

export { random }