# Roadmap

### Index
+ [**`$.this`**](#this)
+ [**Pointer.prototype.parent**](#pointerprototypeparent)
+ [**ArrayPointer**](#arraypointer)

## `$.this`
#### Phase: 0 (Draft)

`$.this` is a special pointer. it makes possible to create `this` referencing before initialization.\
Used for style calculation and so much more.

```javascript
import { $ } from "hstd";

const dynamicInnerWidth = $(innerWidth, {
	from: $ => addEventListener("resize", () => $(innerWidth), { passive: true })
})

const style = $(() => ({
	[css]: $({
		height: $.this.width.to($ => $ / 2),
		width: dynamicInnerWidth
	})
}))
```

## Pointer.prototype.up()
#### Phase: 0 (Draft)

```javascript
import { $ } from "hstd";

const parent = $(0);

const child = parent.to($ => $ + 1);

child.up(); // parent

const grandchild = child.to($ => $ * 2);

grandchild.up(); // child
grandchild.up(Infinity); // parent
```

## ArrayPointer
#### Phase: 0 (Draft)

`ArrayPointer` is an extended edition of `Array`. It supports legacy `Array` methods, which incldues some original, additional methods like `swap()`, `swapOf()`.

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