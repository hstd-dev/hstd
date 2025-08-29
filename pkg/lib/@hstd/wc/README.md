# @hstd/wc
Hstd to WebComponents Adapter.

## Usage
```javascript
import { h as html } from "hstd";
import { define } from "@hstd/wc";

function MyComponent({ name, age, fruit }) {
    return html`
        <h1>My name is ${name} , I ${age.into($ => $ >= 16 ? 'can' : 'can\'t')} drive, and ${fruit} is my trend!</h1>
    `;
}

define({
    "my-component": [{ name: String, age: Number, fruit: String }, MyComponent]
});
```

```html
<my-component name="Josh" age="9" fruit="orange">
    <!-- #shadow-root -->
    <h1>My name is Josh, I can't drive, and orange is my trend!</h1>
</my-component>
```
If you change attributes manually, then the value changes automatically(attributes are transferred as a pointer!).

## Install
```bash
npm i @hstd/wc
```
