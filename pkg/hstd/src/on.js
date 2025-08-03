import { Prop } from "./core/prop.js";
import { listen } from "./core/listen.js";
import { Cache } from "./core/cache.js";

const

	on = Prop(

		listen,

		Cache(prop => "on." + prop)

	)

;

export { on, listen }