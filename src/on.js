import { listen } from "./core/listen.js";
import { prop } from "./core/prop.js";

const

	on = prop(

		listen,

		prop => "on." + prop

	)

;

export { on }