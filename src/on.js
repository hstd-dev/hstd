import { createProp } from "./core/prop.js";
import { listen } from "./core/listen.js";

const

	on = createProp(

		listen,

		prop => "on." + prop

	)

;

export { on, listen }