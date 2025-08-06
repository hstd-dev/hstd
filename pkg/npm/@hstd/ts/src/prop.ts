import * as ts from 'typescript/lib/tsserverlibrary';

// CSS プロパティのリスト
const CSS_PROPERTIES = [
	'backgroundColor', 'color', 'fontSize', 'fontFamily', 'fontWeight', 'fontStyle',
	'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
	'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
	'border', 'borderTop', 'borderRight', 'borderBottom', 'borderLeft',
	'borderWidth', 'borderStyle', 'borderColor', 'borderRadius',
	'width', 'height', 'maxWidth', 'maxHeight', 'minWidth', 'minHeight',
	'display', 'position', 'top', 'right', 'bottom', 'left',
	'flexDirection', 'flexWrap', 'justifyContent', 'alignItems', 'alignContent',
	'gridTemplateColumns', 'gridTemplateRows', 'gridGap', 'gridArea',
	'textAlign', 'textDecoration', 'textTransform', 'lineHeight', 'letterSpacing',
	'opacity', 'visibility', 'overflow', 'overflowX', 'overflowY',
	'cursor', 'userSelect', 'pointerEvents', 'zIndex', 'boxShadow', 'transform',
	'transition', 'animation', 'float', 'clear', 'verticalAlign'
];

// DOM イベント名のリスト
const DOM_EVENTS = [
	'click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout',
	'mousemove', 'mouseenter', 'mouseleave', 'contextmenu',
	'keydown', 'keyup', 'keypress',
	'focus', 'blur', 'focusin', 'focusout',
	'input', 'change', 'submit', 'reset',
	'load', 'unload', 'beforeunload', 'resize', 'scroll',
	'drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop',
	'touchstart', 'touchmove', 'touchend', 'touchcancel',
	'wheel', 'error', 'abort', 'select', 'cut', 'copy', 'paste'
];

function init(modules: { typescript: typeof ts }) {
	const ts = modules.typescript;

	function create(info: ts.server.PluginCreateInfo) {
		const proxy: ts.LanguageService = Object.create(null);
		for (let k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
			const x = info.languageService[k]!;
			proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args);
		}

		// 補完候補を提供する関数
		proxy.getCompletionsAtPosition = (fileName: string, position: number, options: ts.GetCompletionsAtPositionOptions | undefined) => {
			const sourceFile = info.languageService.getProgram()?.getSourceFile(fileName);
			if (!sourceFile) {
				return info.languageService.getCompletionsAtPosition(fileName, position, options);
			}

			const context = getContextAtPosition(sourceFile, position);
			
			if (context) {
				const completions: ts.CompletionEntry[] = [];
				
				if (context.type === 'css-property') {
					// CSS プロパティの補完
					CSS_PROPERTIES.forEach(prop => {
						if (prop.toLowerCase().startsWith(context.prefix.toLowerCase())) {
							completions.push({
								name: prop,
								kind: ts.ScriptElementKind.propertyElement,
								kindModifiers: '',
								sortText: '0' + prop,
								insertText: prop,
								data: { isCustomCompletion: true, type: 'css-property' }
							});
						}
					});
				} else if (context.type === 'event-name') {
					// イベント名の補完
					DOM_EVENTS.forEach(event => {
						if (event.toLowerCase().startsWith(context.prefix.toLowerCase())) {
							completions.push({
								name: event,
								kind: ts.ScriptElementKind.functionElement,
								kindModifiers: '',
								sortText: '0' + event,
								insertText: event,
								data: { isCustomCompletion: true, type: 'event-name' }
							});
						}
					});
				}

				if (completions.length > 0) {
					return {
						isGlobalCompletion: false,
						isMemberCompletion: true,
						isNewIdentifierLocation: false,
						entries: completions
					};
				}
			}

			return info.languageService.getCompletionsAtPosition(fileName, position, options);
		};

		// 補完詳細情報を提供する関数
		proxy.getCompletionEntryDetails = (fileName: string, position: number, name: string, formatOptions?: ts.FormatCodeOptions, source?: string, preferences?: ts.UserPreferences, data?: ts.CompletionEntryData) => {
			if (data && data.isCustomCompletion) {
				let documentation = '';
				let displayParts: ts.SymbolDisplayPart[] = [];

				if (data.type === 'css-property') {
					documentation = `CSS property: ${name}`;
					displayParts = [
						{ kind: 'propertyName', text: name },
						{ kind: 'punctuation', text: ': ' },
						{ kind: 'stringLiteral', text: 'string' }
					];
				} else if (data.type === 'event-name') {
					documentation = `DOM event: ${name}`;
					displayParts = [
						{ kind: 'propertyName', text: name },
						{ kind: 'punctuation', text: ': ' },
						{ kind: 'functionType', text: '(event: Event) => void' }
					];
				}

				return {
					name,
					kind: data.type === 'css-property' ? ts.ScriptElementKind.propertyElement : ts.ScriptElementKind.functionElement,
					kindModifiers: '',
					displayParts,
					documentation: [{ kind: 'text', text: documentation }],
					tags: []
				};
			}

			return info.languageService.getCompletionEntryDetails(fileName, position, name, formatOptions, source, preferences, data);
		};

		return proxy;
	}

	// 指定位置のコンテキストを解析する関数
	function getContextAtPosition(sourceFile: ts.SourceFile, position: number): { type: string; prefix: string } | null {
		const text = sourceFile.text;
		
		// html テンプレートリテラル内かチェック
		const htmlTemplateMatch = findHtmlTemplate(text, position);
		if (!htmlTemplateMatch) return null;

		// 現在位置から前方を検索してコンテキストを判定
		const beforePosition = text.substring(0, position);
		const lines = beforePosition.split('\n');
		const currentLine = lines[lines.length - 1];
		
		// css. で始まるプロパティ名の補完
		const cssPropertyMatch = currentLine.match(/\[css\.([a-zA-Z]*)$/);
		if (cssPropertyMatch) {
			return {
				type: 'css-property',
				prefix: cssPropertyMatch[1] || ''
			};
		}

		// on. で始まるイベント名の補完
		const eventPropertyMatch = currentLine.match(/\[on\.([a-zA-Z]*)$/);
		if (eventPropertyMatch) {
			return {
				type: 'event-name',
				prefix: eventPropertyMatch[1] || ''
			};
		}

		// css オブジェクト内のプロパティ補完
		const cssObjectMatch = currentLine.match(/\[css\]:\s*{\s*([a-zA-Z]*)$/);
		if (cssObjectMatch) {
			return {
				type: 'css-property',
				prefix: cssObjectMatch[1] || ''
			};
		}

		// on オブジェクト内のイベント補完
		const eventObjectMatch = currentLine.match(/\[on\]:\s*{\s*([a-zA-Z]*)$/);
		if (eventObjectMatch) {
			return {
				type: 'event-name',
				prefix: eventObjectMatch[1] || ''
			};
		}

		return null;
	}

	// html テンプレートリテラル内かどうかを判定
	function findHtmlTemplate(text: string, position: number): boolean {
		// 簡易的な判定: html` から ` までの範囲内かどうか
		const beforeText = text.substring(0, position);
		const htmlStartMatch = beforeText.lastIndexOf('html`');
		if (htmlStartMatch === -1) return false;

		const afterHtmlStart = text.substring(htmlStartMatch);
		const htmlEndMatch = afterHtmlStart.indexOf('`', 5); // html` の後の ` を探す
		
		return htmlEndMatch === -1 || (position - htmlStartMatch) < htmlEndMatch;
	}

	return { create };
}

export = init;