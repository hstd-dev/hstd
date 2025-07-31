import { createProp } from "./core/prop.js";
import { isPointer } from "./core/pointer.js"
import { cache } from "./core/cache.js";
import { getTracker } from "./core/tracker.js";

let
	isMicrotaskQueued = false,
	cssRuleAssignmentTask = {}
;

const

	formerRegex = /[A-Z]{1}/g,

	lowercaseMatcher = cache((match) => "-" + match.toLowerCase()),

	formStyleProp = cache((styleProp) => styleProp.replaceAll(formerRegex, lowercaseMatcher)),

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
								textContent: Object.entries(cssRuleAssignmentTask).map(([tracker, assignmentTask]) => `[${tracker}]{${assignmentTask}}`).join("")
							}
						));
						isMicrotaskQueued = false;
						cssRuleAssignmentTask = {};
					});
				}

				cssRuleAssignmentTask[tracker] = (cssRuleAssignmentTask[tracker] || "") + `${formedStylePropBuf}:${styleValue};`
			}
		},

		cache(prop => "css-" + formStyleProp(prop))

	)
;

export { css }