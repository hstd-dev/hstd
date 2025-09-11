# Roadmap

## `$.this`

`$.this` is special pointer.

```javascript
import { $ } from "hstd";

const dynamicInnerWidth = $(innerWidth, {
	from: $ => addEventListener("resize", () => $(innerWidth), { passive: true })
})

const style = $(() => ({
	[css]: $({
		width: dynamicInnerWidth,
		height: $.this.width.to($ => $ / 2)
	})
}))
```

## ArrayPointer

`ArrayPointer` is an extended edition of `Array`. It supports legacy `Array` methods, which incldues some original, additional methods like `swap()`, `swapOf()`.

```javascript
import { $, h as html } from "hstd";

const arrayPointer = $(["apple", "banana", "mango"]); // ArrayPointer

const message = arrayPointer.map($ => html`<li>I like ${$}.</li>`); // another new ArrayPointer

arrayPointer.push("peach");

arrayPointer.swapOf("apple", "mango");

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