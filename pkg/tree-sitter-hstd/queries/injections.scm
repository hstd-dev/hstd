; HyperStandard — HTML injection into h`...` and html`...` tagged templates
;
; Injects HTML parsing inside tagged template literals whose tag is `h` or `html`.
; Works with tree-sitter-javascript and tree-sitter-typescript.
;
; Usage:
;   neovim  → after/queries/javascript/injections.scm (append)
;   helix   → runtime/queries/javascript/injections.scm (append)
;   zed     → languages/javascript/injections.scm

; h`<div>...</div>`
(call_expression
  function: (identifier) @injection.language
  arguments: (template_string) @injection.content
  (#any-of? @injection.language "h" "html")
  (#set! injection.language "html")
  (#set! injection.combined))

; Namespaced: ns.h`<div>...</div>` or ns.html`...`
(call_expression
  function: (member_expression
    property: (property_identifier) @_method)
  arguments: (template_string) @injection.content
  (#any-of? @_method "h" "html")
  (#set! injection.language "html")
  (#set! injection.combined))
