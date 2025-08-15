type HSTDFragment = NodeList | Promise<HSTDFragment> | AsyncGenerator<HSTDFragment>

type Pointer = object;

// type $<T> = T & {
// 	on(callback: ($: T) => void): $<T>,
// 	to(callback: ($: T) => )
// }

// 1. $<T> に追加したい独自のメソッドを定義します
interface CustomMethods<T> {
	/**
	 * 現在の内部値をコンソールに出力し、自分自身を返す（チェーン可能）
	 */
	on(): T;

	/**
	 * ラップされているプリミティブ値を取得する
	 */
	get(): T;
}

// 2. Tのメソッドを変換する部分を定義します
// Tのプロパティ(K)を一つずつチェックし、
// もしそのプロパティが「Tを返す関数」であれば、その返り値を「$<T>」に置き換えます。
// そうでなければ、元の型のままにします。
type ChainableMethods<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => T
    ? (...args: Parameters<T[K]>) => $<T>
    : T[K];
};

// 3. プリミティブ型に制約をかけ、上記2つを結合して最終的な $<T> 型を定義します
type $<T extends string | number | boolean> = ChainableMethods<T> & CustomMethods<T>;

declare module "hstd" {
    // Types inside here
    export function h(a: TemplateStringsArray, ...b: ($<string | number | boolean> | string | HSTDFragment)[]): string;

	export function $(value: string | number | boolean): $<T>
}