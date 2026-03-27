import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { resetDOM } from './setup.js';

import { Pointer, isPointer } from '../pkg/lib/@hstd/std/src/core/pointer.js';
import { h } from '../pkg/lib/@hstd/std/src/h.js';
import { on } from '../pkg/lib/@hstd/std/src/on.js';
import { css } from '../pkg/lib/@hstd/std/src/css.js';
import { io } from '../pkg/lib/@hstd/std/src/io.js';

const { $ } = await import('../pkg/lib/@hstd/std/src/$.js');

// ============================================================================
// Reproduce the site page structure in jsdom to verify no runtime errors
// ============================================================================

const color = {
  bg: "#02030f", surface: "#0a0b1a", card: "#111226",
  border: "#1e1f3a", text: "#e8e9f0", muted: "#8b8ca8",
  accent: "#6c7aff", accentAlt: "#9b6cff", white: "#f3f4ff",
};

const font = {
  sans: "'Inter Tight', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
};

describe('Project Page — DOM Structure', () => {

  beforeEach(() => { resetDOM(); });

  it('should render Hero section without errors', () => {
    const width = $(1024);
    const isMobile = width.into(w => w < 768);
    const logoWidth = width.into(w => Math.min(w * 0.3, 140));

    const frag = h`<header ${{
      [css.display]: $('flex'),
      [css.flexDirection]: $('column'),
      [css.alignItems]: $('center'),
    }}>
      <img ${{ src: "./resources/hstd.svg", alt: "logo" }}>
      <h1>HyperStandard</h1>
      <p>Fast. Interactive. Web Interface.</p>
      <div>
        <a ${{ href: "#" }}>Get Started</a>
        <a ${{ href: "#" }}>npm i hstd</a>
      </div>
    </header>`;

    document.body.append(...frag);
    assert.ok(document.body.querySelector('header'));
    assert.ok(document.body.querySelector('h1'));
    assert.strictEqual(document.body.querySelector('h1').textContent, 'HyperStandard');
    assert.strictEqual(document.body.querySelectorAll('a').length, 2);
  });

  it('should render Code block without errors', () => {
    const copied = $(false);
    const label = copied.isit("Copied!", "Copy");

    const frag = h`<div>
      <button ${{ [on.click]: () => copied.$ = true }}>${label}</button>
      <pre>${"const x = $(0);"}</pre>
    </div>`;

    document.body.append(...frag);
    assert.ok(document.body.querySelector('pre'));
    assert.ok(document.body.querySelector('button'));
    assert.strictEqual(document.body.querySelector('pre').textContent, 'const x = $(0);');
  });

  it('should render Feature cards grid without errors', () => {
    const isMobile = $(false);
    const cols = isMobile.isit("1fr", "1fr 1fr");

    const frag = h`<section>
      <h2>Features</h2>
      <div ${{ [css.display]: $('grid'), [css.gridTemplateColumns]: cols }}>
        <div><h3>Reactive</h3><p>Fine-grained reactivity</p></div>
        <div><h3>Templates</h3><p>Tagged template literals</p></div>
        <div><h3>Bindings</h3><p>CSS, events, IO</p></div>
        <div><h3>Async</h3><p>Async generators</p></div>
      </div>
    </section>`;

    document.body.append(...frag);
    assert.strictEqual(document.body.querySelectorAll('h3').length, 4);
  });

  it('should render Counter demo without errors', () => {
    const count = $(0);
    const doubled = count.mul(2);
    const label = count.into(n =>
      n === 0 ? "not yet" : n === 1 ? "1 time" : n + " times"
    );

    const frag = h`<div>
      <p>${label} (doubled: ${doubled})</p>
      <button ${{ [on.click]: () => count.$++ }}>Increment</button>
      <button ${{ [on.click]: () => count.$ = 0 }}>Reset</button>
    </div>`;

    document.body.append(...frag);

    // Verify initial state
    assert.ok(document.body.textContent.includes('not yet'));
    assert.ok(document.body.textContent.includes('0'));

    // Click increment
    document.body.querySelectorAll('button')[0].dispatchEvent(new Event('click', { bubbles: true }));
    assert.ok(document.body.textContent.includes('1 time'));
    assert.ok(document.body.textContent.includes('2'));

    // Click again
    document.body.querySelectorAll('button')[0].dispatchEvent(new Event('click', { bubbles: true }));
    assert.ok(document.body.textContent.includes('2 times'));
    assert.ok(document.body.textContent.includes('4'));

    // Reset
    document.body.querySelectorAll('button')[1].dispatchEvent(new Event('click', { bubbles: true }));
    assert.ok(document.body.textContent.includes('not yet'));
  });

  it('should render Binding demo without errors', () => {
    const text = $("");
    const len = text.into(t => t.length);
    const display = text.isit(text, $("Type something..."));

    const frag = h`<div>
      <input ${{ [io.value]: text, type: "text" }}>
      <p>Mirror: ${display}</p>
      <p>Length: ${len}</p>
    </div>`;

    document.body.append(...frag);
    assert.ok(document.body.querySelector('input'));
    assert.ok(document.body.textContent.includes('Type something...'));
    assert.ok(document.body.textContent.includes('0'));

    // Simulate input
    const input = document.body.querySelector('input');
    input.value = 'hello';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    assert.ok(document.body.textContent.includes('hello'));
    assert.ok(document.body.textContent.includes('5'));
  });

  it('should render Color demo without errors', () => {
    const hue = $(220);
    const bg = hue.into(h => `hsl(${h}, 70%, 55%)`);

    const frag = h`<div>
      <div ${{ [css.backgroundColor]: bg }}></div>
      <input ${{ [io.value]: hue, type: "range", min: "0", max: "360" }}>
      <p>${bg}</p>
    </div>`;

    document.body.append(...frag);
    assert.ok(document.body.textContent.includes('hsl(220, 70%, 55%)'));

    // Change slider
    const slider = document.body.querySelector('input');
    slider.value = '120';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    assert.ok(document.body.textContent.includes('hsl(120, 70%, 55%)'));
  });

  it('should render API table without errors', () => {
    const isMobile = $(false);

    const rows = [
      ["$(value)", "Create a reactive Pointer"],
      ["html`<tag>...</tag>`", "Create DOM fragment"],
      ["[on.event]: fn", "Bind DOM event handler"],
    ];

    const frag = h`<section>
      <h2>API at a Glance</h2>
      <div>
        ${rows.map(([api, desc]) => h`<div>
          <code>${api}</code>
          <span>${desc}</span>
        </div>`)}
      </div>
    </section>`;

    document.body.append(...frag);
    assert.strictEqual(document.body.querySelectorAll('code').length, 3);
  });

  it('should render Ecosystem cards without errors', () => {
    const packages = [
      ["hstd", "Core library"],
      ["@hstd/ts", "TypeScript LSP plugin"],
      ["@hstd/wc", "Web Components adapter"],
    ];

    const frag = h`<section>
      <h2>Ecosystem</h2>
      <div>
        ${packages.map(([name, desc]) => h`<div>
          <code>${name}</code>
          <p>${desc}</p>
        </div>`)}
      </div>
    </section>`;

    document.body.append(...frag);
    assert.strictEqual(document.body.querySelectorAll('code').length, 3);
  });

  it('should render Footer without errors', () => {
    const frag = h`<footer>
      <div>
        <a ${{ href: "#" }}>GitHub</a>
        <a ${{ href: "#" }}>npm</a>
        <a ${{ href: "#" }}>Bundlephobia</a>
      </div>
      <p>MIT licensed. Built with hstd.</p>
    </footer>`;

    document.body.append(...frag);
    assert.ok(document.body.querySelector('footer'));
    assert.strictEqual(document.body.querySelectorAll('a').length, 3);
  });

  it('should render full page structure without errors', () => {
    const frag = h`
      <header><h1>HyperStandard</h1></header>
      <section><h2>Quick Start</h2></section>
      <section><h2>Features</h2></section>
      <section><h2>Try It Live</h2></section>
      <section><h2>API at a Glance</h2></section>
      <section><h2>Ecosystem</h2></section>
      <footer><p>MIT licensed</p></footer>
    `;

    document.body.append(...frag);

    const headings = document.body.querySelectorAll('h2');
    assert.strictEqual(headings.length, 5);
    assert.ok(document.body.querySelector('header'));
    assert.ok(document.body.querySelector('footer'));
  });

  it('should handle responsive width changes', () => {
    const w = $(1024);
    const isMobile = w.into(v => v < 768);
    const cols = isMobile.isit("1fr", "1fr 1fr");
    const fontSize = isMobile.isit("28px", "36px");

    const frag = h`<div ${{ [css.gridTemplateColumns]: cols }}>
      <h2 ${{ [css.fontSize]: fontSize }}>Test</h2>
    </div>`;

    document.body.append(...frag);
    const heading = document.body.querySelector('h2');
    assert.strictEqual(heading.style.fontSize, '36px');

    // Switch to mobile
    w.$ = 500;
    assert.strictEqual(heading.style.fontSize, '28px');

    // Back to desktop
    w.$ = 1200;
    assert.strictEqual(heading.style.fontSize, '36px');
  });

});
