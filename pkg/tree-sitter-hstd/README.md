# tree-sitter-hstd

Tree-sitter highlight and injection queries for [HyperStandard](https://hstd.io).

Provides:
- **HTML injection** inside `h`/`html` tagged template literals
- **Semantic highlighting** for `css.*`, `on.*`, `io.*`, `$.this.*`, `[css]`, `[on]`, `[io]`

## Neovim (nvim-treesitter)

Copy the query files into your neovim config for both JavaScript and TypeScript:

```sh
# JavaScript
mkdir -p ~/.config/nvim/after/queries/javascript
cat queries/injections.scm >> ~/.config/nvim/after/queries/javascript/injections.scm
cat queries/highlights.scm >> ~/.config/nvim/after/queries/javascript/highlights.scm

# TypeScript
mkdir -p ~/.config/nvim/after/queries/typescript
cat queries/injections.scm >> ~/.config/nvim/after/queries/typescript/injections.scm
cat queries/highlights.scm >> ~/.config/nvim/after/queries/typescript/highlights.scm
```

Restart neovim. The queries extend the built-in JavaScript/TypeScript grammars.

## Helix

Copy queries into the helix runtime directory:

```sh
# Find your helix config/runtime directory
# Usually: ~/.config/helix/runtime/queries/

for lang in javascript typescript tsx; do
  dir=~/.config/helix/runtime/queries/$lang
  mkdir -p $dir
  cat queries/injections.scm >> $dir/injections.scm
  cat queries/highlights.scm >> $dir/highlights.scm
done
```

Restart helix.

## Zed

Create a Zed extension in your extensions directory:

```sh
mkdir -p ~/.config/zed/extensions/hstd/languages/javascript
cp queries/injections.scm ~/.config/zed/extensions/hstd/languages/javascript/
cp queries/highlights.scm ~/.config/zed/extensions/hstd/languages/javascript/
```

Add the extension manifest:

```json
// ~/.config/zed/extensions/hstd/extension.json
{
  "id": "hstd",
  "name": "HyperStandard",
  "version": "0.1.0",
  "description": "Syntax highlighting for HyperStandard templates"
}
```

## Sublime Text

Sublime Text uses TextMate grammars. See `pkg/vscode/syntaxes/` for `.tmLanguage.json` files that can be installed as a Sublime Text package.

## What gets highlighted

| Pattern | Scope | Example |
|---------|-------|---------|
| `h\`...\`` / `html\`...\`` | HTML injection | `h\`<div>hello</div>\`` |
| `css.color` | `@module` + `@property` | `[css.backgroundColor]: ptr` |
| `on.click` | `@module` + `@function` | `[on.click]: handler` |
| `io.value` | `@module` + `@property` | `[io.value]: ptr` |
| `$.this.prop` | `@variable.builtin` + `@variable.other.member` | `color: $.this.backgroundColor` |
| `[css]`, `[on]`, `[io]` | `@module` | `[css]: { ... }` |
| `$(...)` | `@function.builtin` | `const ptr = $(0)` |
