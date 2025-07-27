import { cache } from "./cache.js";
import { random } from "./random.js";

export const getTracker = cache(ref => {

	let tracker;

	while(document.querySelector(`[${tracker = `h${random()}`}]`));

	ref.setAttribute(tracker, "");

	return tracker;

}, !0)