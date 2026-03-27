; HyperStandard — syntax highlights for hstd bindings
;
; Highlights css.*, on.*, io.* property access, $.this references,
; and property bundle syntax [css], [on], [io].
;
; Usage:
;   neovim  → after/queries/javascript/highlights.scm (append)
;   helix   → runtime/queries/javascript/highlights.scm (append)
;   zed     → languages/javascript/highlights.scm

; ---------------------------------------------------------------------------
; css.propertyName
; ---------------------------------------------------------------------------
(member_expression
  object: (identifier) @module
  property: (property_identifier) @property
  (#eq? @module "css")
  (#set! "priority" 110))

; ---------------------------------------------------------------------------
; on.eventName
; ---------------------------------------------------------------------------
(member_expression
  object: (identifier) @module
  property: (property_identifier) @function
  (#eq? @module "on")
  (#set! "priority" 110))

; ---------------------------------------------------------------------------
; io.propertyName
; ---------------------------------------------------------------------------
(member_expression
  object: (identifier) @module
  property: (property_identifier) @property
  (#eq? @module "io")
  (#set! "priority" 110))

; ---------------------------------------------------------------------------
; $.this.propertyName  (DeferredPointer)
; ---------------------------------------------------------------------------

; $.this → variable.builtin
(member_expression
  object: (identifier) @punctuation.special
  property: (property_identifier) @variable.builtin
  (#eq? @punctuation.special "$")
  (#eq? @variable.builtin "this")
  (#set! "priority" 110))

; $.this.propName → the property part
(member_expression
  object: (member_expression
    object: (identifier) @_dollar
    property: (property_identifier) @_this)
  property: (property_identifier) @variable.other.member
  (#eq? @_dollar "$")
  (#eq? @_this "this")
  (#set! "priority" 110))

; ---------------------------------------------------------------------------
; [css], [on], [io] — property bundle computed keys
; ---------------------------------------------------------------------------
(computed_property_name
  (identifier) @module
  (#any-of? @module "css" "on" "io")
  (#set! "priority" 110))

; ---------------------------------------------------------------------------
; $ function — Pointer constructor
; ---------------------------------------------------------------------------
(call_expression
  function: (identifier) @function.builtin
  (#eq? @function.builtin "$")
  (#set! "priority" 110))
