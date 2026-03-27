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

			if(!isPointer(styleValue) && typeof styleValue !== "string" && typeof styleValue !== "number") {
				throw new Error(
					`[hstd] css.${styleProp} requires a string, number, or Pointer value, ` +
					`but received ${typeof styleValue}`
				);
			}

			const styleDec = ref.style,
				tracker = getTracker(ref),
				formed = formStyleProp(styleProp);

			if(isPointer(styleValue)) {

				styleDec.setProperty(
					formed,
					styleValue.watch($ => styleDec.setProperty(formed, $)).$
				)

			} else {

				if(!isMicrotaskQueued) {
					isMicrotaskQueued = true;
					queueMicrotask(() => {
						document.head.append(Object.assign(
							document.createElement("style"),
							{
								textContent: Object.entries(cssRuleAssignmentTask)
									.map(([tracker, task]) => `[${tracker}]{${task}}`)
									.join("")
							}
						));
						isMicrotaskQueued = false;
						cssRuleAssignmentTask = {};
					});
				}

				cssRuleAssignmentTask[tracker] = (cssRuleAssignmentTask[tracker] || "") + `${formed}:${styleValue};`;
			}
		},

		Memo(prop => "css-" + formStyleProp(prop))
	)
;

export { css }
