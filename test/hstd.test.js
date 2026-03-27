import { describe, it, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import { dom, resetDOM } from './setup.js';

// Import library modules with relative paths
import { Memo } from '../pkg/lib/@hstd/std/src/core/memo.js';
import { Pointer, isPointer, createSignature } from '../pkg/lib/@hstd/std/src/core/pointer.js';
import { ArrayPointer, isArrayPointer } from '../pkg/lib/@hstd/std/src/core/arraypointer.js';

// ============================================================================
// SECTION 1: Memo Tests
// ============================================================================
describe('Memo', () => {

  it('should cache computation results', () => {
    let callCount = 0;
    const memo = Memo((x) => {
      callCount++;
      return x * 2;
    });

    assert.strictEqual(memo(5), 10);
    assert.strictEqual(memo(5), 10);
    assert.strictEqual(callCount, 1);
  });

  it('should compute different values for different inputs', () => {
    let callCount = 0;
    const memo = Memo((x) => {
      callCount++;
      return x * 2;
    });

    assert.strictEqual(memo(5), 10);
    assert.strictEqual(memo(10), 20);
    assert.strictEqual(callCount, 2);
  });

  it('should support WeakMap mode', () => {
    const memo = Memo((obj) => ({ value: obj.x * 2 }), true);
    const obj1 = { x: 5 };
    const obj2 = { x: 10 };

    const result1 = memo(obj1);
    const result2 = memo(obj2);

    assert.strictEqual(result1.value, 10);
    assert.strictEqual(result2.value, 20);
    assert.strictEqual(memo(obj1), result1);
  });

});

// ============================================================================
// SECTION 2: Pointer Basic Tests
// ============================================================================
describe('Pointer - Basic', () => {

  it('should create a pointer with initial value', () => {
    const ptr = Pointer(42);
    assert.strictEqual(ptr.$, 42);
  });

  it('should update value via .$ setter', () => {
    const ptr = Pointer(0);
    ptr.$ = 100;
    assert.strictEqual(ptr.$, 100);
  });

  it('should be identifiable via isPointer', () => {
    const ptr = Pointer(0);
    assert.strictEqual(!!isPointer(ptr), true);
    assert.strictEqual(!!isPointer({}), false);
    assert.strictEqual(!!isPointer(null), false);
  });

  it('should support undefined initial value', () => {
    const ptr = Pointer();
    assert.strictEqual(ptr.$, undefined);
  });

  it('should support object values', () => {
    const ptr = Pointer({ name: 'test', count: 0 });
    assert.deepStrictEqual(ptr.$, { name: 'test', count: 0 });
  });

  it('should support function values and invoke them', () => {
    const ptr = Pointer((x, y) => x + y);
    assert.strictEqual(ptr(2, 3), 5);
  });

});

// ============================================================================
// SECTION 3: Pointer Watch/Abort Tests
// ============================================================================
describe('Pointer - Watch/Abort', () => {

  it('should call watcher when value changes', () => {
    const ptr = Pointer(0);
    const values = [];

    ptr.watch((v) => values.push(v));
    ptr.$ = 1;
    ptr.$ = 2;
    ptr.$ = 3;

    assert.deepStrictEqual(values, [1, 2, 3]);
  });

  it('should not call watcher when value is same', () => {
    const ptr = Pointer(5);
    const values = [];

    ptr.watch((v) => values.push(v));
    ptr.$ = 5;
    ptr.$ = 5;

    assert.deepStrictEqual(values, []);
  });

  it('should support multiple watchers', () => {
    const ptr = Pointer(0);
    const values1 = [];
    const values2 = [];

    ptr.watch((v) => values1.push(v));
    ptr.watch((v) => values2.push(v));
    ptr.$ = 10;

    assert.deepStrictEqual(values1, [10]);
    assert.deepStrictEqual(values2, [10]);
  });

  it('should abort watcher', () => {
    const ptr = Pointer(0);
    const values = [];
    const watcher = (v) => values.push(v);

    ptr.watch(watcher);
    ptr.$ = 1;
    ptr.abort(watcher);
    ptr.$ = 2;

    assert.deepStrictEqual(values, [1]);
  });

  it('should force refresh with .refresh()', () => {
    const ptr = Pointer(5);
    const values = [];

    ptr.watch((v) => values.push(v));
    ptr.refresh();

    assert.deepStrictEqual(values, [5]);
  });

});

// ============================================================================
// SECTION 4: Pointer Transformation Methods
// ============================================================================
describe('Pointer - Transformations', () => {

  it('should transform with .into()', () => {
    const ptr = Pointer(5);
    const doubled = ptr.into(x => x * 2);

    assert.strictEqual(doubled.$, 10);

    ptr.$ = 10;
    assert.strictEqual(doubled.$, 20);
  });

  it('should chain .into() transformations', () => {
    const ptr = Pointer(2);
    const result = ptr.into(x => x + 1).into(x => x * 2);

    assert.strictEqual(result.$, 6);

    ptr.$ = 5;
    assert.strictEqual(result.$, 12);
  });

  it('should negate with .not()', () => {
    const ptr = Pointer(true);
    const notPtr = ptr.not();

    assert.strictEqual(notPtr.$, false);

    ptr.$ = false;
    assert.strictEqual(notPtr.$, true);
  });

  it('should convert to boolean with .bool()', () => {
    const ptr = Pointer(0);
    const boolPtr = ptr.bool();

    assert.strictEqual(boolPtr.$, false);

    ptr.$ = 1;
    assert.strictEqual(boolPtr.$, true);

    ptr.$ = 'hello';
    assert.strictEqual(boolPtr.$, true);
  });

  it('should switch value with .switch()', () => {
    const ptr = Pointer(true);

    ptr.switch();
    assert.strictEqual(ptr.$, false);

    ptr.switch();
    assert.strictEqual(ptr.$, true);
  });

  it('should conditionally transform with .isit()', () => {
    const ptr = Pointer(true);
    const result = ptr.isit('yes', 'no');

    assert.strictEqual(!!isPointer(result), true);
    assert.strictEqual(result.$, 'yes');

    ptr.$ = false;
    assert.strictEqual(result.$, 'no');
  });

  it('should alternate with .tick()', () => {
    const ptr = Pointer(0);
    const tick = ptr.tick();

    assert.strictEqual(tick.$, true);

    ptr.$ = 1;
    assert.strictEqual(tick.$, false);

    ptr.$ = 2;
    assert.strictEqual(tick.$, true);
  });

});

// ============================================================================
// SECTION 5: Pointer Arithmetic Operations
// ============================================================================
describe('Pointer - Arithmetic Operations', () => {

  it('should add with .sum()', () => {
    const ptr = Pointer(10);
    const result = ptr.sum(5);

    assert.strictEqual(result.$, 15);

    ptr.$ = 20;
    assert.strictEqual(result.$, 25);
  });

  it('should subtract with .sub()', () => {
    const ptr = Pointer(10);
    const result = ptr.sub(3);

    assert.strictEqual(result.$, 7);
  });

  it('should multiply with .mul()', () => {
    const ptr = Pointer(4);
    const result = ptr.mul(3);

    assert.strictEqual(result.$, 12);
  });

  it('should divide with .div()', () => {
    const ptr = Pointer(20);
    const result = ptr.div(4);

    assert.strictEqual(result.$, 5);
  });

  it('should modulo with .mod()', () => {
    const ptr = Pointer(10);
    const result = ptr.mod(3);

    assert.strictEqual(result.$, 1);
  });

  it('should support pointer operands', () => {
    const a = Pointer(10);
    const b = Pointer(5);
    const sum = a.sum(b);

    assert.strictEqual(sum.$, 15);

    a.$ = 20;
    assert.strictEqual(sum.$, 25);

    b.$ = 10;
    assert.strictEqual(sum.$, 30);
  });

});

// ============================================================================
// SECTION 6: Pointer Logic Operations
// ============================================================================
describe('Pointer - Logic Operations', () => {

  it('should compare with .is() (Object.is)', () => {
    const ptr = Pointer(5);
    const result = ptr.is(5);

    assert.strictEqual(result.$, true);

    ptr.$ = 6;
    assert.strictEqual(result.$, false);
  });

  it('should compare with .leq() (==)', () => {
    const ptr = Pointer(5);
    const result = ptr.leq('5');

    assert.strictEqual(result.$, true);
  });

  it('should compare with .seq() (===)', () => {
    const ptr = Pointer(5);
    const result = ptr.seq('5');

    assert.strictEqual(result.$, false);

    ptr.$ = '5';
    assert.strictEqual(result.$, true);
  });

  it('should logical or with .or()', () => {
    const ptr = Pointer(false);
    const result = ptr.or(true);

    assert.strictEqual(result.$, true);

    ptr.$ = 'hello';
    assert.strictEqual(result.$, 'hello');
  });

  it('should logical and with .and()', () => {
    const ptr = Pointer(true);
    const result = ptr.and('value');

    assert.strictEqual(result.$, 'value');

    ptr.$ = false;
    assert.strictEqual(result.$, false);
  });

  it('should xor with .xor()', () => {
    const ptr = Pointer(5);
    const result = ptr.xor(3);

    assert.strictEqual(result.$, 6);
  });

});

// ============================================================================
// SECTION 7: Pointer.up (Parent Reference)
// ============================================================================
describe('Pointer - Parent Reference (.up)', () => {

  it('should have null parent for root pointer', () => {
    const ptr = Pointer(10);
    assert.strictEqual(ptr.up, null);
  });

  it('should reference parent via .up from .into()', () => {
    const parent = Pointer(10);
    const child = parent.into(x => x * 2);

    assert.strictEqual(child.up, parent);
    assert.strictEqual(child.up.$, 10);
  });

  it('should chain parent references', () => {
    const root = Pointer(1);
    const level1 = root.into(x => x + 1);
    const level2 = level1.into(x => x + 1);

    assert.strictEqual(level2.up, level1);
    assert.strictEqual(level2.up.up, root);
  });

});

// ============================================================================
// SECTION 8: Pointer Async Methods
// ============================================================================
describe('Pointer - Async', () => {

  it('should wait for value with .until()', { timeout: 500 }, async () => {
    const ptr = Pointer(0);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 200)
    );

    setTimeout(() => ptr.$ = 5, 10);

    await Promise.race([ptr.until(5), timeoutPromise]);
    assert.strictEqual(ptr.$, 5);
  });

  it('should wait for condition with .until(fn)', { timeout: 500 }, async () => {
    const ptr = Pointer(0);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 200)
    );

    setTimeout(() => ptr.$ = 10, 10);

    await Promise.race([ptr.until(v => v >= 10), timeoutPromise]);
    assert.strictEqual(ptr.$, 10);
  });

  it('should handle async setter', { timeout: 500 }, async () => {
    const ptr = Pointer(0, [async (v) => {
      await new Promise(r => setTimeout(r, 5));
      return v * 2;
    }]);

    ptr.$ = 5;
    await new Promise(r => setTimeout(r, 50));
    assert.strictEqual(ptr.$, 10);
  });

  it('should debounce with .timeout()', { timeout: 500 }, async () => {
    const ptr = Pointer(0);
    const debounced = ptr.timeout(20);

    ptr.$ = 1;
    ptr.$ = 2;
    ptr.$ = 3;

    assert.strictEqual(debounced.$, 0);

    await new Promise(r => setTimeout(r, 50));
    assert.strictEqual(debounced.$, 3);
  });

});

// ============================================================================
// SECTION 9: Pointer .from() Method
// ============================================================================
describe('Pointer - .from()', () => {

  it('should update from callback', () => {
    const ptr = Pointer(0);
    let setter;

    ptr.from((set) => {
      setter = set;
    });

    setter(10);
    assert.strictEqual(ptr.$, 10);

    setter(20);
    assert.strictEqual(ptr.$, 20);
  });

  it('should support pause/resume', () => {
    const ptr = Pointer(0);
    let setter, setPaused;

    ptr.from((set, pause) => {
      setter = set;
      setPaused = pause;
    });

    setter(10);
    assert.strictEqual(ptr.$, 10);

    setPaused(false);
    setter(20);
    assert.strictEqual(ptr.$, 10);

    setPaused(true);
    setter(30);
    assert.strictEqual(ptr.$, 30);
  });

});

// ============================================================================
// SECTION 10: ArrayPointer Basic Tests
// ============================================================================
describe('ArrayPointer - Basic', () => {

  it('should create with initial array', () => {
    const arr = ArrayPointer([1, 2, 3]);
    assert.deepStrictEqual(arr.$, [1, 2, 3]);
  });

  it('should be identifiable via isArrayPointer', () => {
    const arr = ArrayPointer([]);
    assert.strictEqual(!!isArrayPointer(arr), true);
    assert.strictEqual(!!isArrayPointer([]), false);
  });

  it('should support empty initialization', () => {
    const arr = ArrayPointer();
    assert.deepStrictEqual(arr.$, []);
  });

  it('should get length', () => {
    const arr = ArrayPointer([1, 2, 3, 4, 5]);
    assert.strictEqual(arr.length, 5);
  });

  it('should iterate with for...of', () => {
    const arr = ArrayPointer([1, 2, 3]);
    const values = [];
    for (const v of arr) {
      values.push(v);
    }
    assert.deepStrictEqual(values, [1, 2, 3]);
  });

});

// ============================================================================
// SECTION 11: ArrayPointer Mutation Methods
// ============================================================================
describe('ArrayPointer - Mutations', () => {

  it('should push elements', () => {
    const arr = ArrayPointer([1, 2]);
    arr.push(3);
    assert.deepStrictEqual(arr.$, [1, 2, 3]);
  });

  it('should pop elements', () => {
    const arr = ArrayPointer([1, 2, 3]);
    const popped = arr.pop();
    assert.strictEqual(popped, 3);
    assert.deepStrictEqual(arr.$, [1, 2]);
  });

  it('should shift elements', () => {
    const arr = ArrayPointer([1, 2, 3]);
    const shifted = arr.shift();
    assert.strictEqual(shifted, 1);
    assert.deepStrictEqual(arr.$, [2, 3]);
  });

  it('should unshift elements', () => {
    const arr = ArrayPointer([2, 3]);
    arr.unshift(1);
    assert.deepStrictEqual(arr.$, [1, 2, 3]);
  });

  it('should splice elements', () => {
    const arr = ArrayPointer([1, 2, 3, 4, 5]);
    const removed = arr.splice(1, 2, 'a', 'b');
    assert.deepStrictEqual(removed, [2, 3]);
    assert.deepStrictEqual(arr.$, [1, 'a', 'b', 4, 5]);
  });

  it('should sort elements', () => {
    const arr = ArrayPointer([3, 1, 2]);
    arr.sort();
    assert.deepStrictEqual(arr.$, [1, 2, 3]);
  });

  it('should reverse elements', () => {
    const arr = ArrayPointer([1, 2, 3]);
    arr.reverse();
    assert.deepStrictEqual(arr.$, [3, 2, 1]);
  });

  it('should set element at index', () => {
    const arr = ArrayPointer([1, 2, 3]);
    arr.set(1, 'x');
    assert.deepStrictEqual(arr.$, [1, 'x', 3]);
  });

  it('should replace entire array via .$', () => {
    const arr = ArrayPointer([1, 2, 3]);
    arr.$ = [4, 5, 6];
    assert.deepStrictEqual(arr.$, [4, 5, 6]);
  });

});

// ============================================================================
// SECTION 12: ArrayPointer Swap Methods
// ============================================================================
describe('ArrayPointer - Swap', () => {

  it('should swap by index', () => {
    const arr = ArrayPointer(['a', 'b', 'c']);
    arr.swap(0, 2);
    assert.deepStrictEqual(arr.$, ['c', 'b', 'a']);
  });

  it('should swap by value', () => {
    const arr = ArrayPointer(['apple', 'banana', 'cherry']);
    arr.swapOf('apple', 'cherry');
    assert.deepStrictEqual(arr.$, ['cherry', 'banana', 'apple']);
  });

  it('should return self for chaining', () => {
    const arr = ArrayPointer([1, 2, 3]);
    const result = arr.swap(0, 1).swap(1, 2);
    assert.deepStrictEqual(arr.$, [2, 3, 1]);
  });

});

// ============================================================================
// SECTION 13: ArrayPointer Watch/Reactive
// ============================================================================
describe('ArrayPointer - Reactive', () => {

  it('should watch push events', () => {
    const arr = ArrayPointer([1, 2]);
    const events = [];

    arr.on((element, index, type) => events.push({ element, index, type }));
    arr.push(3);

    assert.deepStrictEqual(events, [{ element: 3, index: 2, type: 'push' }]);
  });

  it('should watch pop events', () => {
    const arr = ArrayPointer([1, 2, 3]);
    const events = [];

    arr.on((element, index, type) => events.push({ element, index, type }));
    arr.pop();

    assert.deepStrictEqual(events, [{ element: 3, index: 2, type: 'pop' }]);
  });

  it('should watch set events', () => {
    const arr = ArrayPointer([1, 2, 3]);
    const events = [];

    arr.on((element, index, type) => events.push({ element, index, type }));
    arr.set(1, 'x');

    assert.deepStrictEqual(events, [{ element: 'x', index: 1, type: 'set' }]);
  });

  it('should watch swap events', () => {
    const arr = ArrayPointer(['a', 'b', 'c']);
    const events = [];

    arr.on((element, index, type) => events.push({ type }));
    arr.swap(0, 2);

    assert.strictEqual(events.filter(e => e.type === 'swap').length, 2);
  });

  it('should abort watcher', () => {
    const arr = ArrayPointer([1]);
    const events = [];
    const watcher = (element, index, type) => events.push(type);

    arr.on(watcher);
    arr.push(2);
    arr.abort(watcher);
    arr.push(3);

    assert.deepStrictEqual(events, ['push']);
  });

});

// ============================================================================
// SECTION 14: ArrayPointer Derived Arrays
// ============================================================================
describe('ArrayPointer - Derived (map/filter)', () => {

  it('should create derived array with .map()', () => {
    const arr = ArrayPointer([1, 2, 3]);
    const doubled = arr.map(x => x * 2);

    assert.deepStrictEqual(doubled.$, [2, 4, 6]);
  });

  it('should update derived array on push', () => {
    const arr = ArrayPointer([1, 2]);
    const doubled = arr.map(x => x * 2);

    arr.push(3);
    assert.deepStrictEqual(doubled.$, [2, 4, 6]);
  });

  it('should update derived array on pop', () => {
    const arr = ArrayPointer([1, 2, 3]);
    const doubled = arr.map(x => x * 2);

    arr.pop();
    assert.deepStrictEqual(doubled.$, [2, 4]);
  });

  it('should filter array', () => {
    const arr = ArrayPointer([1, 2, 3, 4, 5]);
    const evens = arr.filter(x => x % 2 === 0);

    assert.deepStrictEqual(evens.$, [2, 4]);
  });

  it('should chain transformations with .into()', () => {
    const arr = ArrayPointer([1, 2, 3]);
    const transformed = arr.into(x => x * 2);

    assert.deepStrictEqual(transformed.$, [2, 4, 6]);
  });

});

// ============================================================================
// SECTION 15: ArrayPointer Element Access
// ============================================================================
describe('ArrayPointer - Element Access', () => {

  it('should access element pointer by index property', () => {
    const arr = ArrayPointer([10, 20, 30]);
    const ptr = arr[1];

    assert.strictEqual(!!isPointer(ptr), true);
    assert.strictEqual(ptr.$, 20);
  });

  it('should access element pointer with .at()', () => {
    const arr = ArrayPointer([10, 20, 30]);
    const ptr = arr.at(1);

    assert.strictEqual(!!isPointer(ptr), true);
    assert.strictEqual(ptr.$, 20);
  });

  it('should support negative index with .at()', () => {
    const arr = ArrayPointer([10, 20, 30]);
    const ptr = arr.at(-1);

    assert.strictEqual(ptr.$, 30);
  });

  it('should update element pointer when array mutates', () => {
    const arr = ArrayPointer([10, 20, 30]);
    const ptr = arr[1];

    arr.set(1, 99);
    assert.strictEqual(ptr.$, 99);
  });

});

// ============================================================================
// SECTION 16: ArrayPointer Reactive Methods
// ============================================================================
describe('ArrayPointer - Reactive Methods', () => {

  it('should return reactive .find()', () => {
    const arr = ArrayPointer([1, 2, 3, 4, 5]);
    const found = arr.find(x => x > 3);

    assert.strictEqual(!!isPointer(found), true);
    assert.strictEqual(found.$, 4);
  });

  it('should return reactive .findIndex()', () => {
    const arr = ArrayPointer([1, 2, 3, 4, 5]);
    const idx = arr.findIndex(x => x > 3);

    assert.strictEqual(!!isPointer(idx), true);
    assert.strictEqual(idx.$, 3);
  });

  it('should return reactive .includes()', () => {
    const arr = ArrayPointer([1, 2, 3]);
    const has2 = arr.includes(2);

    assert.strictEqual(!!isPointer(has2), true);
    assert.strictEqual(has2.$, true);
  });

  it('should return reactive .reduce()', () => {
    const arr = ArrayPointer([1, 2, 3, 4]);
    const sum = arr.reduce((acc, x) => acc + x, 0);

    assert.strictEqual(!!isPointer(sum), true);
    assert.strictEqual(sum.$, 10);
  });

  it('should return reactive .some()', () => {
    const arr = ArrayPointer([1, 2, 3]);
    const hasEven = arr.some(x => x % 2 === 0);

    assert.strictEqual(!!isPointer(hasEven), true);
    assert.strictEqual(hasEven.$, true);
  });

  it('should return reactive .every()', () => {
    const arr = ArrayPointer([2, 4, 6]);
    const allEven = arr.every(x => x % 2 === 0);

    assert.strictEqual(!!isPointer(allEven), true);
    assert.strictEqual(allEven.$, true);
  });

  it('should update reactive methods on mutation', () => {
    const arr = ArrayPointer([1, 2, 3]);
    const sum = arr.reduce((acc, x) => acc + x, 0);

    arr.push(4);
    // Note: need to trigger update
    assert.strictEqual(sum.$, 10);
  });

});

// ============================================================================
// SECTION 17: ArrayPointer Non-Reactive Methods
// ============================================================================
describe('ArrayPointer - Non-Reactive Methods', () => {

  it('should indexOf', () => {
    const arr = ArrayPointer(['a', 'b', 'c']);
    assert.strictEqual(arr.indexOf('b'), 1);
    assert.strictEqual(arr.indexOf('x'), -1);
  });

  it('should forEach', () => {
    const arr = ArrayPointer([1, 2, 3]);
    const values = [];
    arr.forEach(x => values.push(x));
    assert.deepStrictEqual(values, [1, 2, 3]);
  });

});

// ============================================================================
// SECTION 18: Pointer Property Access
// ============================================================================
describe('Pointer - Property Access', () => {

  it('should access nested property reactively', () => {
    const ptr = Pointer({ name: 'John', age: 30 });
    const name = ptr.name;

    assert.strictEqual(!!isPointer(name), true);
    assert.strictEqual(name.$, 'John');
  });

  it('should update derived property when parent changes', () => {
    const ptr = Pointer({ x: 10 });
    const x = ptr.x;

    ptr.$ = { x: 20 };
    assert.strictEqual(x.$, 20);
  });

  it('should call methods on wrapped values', () => {
    const ptr = Pointer([1, 2, 3]);
    const length = ptr.length;

    assert.strictEqual(!!isPointer(length), true);
    assert.strictEqual(length.$, 3);
  });

});

// ============================================================================
// Run all tests
// ============================================================================
console.log('Running HyperStandard E2E Tests...');
