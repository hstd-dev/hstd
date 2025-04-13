import { $, h as html, on, css } from "./mod.js";
/**
 * 
 * @param { string } href
 * @param { HTMLCollection | string } child
 * @returns { HTMLCollection }
 */
function Link(href, child) {
	return html`<a ${{
		href,
		target: "_blank",
		[css]: {
			color: "#0203ff",
			textDecoration: "none"
		}
	}}>${child}</a>`;
}

/**
 * 
 * @param { string } src
 * @param { string } alt
 * @param { string } href
 * @returns { HTMLCollection }
 */
function Badge(src, alt, href) {
	return Link(href, html`
		<img ${{ src, alt }}>
	`);
}

function CommandArea(text) {
	return html`
		<code ${{
			[css]: {
				display: "block",
				backgroundColor: "#02030f",
				color: "#a2a3bf",
				margin: "30px 0",
				borderRadius: "4px",
				width: "40%",
				userSelect: "none",

				padding: "16px 20px",

				fontFamily: "Courier New",
				fontSize: "16px"
			},
			[on.click]() {
				navigator.clipboard.writeText(text)
			}
		}}>$ <span ${{ [css.color]: "#f2f3ff" }}>${text}<span></code>
	`
}

function Examples() {

	const
		count = $(Number(localStorage.getItem("count") || "0"))
			.watch(newValue => localStorage.setItem("count", newValue))
	;

	return html`
		<button ${{
			[on]: {
				click: () => count.$++
			},
			[css]: {
				backgroundColor: "#0203ff",
				color: "#f2f3ff",
				padding: "12px",
				borderRadius: "4px",
				fontFamily: "int",
				fontSize: "16px"
			}
		}}>❤ I love hstd ${count} times! ❤</button><br>
	`
}


export default function() {
	return html`
		<div ${{
			[css]: {
				boxSizing: "border-box",
				padding: "60px calc(20% - 60px)",
			},
		}}>

			<h1 ${{
				[css.margin]: "40px 0",
				[css.fontFamily]: 'Courier New"'
			}}>
				${Link("https://libh.js.org", "h")}std
			</h1>

			<div ${{ [css.margin]: "0 0 20px" }}>
				${Link("https://github.com/ihasq/hstd", "GitHub")}
				${Link("https://stackblitz.com/edit/vitejs-vite-vcga6uwx?file=main.js", "StackBlitz")}
			</div>

			<div ${{ [css.margin]: "0 0 20px" }}>
				${Badge("https://img.shields.io/npm/v/hstd?logo=npm&color=%23CC3534", "npm version badge", "https://npmjs.com/package/libh")}
				${Badge("https://img.shields.io/bundlejs/size/hstd?logo=stackblitz", "npm package minimized gzipped size", "https://bundlephobia.com/package/libh")}
			</div>

			<div ${{ [css.margin]: "40px 0 0" }}>
				<b>hstd</b> = HyperStandard is a minimal JavaScript library to build simple, reactive, extensible web interface. 
			</div>

			<div ${{ [css.margin]: "20px 0 0" }}>
				${Link("https://github.com/ihasq/hstd/tree/main/docs/main.js", "source")} of this page is available.
			</div>

			<div ${{ [css.margin]: "60px 0" }}>
				<h2 ${{ [css.fontFamily]: 'Courier New' }}>Install</h2>

				${CommandArea("npm i hstd")}
			</div>

			<div ${{ [css.margin]: "60px 0" }}>
				<h2 ${{ [css.fontFamily]: 'Courier New' }}>Usage</h2>

				${CommandArea("import { $, h as html } from \"hstd\"")}
			</div>

			<div ${{ [css.margin]: "60px 0" }}>
				${Examples()}
			</div>

			<div ${{ [css.margin]: "60px 0" }}>
				<h2 ${{ [css.fontFamily]: 'Courier New' }}>License</h2>

				hstd is ${Link("https://opensource.org/license/mit", "MIT licensed")}.
			</div>

	`;
}