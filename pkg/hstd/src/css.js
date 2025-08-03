import { Prop } from "./core/prop.js";
import { isPointer } from "./core/pointer.js"
import { Memo } from "./core/memo.js";
import { getTracker } from "./core/tracker.js";

let
	isMicrotaskQueued = false,
	cssRuleAssignmentTask = {}
;

const

	formerRegex = /[A-Z]{1}/g,

	lowercaseMatcher = Memo((match) => "-" + match.toLowerCase()),

	formStyleProp = Memo((styleProp) => styleProp.replaceAll(formerRegex, lowercaseMatcher)),

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

		Memo(prop => "css-" + formStyleProp(prop))

	)
;

export { css }