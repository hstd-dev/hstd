![HyperStandard Main Image](./docs/resources/hstd-readme-header.svg)
<h1 align="center"><a href="https://hstd.io">H</a>yperStandard</h3>
<h4 align="center">Fast. Interactive. Web Interface.</h4>
<br>

<div align="center">
  <a href="https://stackblitz.com/edit/vitejs-vite-vcga6uwx?file=main.js"><img src="https://developer.stackblitz.com/img/open_in_stackblitz_small.svg" alt="Open in StackBlitz"></a>
  <a href="https://www.npmjs.com/package/hstd"><img src="https://img.shields.io/npm/v/hstd?logo=npm&color=%23CC3534" alt="NPM version"></a>
  <a href="https://bundlephobia.com/package/hstd"><img src="https://img.shields.io/bundlejs/size/hstd?logo=stackblitz" alt="NPM package minimized gzipped size"></a>
</div>

---

```javascript
import { $, h as html, on } from "hstd"


const Component = () => {

    const count = $(0);

    return html`
        <h1>Count is ${count}</h1>
        <button ${{ [on.click]: () => count.$++ }}>
            Add more!
        </button>
    `;
}


document.body[html] = Component();
```

**hstd** = HyperStandard is a minimal JavaScript library to build fast, interactive, extensible web interface.
Visit live [demo](https://stackblitz.com/edit/web-platform-wikgugv3?devToolsHeight=33&file=src%2FApp.js).

---
- **[Install](#install)**
    + [NPM](#npm)
    + [HTTP](#http)
    + [ImportMap](#importmap)

- **[Examples](#examples)**
    + [Class-model](#class-model)
    + [Interactive Binding](#interactive-binding)
    + [Post-processing](#post-processing)
    + [Works with Async Iterator](#works-with-async-iterator)
    + [Reactive Arrays](#reactive-arrays)
    + [Template Literal Pointer](#template-literal-pointer)
    + [Property Bundle Reference](#property-bundle-reference)
    + [Derived Pointers](#derived-pointers)

- **[Packages](#packages)**
    + [**```hstd```**](./pkg/hstd)
    + [**```@hstd/wc```**](./pkg/wc)
- **[License](#license)**

---

## Install

### NPM
```sh
npm i hstd
```

### HTTP
```javascript
import { $, h as html } from "https://hstd.io";
```

### ImportMap
```json
{
    "imports": {
        "hstd": "https://hstd.io"
    }
}
```

## Examples

### Class-model
```javascript
import { $, h as html, on, css } from "hstd"

const buttonClass = $((alertText) => ({
    [css]: {
        color: "white",
        backgroundColor: "blue",
    },
    [on.click]: () => alert(alertText)
}))

const Main = () => {

    const count = $(0);

    return html`
        <button ${{ [on.click]: () => count.$++, [buttonClass]: "hi" }}>
            I'm styled ${count}!
        </button>
    `
}
```

### Interactive binding
```javascript
import { $, h as html, io } from "hstd"

const Linked = () => {

    const valueHolder = $(0)

    return html`
        <h1>these are linked!</h1>
        <input ${{ [io.value]: valueHolder, type: "range" }}>
        <input ${{ [io.value]: valueHolder, type: "range" }}>
        <label>value is ${valueHolder}</label>
    `
}
```

### Post-processing
```javascript
const Canvas = () => {

    const colorSwitch = $(true);

    return html`
        <canvas ${{ id: "color", [on.click]: () => colorSwitch.switch() }}></canvas>

    `.on(({ color }) => {

        const ctx = color.getContext("2d");
        colorSwitch.into($ => $ ? "red" : "blue").watch($ => {
            ctx.fillStyle = $;
            ctx.fillRect(0, 0, 100, 100);
        });
    })
}
```

### Works with Async Iterator
```javascript
import { $, h as html, io } from "hstd";


const Iterated = async function*() {

    const
        user = $(''),
        { promise, resolve } = Promise.withResolvers()
    ;

    yield html`
        <label>Show user <input ${{ [io.value]: user }}/></label>
        <button ${{ [on.click]: resolve }}>submit</button>
    `;

    await promise;

    yield html`
        <label>Loading...</label>
    `;

    const { name, age, link } = await fetch(`/api/user/${user.$}`).then(res => res.json());

    yield html`
        <div>
            <label>${name}</label>
            <label>${age}</label>
            <label>${link}</label>
        </div>
    `;

}


document.body[html] = Iterated();
```

### Reactive Arrays
```javascript
import { $, h as html, on } from "hstd"

const TodoApp = () => {

    const todos = $(["Buy milk", "Walk dog"]);
    const input = $('');

    return html`
        <ul>${todos.into(item => html`<li>${item}</li>`)}</ul>
        <input ${{ [io.value]: input }}>
        <button ${{ [on.click]: () => { todos.push(input.$); input.$ = ''; } }}>
            Add
        </button>
    `
}
```

`$([...])` creates an ArrayPointer that tracks mutations (`push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `swap`, `set`) and updates the DOM automatically. Derived queries like `find`, `includes`, `some`, `every`, `reduce` return reactive Pointers.

### Template Literal Pointer
```javascript
import { $, h as html, css } from "hstd"

const Animated = () => {

    const rotation = $(0);
    const scale = $(1);
    const transform = $`rotate(${rotation}deg) scale(${scale})`;

    return html`
        <div ${{ [css.transform]: transform }}>Hello</div>
    `
}
```

`` $`...` `` creates a Pointer that interpolates reactive values into a string. When any interpolated Pointer changes, the string updates automatically.

### Property Bundle Reference
```javascript
import { $, h as html, css } from "hstd"

const Themed = () => {

    const primary = $("royalblue");

    return html`
        <div ${{
            [css]: {
                backgroundColor: primary,
                color: $.this.backgroundColor,
                borderColor: $.this.color,
                border: "2px solid",
            }
        }}>
            color follows backgroundColor
        </div>
    `
}
```

`$.this.propertyName` creates a DeferredPointer that references another property within the same attribute object. The reference is resolved at render time.

### Derived Pointers
```javascript
import { $, h as html, on } from "hstd"

const Dashboard = () => {

    const query = $('');

    // Debounce input by 300ms
    const debounced = query.timeout(300);

    // Derive display text
    const status = debounced.isit(
        debounced.into(q => `Searching: ${q}`),
        "Type to search"
    );

    return html`
        <input ${{ [io.value]: query, placeholder: "Search..." }}>
        <p>${status}</p>
    `
}
```

Pointers support chained derivations: `.into(fn)`, `.not()`, `.bool()`, `.isit(ifTrue, ifFalse)`, `.timeout(ms)`, `.until(value)`, `.sum(n)`, `.sub(n)`, `.mul(n)`, `.div(n)`, `.mod(n)`, `.is(v)`, `.seq(v)`, `.or(v)`, `.and(v)`.

## Packages

### [```hstd```](./pkg/lib/hstd)
HyperStandard's fundamental core library.
### [```@hstd/wc```](./pkg/lib/@hstd/wc)
HyperStandard-to-WebComponents adapter.
### [```@hstd/ts```](./pkg/lib/@hstd/ts)
TypeScript language service plugin that adds IntelliSense for HyperStandard templates.

## License

hstd is [MIT licensed](LICENSE).
