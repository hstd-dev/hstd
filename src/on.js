import { prop } from "./core/prop.js";
import { listen } from "./core/listen.js";

const

	on = prop(

		listen,

		prop => "on." + prop

	)

;

export { on, listen }