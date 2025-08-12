export class Task {
	constructor() {
		let resolveBuf, rejectBuf;
		return Object.assign(new Promise((resolve, reject) => {
			resolveBuf = resolve;
			rejectBuf = reject
		}), {
			resolve: resolveBuf, rejectBuf: rejectBuf
		});
	}
}