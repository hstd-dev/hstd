![HyperStandard Main Image](./docs/resources/hstd-readme-header.svg)
<h1 align="center"><a href="https://hstd.io">H</a>yperStandard</h3>
<h4 align="center">Fast. Interactive. Web Interface.</h4>
<br>

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/edit/vitejs-vite-vcga6uwx?file=main.js)
[![NPM Version](https://img.shields.io/npm/v/hstd?logo=npm&color=%23CC3534)](https://www.npmjs.com/package/hstd)
[![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/hstd?logo=stackblitz)](https://bundlephobia.com/package/hstd)
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

## License

hstd is [MIT licensed](LICENSE).
