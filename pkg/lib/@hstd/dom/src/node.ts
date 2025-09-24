import { resolveFragment, Memo } from "@hstd/core";

const TSA2Node = new WeakMap;

const resolveBody = (value) => {
	resolveFragment(value);
}

const append = function(fragment: any[]): void {

}

const write = append.call.bind(append);

export { append, write }