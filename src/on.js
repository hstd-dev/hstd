import { createProp } from "./core/prop.js";
import { listen } from "./core/listen.js";
import { createCache } from "./core/cache.js";

const

	on = createProp(

		listen,

		createCache(prop => "on." + prop)

	)

;

export { on, listen }