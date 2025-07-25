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


function Component() {

    const count = $(0);

    return html`
        <h1>Count is ${count}</h1>
        <button ${{ [on.click]: () => count.$++ }}>
            Add more!
        </button>
    `;
}


document.body.append(...Component());
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
    + [Interactive Binding](#Interactive-binding)
    + [Post-processing](#post-processing)
    + [Works with Async Iterator](#works-with-async-iterator)

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

function Main() {

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
function Linked() {

    const valueHolder = $(0)

    return html`
        <h1>these are linked!</h1>
        <input ${{ value: valueHolder, type: "range" }}>
        <input ${{ value: valueHolder, type: "range" }}>
        <label>value is ${valueHolder}</label>
    `
}
```

### Post-processing
```javascript
function Canvas() {

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
async function* Delayed() {

    const
        loadingDots = $(0, $ => $ % 3),
        loadingDotsInterval = setInterval(() => loadingDots.$++, 700)
    ;

    yield html`
        <span>Loading${$`.`.repeat(loadingDots.into($ => $ + 1))}</span>
    `;
    
    const { name, age, link } = await fetch("/api/user/ihasq").then(res => res.json());

    clearInterval(loadingDotsInterval);

    yield html`
        <div>
            <label>${name}</label>
            <label>${age}</label>
            <label>${link}</label>
        </div>
    `;

}
```

## License

hstd is [MIT licensed](LICENSE).
