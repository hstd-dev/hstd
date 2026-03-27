import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { register } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));

const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  runScripts: 'dangerously'
});

globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.HTMLInputElement = dom.window.HTMLInputElement;
globalThis.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
globalThis.HTMLSelectElement = dom.window.HTMLSelectElement;
globalThis.Element = dom.window.Element;
globalThis.Node = dom.window.Node;
globalThis.NodeList = dom.window.NodeList;
globalThis.Text = dom.window.Text;
globalThis.Event = dom.window.Event;
globalThis.InputEvent = dom.window.InputEvent;
globalThis.MouseEvent = dom.window.MouseEvent;
globalThis.KeyboardEvent = dom.window.KeyboardEvent;
globalThis.FocusEvent = dom.window.FocusEvent;
globalThis.CustomEvent = dom.window.CustomEvent;
globalThis.addEventListener = dom.window.addEventListener.bind(dom.window);
globalThis.queueMicrotask = dom.window.queueMicrotask || ((fn) => Promise.resolve().then(fn));

export { dom };
export const resetDOM = () => {
  document.head.innerHTML = '';
  document.body.innerHTML = '';
};
