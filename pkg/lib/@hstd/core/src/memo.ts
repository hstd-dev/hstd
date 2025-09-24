export const createMemo = (callback: (keyObject: any) => any, isWeak: boolean) => {

	const
		m = new (isWeak ? WeakMap : Map),
		g = m.get.bind(m),
		s = m.set.bind(m)
	;

	return (keyObject: any) => {
		let buf;
		return g(keyObject) || (s(keyObject, buf = callback(keyObject)), buf)
	}
}