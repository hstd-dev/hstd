import { Prop } from "./core/prop.js";
import { isPointer } from "./core/pointer.js"
import { Cache } from "./core/cache.js";
import { getTracker } from "./core/tracker.js";

let
	isMicrotaskQueued = false,
	cssRuleAssignmentTask = {}
;

const

	formerRegex = /[A-Z]{1}/g,

	lowercaseMatcher = Cache((match) => "-" + match.toLowerCase()),

	formStyleProp = Cache((styleProp) => styleProp.replaceAll(formerRegex, lowercaseMatcher)),

	css = Prop(

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

		Cache(prop => "css-" + formStyleProp(prop))

	)
;

export { css }