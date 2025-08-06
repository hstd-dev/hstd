import { Memo } from "./memo.js";
import { random } from "./random.js";

export const getTracker = Memo(ref => {

	let tracker;

	while(document.querySelector(`[${tracker = `h${random()}`}]`));

	ref.setAttribute(tracker, "");

	return tracker;

}, !0)