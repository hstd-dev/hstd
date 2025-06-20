import { createCache } from "./cache.js";
import { random } from "./random.js";

export const getTracker = createCache(ref => {

	let tracker;

	while(document.querySelector(`[${tracker = `h${random()}`}]`));

	ref.setAttribute(tracker, "");

	return tracker;

}, true)