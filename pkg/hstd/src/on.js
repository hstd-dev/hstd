import { createProp } from "./core/prop.js";
import { listen } from "./core/listen.js";
import { cache } from "./core/cache.js";

const

	on = createProp(

		listen,

		cache(prop => "on." + prop)

	)

;

export { on, listen }