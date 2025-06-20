import { createProp } from "./core/prop.js";
import { isPointer } from "./core/pointer.js"
import { createCache } from "./core/cache.js";
import { getTracker } from "./core/tracker.js";

let
	isMicrotaskQueued = false,
	cssRuleAssignmentTask = {}
;

const

	styleElement = document.createElement("style"),

	formerRegex = /[A-Z]{1}/g,

	lowercaseMatcher = createCache((match) => "-" + match.toLowerCase()),

	formStyleProp = createCache((styleProp) => styleProp.replaceAll(formerRegex, lowercaseMatcher)),

	css = createProp(

		(styleProp) => (styleValue, ref) => {

			const
				styleDec = ref.style,
				tracker = getTracker(ref),
				formedStylePropBuf = formStyleProp(styleProp)
			;

			if(isPointer(styleValue)) {

				styleDec.setProperty(
					formedStylePropBuf,
					styleValue.watch($ => styleDec.setProperty(formedStylePropBuf, $)).$
				)

			} else {

				if(!isMicrotaskQueued) {
					isMicrotaskQueued = true;
					queueMicrotask(() => {
						document.head.append(Object.assign(
							document.createElement("style"),
							{
								textContent: Object.entries(cssRuleAssignmentTask).map(([tracker, assignmentTask]) => `[${tracker}]{${assignmentTask.join("")}}`).join("")
							}
						));
						isMicrotaskQueued = false;
						cssRuleAssignmentTask = {};
					});
				}

				(cssRuleAssignmentTask[tracker] ||= []).push(`${formedStylePropBuf}:${styleValue};`)
			}


			// styleDec.setProperty(

			// 	formedStylePropBuf,

			// 	isPointer(styleValue)
			// 		? styleValue.watch($ => styleDec.setProperty(formedStylePropBuf, $)).$
			// 		: styleValue
			// )
		},

		createCache(prop => "css-" + formStyleProp(prop))

	)
;

export { css }