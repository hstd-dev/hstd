const x = Object
	.getOwnPropertyNames(Array.prototype)
	.reduce((acc, v) => {

		if(!{}[v]) {
			
			const fn = [][v];
	
			if(typeof fn == "function") acc[fn.name] = fn;
	
		};

		return acc;

	}, {})
;

const original = {
	swap(a, b) {

		const
			x = this,
			u = x[a]
		;

		x[a] = x[b];
		x[b] = u;

		return x;

	},

	swapOf(a, b) {

		const
			x = this,
			indexOf = x.indexOf.bind(x)
		;

		return x.swap(indexOf(a), indexOf(b));
	}
}


Object.keys(original).