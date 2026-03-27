import * as ts from 'typescript/lib/tsserverlibrary';

// ============================================================================
// Completion data
// ============================================================================

const HTML_ELEMENTS = [
	// Structural
	'div', 'span', 'section', 'article', 'aside', 'header', 'footer', 'nav', 'main',
	// Text
	'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'strong', 'em', 'small',
	'mark', 'del', 'ins', 'sub', 'sup', 'br', 'hr', 'pre', 'code',
	'blockquote', 'abbr', 'cite', 'q', 'b', 'i', 'u', 's',
	// Lists
	'ul', 'ol', 'li', 'dl', 'dt', 'dd',
	// Tables
	'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
	// Forms
	'form', 'input', 'textarea', 'select', 'option', 'optgroup',
	'button', 'label', 'fieldset', 'legend', 'datalist', 'output',
	// Media
	'img', 'video', 'audio', 'source', 'canvas', 'svg', 'picture', 'track',
	// Interactive
	'details', 'summary', 'dialog', 'menu',
	// Embedded
	'iframe', 'object', 'embed',
	// Other
	'template', 'slot', 'progress', 'meter', 'time', 'figure', 'figcaption',
	'ruby', 'rt', 'rp', 'wbr', 'data', 'address',
];

const VOID_ELEMENTS = new Set([
	'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
	'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

const CSS_PROPERTIES = [
	// Box model
	'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
	'marginBlock', 'marginBlockStart', 'marginBlockEnd', 'marginInline', 'marginInlineStart', 'marginInlineEnd',
	'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
	'paddingBlock', 'paddingBlockStart', 'paddingBlockEnd', 'paddingInline', 'paddingInlineStart', 'paddingInlineEnd',
	'border', 'borderTop', 'borderRight', 'borderBottom', 'borderLeft',
	'borderWidth', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
	'borderStyle', 'borderTopStyle', 'borderRightStyle', 'borderBottomStyle', 'borderLeftStyle',
	'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
	'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius',
	'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
	'boxSizing',
	// Display & Position
	'display', 'position', 'top', 'right', 'bottom', 'left', 'inset',
	'float', 'clear', 'zIndex', 'overflow', 'overflowX', 'overflowY',
	'visibility', 'opacity', 'isolation',
	// Flex
	'flexDirection', 'flexWrap', 'flexFlow',
	'justifyContent', 'alignItems', 'alignContent', 'alignSelf', 'justifySelf',
	'flex', 'flexGrow', 'flexShrink', 'flexBasis', 'order',
	'gap', 'rowGap', 'columnGap',
	// Grid
	'gridTemplateColumns', 'gridTemplateRows', 'gridTemplateAreas', 'gridTemplate',
	'gridColumn', 'gridColumnStart', 'gridColumnEnd',
	'gridRow', 'gridRowStart', 'gridRowEnd',
	'gridArea', 'gridAutoColumns', 'gridAutoRows', 'gridAutoFlow',
	'placeItems', 'placeContent', 'placeSelf',
	// Typography
	'color', 'fontSize', 'fontFamily', 'fontWeight', 'fontStyle', 'fontVariant',
	'lineHeight', 'letterSpacing', 'wordSpacing',
	'textAlign', 'textDecoration', 'textDecorationColor', 'textDecorationStyle', 'textDecorationLine',
	'textTransform', 'textIndent', 'textOverflow', 'textShadow',
	'whiteSpace', 'wordBreak', 'wordWrap', 'overflowWrap', 'hyphens', 'tabSize',
	// Background
	'background', 'backgroundColor', 'backgroundImage', 'backgroundSize', 'backgroundPosition',
	'backgroundRepeat', 'backgroundClip', 'backgroundOrigin', 'backgroundAttachment',
	'backgroundBlendMode',
	// Transform & Animation
	'transform', 'transformOrigin', 'transformStyle', 'perspective', 'perspectiveOrigin',
	'transition', 'transitionProperty', 'transitionDuration', 'transitionTimingFunction', 'transitionDelay',
	'animation', 'animationName', 'animationDuration', 'animationTimingFunction',
	'animationDelay', 'animationIterationCount', 'animationDirection', 'animationFillMode', 'animationPlayState',
	// Other visual
	'cursor', 'userSelect', 'pointerEvents', 'touchAction',
	'outline', 'outlineColor', 'outlineStyle', 'outlineWidth', 'outlineOffset',
	'boxShadow', 'filter', 'backdropFilter', 'mixBlendMode',
	'objectFit', 'objectPosition', 'verticalAlign',
	'content', 'listStyle', 'listStyleType', 'listStylePosition', 'listStyleImage',
	'resize', 'appearance', 'scrollBehavior', 'scrollSnapType', 'scrollSnapAlign',
	'aspectRatio', 'accentColor', 'caretColor', 'colorScheme',
	'willChange', 'contain', 'containerType', 'containerName',
];

const DOM_EVENTS = [
	// Mouse
	'click', 'dblclick', 'auxclick',
	'mousedown', 'mouseup', 'mousemove',
	'mouseenter', 'mouseleave', 'mouseover', 'mouseout',
	'contextmenu',
	// Keyboard
	'keydown', 'keyup', 'keypress',
	// Focus
	'focus', 'blur', 'focusin', 'focusout',
	// Form
	'input', 'change', 'submit', 'reset', 'invalid',
	'beforeinput', 'formdata',
	// Touch
	'touchstart', 'touchend', 'touchmove', 'touchcancel',
	// Pointer
	'pointerdown', 'pointerup', 'pointermove',
	'pointerenter', 'pointerleave', 'pointerover', 'pointerout',
	'pointercancel', 'gotpointercapture', 'lostpointercapture',
	// Drag
	'drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop',
	// Scroll & Resize
	'scroll', 'scrollend', 'resize', 'wheel',
	// Clipboard
	'cut', 'copy', 'paste',
	// Media
	'play', 'pause', 'ended', 'playing', 'waiting', 'seeking', 'seeked',
	'volumechange', 'ratechange', 'durationchange', 'timeupdate',
	'loadstart', 'loadeddata', 'loadedmetadata', 'canplay', 'canplaythrough',
	'emptied', 'stalled', 'suspend',
	// Lifecycle
	'load', 'error', 'abort', 'select',
	// Animation & Transition
	'animationstart', 'animationend', 'animationiteration', 'animationcancel',
	'transitionstart', 'transitionend', 'transitionrun', 'transitioncancel',
	// Composition (IME)
	'compositionstart', 'compositionupdate', 'compositionend',
	// Other
	'toggle', 'close', 'cancel', 'fullscreenchange', 'fullscreenerror',
];

const IO_PROPERTIES = [
	'value', 'checked', 'selected', 'selectedIndex',
	'disabled', 'readOnly',
	'textContent', 'innerHTML', 'innerText',
	'src', 'href', 'currentSrc',
	'volume', 'muted', 'currentTime', 'playbackRate',
	'scrollTop', 'scrollLeft',
	'width', 'height',
	'open', 'indeterminate',
];

// ============================================================================
// Context detection
// ============================================================================

type CompletionContext =
	| { type: 'html-element'; prefix: string }
	| { type: 'css-property'; prefix: string }
	| { type: 'event-name'; prefix: string }
	| { type: 'io-property'; prefix: string }
	| { type: 'this-property'; prefix: string; siblings: string[] }
	| { type: 'css-bundle-property'; prefix: string }
	| { type: 'on-bundle-event'; prefix: string };

/**
 * Detect completion context from cursor position.
 *
 * Handles patterns:
 *   css.prefix      → CSS property
 *   on.prefix       → DOM event
 *   io.prefix       → IO property
 *   $.this.prefix   → sibling properties in same object literal
 *   <prefix         → HTML element (inside h/html tagged template)
 *   [css]: { prop   → CSS property (inside css bundle object)
 *   [on]:  { ev     → DOM event  (inside on bundle object)
 */
function getContext(
	ts: typeof import('typescript/lib/tsserverlibrary'),
	sourceFile: ts.SourceFile,
	position: number,
): CompletionContext | null {

	const text = sourceFile.text;
	const before = text.substring(0, position);

	// css.prefix or [css.prefix
	const cssMatch = before.match(/\bcss\.([a-zA-Z]*)$/);
	if (cssMatch) return { type: 'css-property', prefix: cssMatch[1] };

	// on.prefix or [on.prefix
	const onMatch = before.match(/\bon\.([a-zA-Z]*)$/);
	if (onMatch) return { type: 'event-name', prefix: onMatch[1] };

	// io.prefix or [io.prefix
	const ioMatch = before.match(/\bio\.([a-zA-Z]*)$/);
	if (ioMatch) return { type: 'io-property', prefix: ioMatch[1] };

	// $.this.prefix
	const thisMatch = before.match(/\$\.this\.([a-zA-Z]*)$/);
	if (thisMatch) {
		const siblings = findSiblingProperties(ts, sourceFile, position);
		return { type: 'this-property', prefix: thisMatch[1], siblings };
	}

	// Property name inside [css]: { ... } or [on]: { ... } bundle
	const bundleType = findBundleContext(ts, sourceFile, position);
	if (bundleType) {
		const propMatch = before.match(/(?:^|[{,]\s*)([a-zA-Z]*)$/m);
		const prefix = propMatch ? propMatch[1] : '';
		if (bundleType === 'css') return { type: 'css-bundle-property', prefix };
		if (bundleType === 'on') return { type: 'on-bundle-event', prefix };
	}

	// <prefix inside h`...` or html`...` tagged template
	const htmlMatch = before.match(/<\/?([a-zA-Z]*)$/);
	if (htmlMatch && isInsideHtmlTemplate(ts, sourceFile, position)) {
		return { type: 'html-element', prefix: htmlMatch[1] };
	}

	return null;
}

// ============================================================================
// AST helpers
// ============================================================================

/**
 * Check if position is inside a tagged template whose tag is h or html.
 * Walks the AST depth-first; returns true if a matching TaggedTemplateExpression
 * contains the position within its template portion.
 */
function isInsideHtmlTemplate(
	ts: typeof import('typescript/lib/tsserverlibrary'),
	sourceFile: ts.SourceFile,
	position: number,
): boolean {
	function visit(node: ts.Node): boolean {
		if (position < node.getStart(sourceFile) || position > node.getEnd()) return false;

		if (ts.isTaggedTemplateExpression(node)) {
			const tagName = extractTagName(ts, node.tag);
			if (tagName === 'h' || tagName === 'html') {
				return position >= node.template.getStart(sourceFile);
			}
		}

		return ts.forEachChild(node, visit) || false;
	}
	return visit(sourceFile);
}

/** Extract a plain identifier name from an expression (handles `h`, `html`, property access chains). */
function extractTagName(ts: typeof import('typescript/lib/tsserverlibrary'), node: ts.Expression): string | null {
	if (ts.isIdentifier(node)) return node.text;
	if (ts.isPropertyAccessExpression(node)) return node.name.text;
	return null;
}

/**
 * Find the innermost ObjectLiteralExpression containing position and return
 * identfier-named property keys from that object.
 */
function findSiblingProperties(
	ts: typeof import('typescript/lib/tsserverlibrary'),
	sourceFile: ts.SourceFile,
	position: number,
): string[] {
	let result: string[] = [];

	function visit(node: ts.Node): void {
		if (position < node.getStart(sourceFile) || position > node.getEnd()) return;

		if (ts.isObjectLiteralExpression(node)) {
			result = collectPropertyNames(ts, node);
		}

		ts.forEachChild(node, visit);
	}

	visit(sourceFile);
	return result;
}

/** Collect string property names from an ObjectLiteralExpression. */
function collectPropertyNames(
	ts: typeof import('typescript/lib/tsserverlibrary'),
	obj: ts.ObjectLiteralExpression,
): string[] {
	const names: string[] = [];
	for (const prop of obj.properties) {
		if (ts.isPropertyAssignment(prop) || ts.isShorthandPropertyAssignment(prop)) {
			if (ts.isIdentifier(prop.name)) {
				names.push(prop.name.text);
			} else if (ts.isStringLiteral(prop.name)) {
				names.push(prop.name.text);
			}
		}
	}
	return names;
}

/**
 * Detect if the cursor is at a property-name position inside a [css]: {...} or [on]: {...} bundle.
 *
 * Walks the AST to find the innermost ObjectLiteralExpression, then checks if its
 * parent is a PropertyAssignment with a ComputedPropertyName of [css] or [on].
 */
function findBundleContext(
	ts: typeof import('typescript/lib/tsserverlibrary'),
	sourceFile: ts.SourceFile,
	position: number,
): 'css' | 'on' | null {
	let result: 'css' | 'on' | null = null;

	function visit(node: ts.Node): void {
		if (position < node.getStart(sourceFile) || position > node.getEnd()) return;

		if (ts.isObjectLiteralExpression(node)) {
			const parent = node.parent;
			if (parent && ts.isPropertyAssignment(parent) && ts.isComputedPropertyName(parent.name)) {
				const expr = parent.name.expression;
				if (ts.isIdentifier(expr)) {
					if (expr.text === 'css') result = 'css';
					else if (expr.text === 'on') result = 'on';
				}
			}
		}

		ts.forEachChild(node, visit);
	}

	visit(sourceFile);
	return result;
}

// ============================================================================
// Completion building
// ============================================================================

function buildCompletions(
	ts: typeof import('typescript/lib/tsserverlibrary'),
	context: CompletionContext,
): ts.CompletionEntry[] {

	const entries: ts.CompletionEntry[] = [];

	const add = (items: string[], kind: ts.ScriptElementKind, dataType: string) => {
		for (const name of items) {
			if (name.toLowerCase().startsWith(context.prefix.toLowerCase())) {
				entries.push({
					name,
					kind,
					kindModifiers: '',
					sortText: '0' + name,
					data: { __hstdType: dataType } as unknown as ts.CompletionEntryData,
				});
			}
		}
	};

	switch (context.type) {
		case 'css-property':
		case 'css-bundle-property':
			add(CSS_PROPERTIES, ts.ScriptElementKind.memberVariableElement, 'css-property');
			break;

		case 'event-name':
		case 'on-bundle-event':
			add(DOM_EVENTS, ts.ScriptElementKind.functionElement, 'event-name');
			break;

		case 'io-property':
			add(IO_PROPERTIES, ts.ScriptElementKind.memberVariableElement, 'io-property');
			break;

		case 'html-element':
			add(HTML_ELEMENTS, ts.ScriptElementKind.classElement, 'html-element');
			break;

		case 'this-property':
			for (const name of context.siblings) {
				if (name.toLowerCase().startsWith(context.prefix.toLowerCase())) {
					entries.push({
						name,
						kind: ts.ScriptElementKind.memberVariableElement,
						kindModifiers: '',
						sortText: '0' + name,
						data: { __hstdType: 'this-property' } as unknown as ts.CompletionEntryData,
					});
				}
			}
			break;
	}

	return entries;
}

// ============================================================================
// Completion details
// ============================================================================

function buildCompletionDetails(
	ts: typeof import('typescript/lib/tsserverlibrary'),
	name: string,
	data: ts.CompletionEntryData | undefined,
): ts.CompletionEntryDetails | null {

	const hstdType = data && (data as any).__hstdType as string | undefined;
	if (!hstdType) return null;

	const doc = (text: string): ts.SymbolDisplayPart[] => [{ kind: 'text', text }];

	switch (hstdType) {
		case 'css-property':
			return {
				name,
				kind: ts.ScriptElementKind.memberVariableElement,
				kindModifiers: '',
				displayParts: doc(`(css property) ${name}`),
				documentation: doc(`CSS property \`${camelToKebab(name)}\`. Use with css.${name} or inside [css]: { ${name}: ... }.`),
				tags: [],
			};

		case 'event-name':
			return {
				name,
				kind: ts.ScriptElementKind.functionElement,
				kindModifiers: '',
				displayParts: doc(`(event) ${name}`),
				documentation: doc(`DOM event \`${name}\`. Use as [on.${name}]: handler or inside [on]: { ${name}: handler }.`),
				tags: [],
			};

		case 'io-property':
			return {
				name,
				kind: ts.ScriptElementKind.memberVariableElement,
				kindModifiers: '',
				displayParts: doc(`(io binding) ${name}`),
				documentation: doc(`Two-way binding for element property \`${name}\`. Use as [io.${name}]: pointer.`),
				tags: [],
			};

		case 'html-element': {
			const isVoid = VOID_ELEMENTS.has(name);
			return {
				name,
				kind: ts.ScriptElementKind.classElement,
				kindModifiers: '',
				displayParts: doc(`<${name}>`),
				documentation: doc(
					isVoid
						? `Void HTML element. Self-closing: <${name}>.`
						: `HTML element. Usage: <${name}>...</${name}>.`
				),
				tags: [],
			};
		}

		case 'this-property':
			return {
				name,
				kind: ts.ScriptElementKind.memberVariableElement,
				kindModifiers: '',
				displayParts: doc(`(deferred) $.this.${name}`),
				documentation: doc(`References the value of \`${name}\` in the same property bundle. Resolved at render time.`),
				tags: [],
			};
	}

	return null;
}

function camelToKebab(str: string): string {
	return str.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
}

// ============================================================================
// io diagnostic — detect io bindings on non-input elements
// ============================================================================

const IO_VALID_ELEMENTS = new Set([
	'input', 'textarea', 'select',
]);

/**
 * Walk tagged template expressions looking for io.xxx bindings applied to
 * elements that cannot receive input events.
 *
 * Pattern detected:
 *   h`<div ${{ [io.value]: ptr }}>` → error on <div>
 *   h`<input ${{ [io.value]: ptr }}>` → ok
 *   h`<textarea ${{ [io.value]: ptr }}>` → ok
 *   h`<select ${{ [io.value]: ptr }}>` → ok
 */
function getIoDiagnostics(
	ts: typeof import('typescript/lib/tsserverlibrary'),
	sourceFile: ts.SourceFile,
): ts.Diagnostic[] {

	const diagnostics: ts.Diagnostic[] = [];

	function visit(node: ts.Node): void {

		if (ts.isTaggedTemplateExpression(node)) {
			const tagName = extractTagName(ts, node.tag);
			if (tagName === 'h' || tagName === 'html') {
				checkTemplate(node);
			}
		}

		ts.forEachChild(node, visit);
	}

	function checkTemplate(tagged: ts.TaggedTemplateExpression): void {
		const template = tagged.template;

		if (ts.isNoSubstitutionTemplateLiteral(template)) return;

		// Build the full template text with indices mapping to each span
		const headText = template.head.text;
		let accumulated = headText;

		for (let i = 0; i < template.templateSpans.length; i++) {
			const span = template.templateSpans[i];
			const spanExpr = span.expression;

			// Determine which element this interpolation belongs to
			const elementName = findEnclosingElementName(accumulated);

			// Check if this interpolation is in attribute position
			// (after `<tag ` and before `>`)
			const isAttrPosition = isInAttributePosition(accumulated);

			if (elementName && isAttrPosition) {
				// Check if the expression contains [io.xxx] computed properties
				const ioProps = findIoProperties(ts, spanExpr);

				for (const ioProp of ioProps) {
					// contenteditable check: look if the same object has contentEditable or contenteditable property
					const hasContentEditable = hasContentEditableProperty(ts, spanExpr);

					if (!IO_VALID_ELEMENTS.has(elementName) && !hasContentEditable) {
						diagnostics.push({
							file: sourceFile,
							start: ioProp.getStart(sourceFile),
							length: ioProp.getEnd() - ioProp.getStart(sourceFile),
							messageText:
								`io binding requires <input>, <textarea>, <select>, or contenteditable element, ` +
								`but is applied to <${elementName}>.`,
							category: ts.DiagnosticCategory.Error,
							code: 17001,
							source: '@hstd/ts',
						});
					}
				}
			}

			accumulated += '\x00' + span.literal.text;
		}
	}

	visit(sourceFile);
	return diagnostics;
}

/** Find the last opening tag name from accumulated template text. */
function findEnclosingElementName(text: string): string | null {
	// Find the last `<tagname` that hasn't been closed with `>`
	// We scan for the last `<` that isn't followed by `/` (not a closing tag)
	const matches = [...text.matchAll(/<([a-zA-Z][a-zA-Z0-9-]*)/g)];
	if (matches.length === 0) return null;
	return matches[matches.length - 1][1].toLowerCase();
}

/** Check if the current position (end of accumulated text) is inside an open tag. */
function isInAttributePosition(text: string): boolean {
	// If the last `<` has no matching `>` after it, we're in attribute position
	const lastOpen = text.lastIndexOf('<');
	if (lastOpen === -1) return false;
	const afterOpen = text.substring(lastOpen);
	return !afterOpen.includes('>');
}

/** Find [io.xxx] computed property nodes in an expression (typically an ObjectLiteralExpression). */
function findIoProperties(
	ts: typeof import('typescript/lib/tsserverlibrary'),
	node: ts.Node,
): ts.Node[] {
	const results: ts.Node[] = [];

	function visit(n: ts.Node): void {
		if (ts.isComputedPropertyName(n)) {
			const expr = n.expression;
			// Match io.xxx pattern
			if (ts.isPropertyAccessExpression(expr) && ts.isIdentifier(expr.expression) && expr.expression.text === 'io') {
				results.push(n);
			}
		}
		ts.forEachChild(n, visit);
	}

	visit(node);
	return results;
}

/** Check if an object expression has a contentEditable or contenteditable property. */
function hasContentEditableProperty(
	ts: typeof import('typescript/lib/tsserverlibrary'),
	node: ts.Node,
): boolean {
	if (!ts.isObjectLiteralExpression(node)) return false;

	for (const prop of node.properties) {
		if (ts.isPropertyAssignment(prop)) {
			const name = ts.isIdentifier(prop.name) ? prop.name.text
				: ts.isStringLiteral(prop.name) ? prop.name.text
				: null;
			if (name === 'contentEditable' || name === 'contenteditable') return true;
		}
	}
	return false;
}

// ============================================================================
// Template position mismatch diagnostic
// ============================================================================

/**
 * Detect mismatches between interpolation position and value type:
 *   - ObjectLiteralExpression in body position → error
 *   - Non-object (string, number, identifier) in attribute position → error
 */
function getTemplateDiagnostics(
	ts: typeof import('typescript/lib/tsserverlibrary'),
	sourceFile: ts.SourceFile,
): ts.Diagnostic[] {

	const diagnostics: ts.Diagnostic[] = [];

	function visit(node: ts.Node): void {
		if (ts.isTaggedTemplateExpression(node)) {
			const tagName = extractTagName(ts, node.tag);
			if (tagName === 'h' || tagName === 'html') {
				checkInterpolations(node);
			}
		}
		ts.forEachChild(node, visit);
	}

	function checkInterpolations(tagged: ts.TaggedTemplateExpression): void {
		const template = tagged.template;
		if (ts.isNoSubstitutionTemplateLiteral(template)) return;

		const headText = template.head.text;
		let accumulated = headText;

		for (let i = 0; i < template.templateSpans.length; i++) {
			const span = template.templateSpans[i];
			const expr = span.expression;
			const isBody = !isInAttributePosition(accumulated);

			if (isBody && ts.isObjectLiteralExpression(expr)) {
				// Object literal in body position — likely meant for attribute position
				diagnostics.push({
					file: sourceFile,
					start: expr.getStart(sourceFile),
					length: expr.getEnd() - expr.getStart(sourceFile),
					messageText:
						`Object literal in body position. ` +
						`Did you mean to use attribute syntax? e.g. <tag \${{ ... }}>`,
					category: ts.DiagnosticCategory.Error,
					code: 17002,
					source: '@hstd/ts',
				});
			}

			if (!isBody && !ts.isObjectLiteralExpression(expr)) {
				// Non-object in attribute position
				const exprKind = ts.isStringLiteral(expr) ? 'String'
					: ts.isNumericLiteral(expr) ? 'Number'
					: ts.isArrayLiteralExpression(expr) ? 'Array'
					: ts.isTemplateExpression(expr) || ts.isNoSubstitutionTemplateLiteral(expr) ? 'String'
					: expr.kind === ts.SyntaxKind.NullKeyword ? 'null'
					: null;

				// Only report for unambiguous non-object literals
				if (exprKind) {
					diagnostics.push({
						file: sourceFile,
						start: expr.getStart(sourceFile),
						length: expr.getEnd() - expr.getStart(sourceFile),
						messageText:
							`${exprKind} in attribute position. ` +
							`Attributes require an object. e.g. <tag \${{ prop: value }}>`,
						category: ts.DiagnosticCategory.Error,
						code: 17003,
						source: '@hstd/ts',
					});
				}
			}

			accumulated += '\x00' + span.literal.text;
		}
	}

	visit(sourceFile);
	return diagnostics;
}

// ============================================================================
// Prop value type mismatch diagnostic
// ============================================================================

/**
 * Detect type mismatches in [on.xxx], [css.xxx], [io.xxx] property values:
 *   - on: value must be a function expression
 *   - css: value must not be a function/object literal
 *   - io: value must not be a literal (string/number/boolean/function)
 */
function getPropTypeDiagnostics(
	ts: typeof import('typescript/lib/tsserverlibrary'),
	sourceFile: ts.SourceFile,
): ts.Diagnostic[] {

	const diagnostics: ts.Diagnostic[] = [];

	function visit(node: ts.Node): void {
		// Look for [on.xxx]: value, [css.xxx]: value, [io.xxx]: value
		if (ts.isPropertyAssignment(node) && ts.isComputedPropertyName(node.name)) {
			const keyExpr = node.name.expression;

			if (ts.isPropertyAccessExpression(keyExpr) && ts.isIdentifier(keyExpr.expression)) {
				const module = keyExpr.expression.text;
				const prop = keyExpr.name.text;
				const value = node.initializer;

				if (module === 'on') {
					checkOnValue(ts, sourceFile, prop, value, diagnostics);
				} else if (module === 'css') {
					checkCssValue(ts, sourceFile, prop, value, diagnostics);
				} else if (module === 'io') {
					checkIoValue(ts, sourceFile, prop, value, diagnostics);
				}
			}
		}

		ts.forEachChild(node, visit);
	}

	visit(sourceFile);
	return diagnostics;
}

function checkOnValue(
	ts: typeof import('typescript/lib/tsserverlibrary'),
	sourceFile: ts.SourceFile,
	eventName: string,
	value: ts.Expression,
	diagnostics: ts.Diagnostic[],
): void {
	// on handler must be a function — report for string/number/boolean/object literals
	if (
		ts.isStringLiteral(value) ||
		ts.isNumericLiteral(value) ||
		ts.isObjectLiteralExpression(value) ||
		ts.isArrayLiteralExpression(value) ||
		value.kind === ts.SyntaxKind.TrueKeyword ||
		value.kind === ts.SyntaxKind.FalseKeyword ||
		value.kind === ts.SyntaxKind.NullKeyword
	) {
		diagnostics.push({
			file: sourceFile,
			start: value.getStart(sourceFile),
			length: value.getEnd() - value.getStart(sourceFile),
			messageText: `on.${eventName} requires a function handler, but received a non-function value.`,
			category: ts.DiagnosticCategory.Error,
			code: 17004,
			source: '@hstd/ts',
		});
	}
}

function checkCssValue(
	ts: typeof import('typescript/lib/tsserverlibrary'),
	sourceFile: ts.SourceFile,
	styleProp: string,
	value: ts.Expression,
	diagnostics: ts.Diagnostic[],
): void {
	// css value must be string, number, or Pointer — report for function/object/array/boolean
	if (
		ts.isFunctionExpression(value) ||
		ts.isArrowFunction(value) ||
		ts.isObjectLiteralExpression(value) ||
		ts.isArrayLiteralExpression(value) ||
		value.kind === ts.SyntaxKind.TrueKeyword ||
		value.kind === ts.SyntaxKind.FalseKeyword
	) {
		diagnostics.push({
			file: sourceFile,
			start: value.getStart(sourceFile),
			length: value.getEnd() - value.getStart(sourceFile),
			messageText:
				`css.${styleProp} requires a string, number, or Pointer value, ` +
				`but received ${ts.isFunctionExpression(value) || ts.isArrowFunction(value) ? 'a function' : 'a non-compatible value'}.`,
			category: ts.DiagnosticCategory.Error,
			code: 17005,
			source: '@hstd/ts',
		});
	}
}

function checkIoValue(
	ts: typeof import('typescript/lib/tsserverlibrary'),
	sourceFile: ts.SourceFile,
	propName: string,
	value: ts.Expression,
	diagnostics: ts.Diagnostic[],
): void {
	// io value must be a Pointer — report for string/number/boolean/function/object/array literals
	if (
		ts.isStringLiteral(value) ||
		ts.isNumericLiteral(value) ||
		ts.isFunctionExpression(value) ||
		ts.isArrowFunction(value) ||
		ts.isObjectLiteralExpression(value) ||
		ts.isArrayLiteralExpression(value) ||
		value.kind === ts.SyntaxKind.TrueKeyword ||
		value.kind === ts.SyntaxKind.FalseKeyword ||
		value.kind === ts.SyntaxKind.NullKeyword
	) {
		diagnostics.push({
			file: sourceFile,
			start: value.getStart(sourceFile),
			length: value.getEnd() - value.getStart(sourceFile),
			messageText: `io.${propName} requires a Pointer value for two-way binding, but received a literal value.`,
			category: ts.DiagnosticCategory.Error,
			code: 17006,
			source: '@hstd/ts',
		});
	}
}

// ============================================================================
// Plugin entry point
// ============================================================================

function init(modules: { typescript: typeof ts }) {
	const typescript = modules.typescript;

	function create(info: ts.server.PluginCreateInfo) {

		// Proxy every method of the original LanguageService
		const proxy: ts.LanguageService = Object.create(null);
		for (const key of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
			const original = info.languageService[key]!;
			(proxy as any)[key] = (...args: any[]) => (original as Function).apply(info.languageService, args);
		}

		// Override: getCompletionsAtPosition
		proxy.getCompletionsAtPosition = (fileName, position, options) => {
			const program = info.languageService.getProgram();
			const sourceFile = program?.getSourceFile(fileName);

			if (sourceFile) {
				const context = getContext(typescript, sourceFile, position);

				if (context) {
					const entries = buildCompletions(typescript, context);

					if (entries.length > 0) {
						const existing = info.languageService.getCompletionsAtPosition(fileName, position, options);
						return {
							isGlobalCompletion: false,
							isMemberCompletion: true,
							isNewIdentifierLocation: false,
							entries: [
								...entries,
								...(existing?.entries || []),
							],
						};
					}
				}
			}

			return info.languageService.getCompletionsAtPosition(fileName, position, options);
		};

		// Override: getCompletionEntryDetails
		proxy.getCompletionEntryDetails = (
			fileName, position, entryName,
			formatOptions, source, preferences, data,
		) => {
			const details = buildCompletionDetails(typescript, entryName, data);
			if (details) return details;

			return info.languageService.getCompletionEntryDetails(
				fileName, position, entryName,
				formatOptions, source, preferences, data,
			);
		};

		// Override: getSemanticDiagnostics
		proxy.getSemanticDiagnostics = (fileName) => {
			const original = info.languageService.getSemanticDiagnostics(fileName);
			const program = info.languageService.getProgram();
			const sourceFile = program?.getSourceFile(fileName);

			if (sourceFile) {
				return [
					...original,
					...getIoDiagnostics(typescript, sourceFile),
					...getTemplateDiagnostics(typescript, sourceFile),
					...getPropTypeDiagnostics(typescript, sourceFile),
				];
			}

			return original;
		};

		info.project.projectService.logger.info('@hstd/ts: plugin loaded');

		return proxy;
	}

	return { create };
}

export = init;
