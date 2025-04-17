import { createProp } from "./core/prop.js";
import { isPointer } from "./core/pointer.js"
import { createCache } from "./core/cache.js";

const

	formerRegex = /[A-Z]{1}/g,

	lowercaseMatcher = createCache((match) => "-" + match.toLowerCase()),

	formStyleProp = createCache((styleProp) => styleProp.replaceAll(formerRegex, lowercaseMatcher)),

	css = createProp(

		function(styleProp, styleValue, { style: styleDec }) {

			const
				formedStylePropBuf = formStyleProp(styleProp)
			;

			styleDec.setProperty(

				formedStylePropBuf,

				isPointer(styleValue)
					? styleValue.watch($ => styleDec.setProperty(formedStylePropBuf, $)).$
					: styleValue
			)
		},

		prop => "css-" + formStyleProp(prop)

	)
;

export { css }