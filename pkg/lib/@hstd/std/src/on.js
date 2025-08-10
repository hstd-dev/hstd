import { Memo } from "./core/memo.js";
import { Prop } from "./core/prop.js";

import { listen } from "./core/listen.js";

const

	on = Prop(

		listen,

		Memo(prop => "on." + prop)

	)

;

export { on, listen }