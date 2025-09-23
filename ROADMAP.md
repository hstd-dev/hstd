# Roadmap

### Table of Contents
#### 🚀 High Priority
+ [**ArrayPointer**](#arraypointer)
+ [**Pointer-based**](#pointer-based rendering)

#### 🚶 Medium Priority
+ [**`$.this`**](#this)
+ [**Pointer.prototype.parent**](#pointerprototypeparent)

#### 🐛 Low Priority
+ [**Suspense**](#suspense)

## ArrayPointer
**Phase: 0 (Draft)**\
**Priority: High**

`ArrayPointer` is an extended edition of `Array`, which is considered as the final lacked piece of HyperStandard.\
It supports legacy `Array` methods, which incldues some original, additional methods like `swap()`, `swapOf()`.

```javascript
import { $, h as html } from "hstd";

const arrayPointer = $(["apple", "banana", "mango"]); // ArrayPointer

const message = arrayPointer.map($ => html`<li>I like ${$}.</li>`); // another new ArrayPointer

arrayPointer.on(($, i) => console.log($, i))

arrayPointer.push("peach"); // [log]: "peach", 4

arrayPointer.swapOf("apple", "mango");
/**
	[log]: "apple", Infinity
	[log]: "mango", 0
	[log]: "apple", 2
*/

arrayPointer[Infinity] // undefined

const frag = html`
	<h1>These are my favourites:</h1>
	<ul>${message}</ul>
`;
/**
	<h1>These are my favourites:</h1>
	<ul>
		<li>I like mango.</li>
		<li>I like banana.</li>
		<li>I like apple.</li>
		<li>I like peach.</li>
	</ul>
*/
```

## `$.this`
**Phase: 0 (Draft)**\
**Priority: Medium**

`$.this` is a special pointer. it makes possible to create `this` referencing before initialization.\
Used for style calculation and so much more.

```javascript
import { $ } from "hstd";

const dynamicInnerWidth = $(innerWidth, {
	from: $ => addEventListener("resize", () => $(innerWidth), { passive: true })
})

const style = $(() => ({
	[css]: $({
		height: $.this.width.up[0].to($ => $ / 2),
		width: $`${dynamicInnerWidth}px`
	})
}))
```

## Pointer.prototype.up
**Phase: 0 (Draft)**\
**Priority: Medium**

```javascript
import { $ } from "hstd";

const parent = $(0);

const child = parent.to($ => $ + 1);

child.up; // parent

const temped = $`${child} + 2 = ${child.to($ => $ + 2)}`;

const parentOfTemped = temped.up // Array
parentOfTemped[0] // child
parentOfTemped[1].parent // child
```

## Suspense
**Phase: 2 (Implemention)**\
**Priority: Low**

Reference implemention of Suspense which completely relys on AsyncGenerator support.
```javascript
import { h as html, Suspense } from "hstd";

const frag = html(
	Suspense({ fallback: html`<label>Loading...</label>` }, SomeAsyncComponent())
)
```

...which is rewritable in 4 lines.

```javascript
export const Suspense = async function*({ fallback }, body) {
	yield* fallback;
	yield* await body;
}
```