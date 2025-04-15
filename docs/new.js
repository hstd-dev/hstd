import { $, h as html, on, css } from "./mod.js";

// css.import("https://");

Object.assign(document.documentElement.style, {
	boxSizing: "border-box",
	margin: 0,
	padding: 0,
	width: "100%"
})


Object.assign(document.body.style, {
	margin: 0,
	padding: 0
})

document.body.append(...html`
	<div ${{
		[css]: {
			width: "100%",
			height: "400px",
			backgroundColor: "#025dff",
			overflow: "hidden"
		}
	}}>
		<h1 ${{
			[css]: {
				color: "#f3f4ff",
				width: "400px",
				marginTop: $.this[css.height],
				marginLeft: $`${$.innerWidth.sub(400).div(2)}px`,
				textAlign: "center",
			}
		}}>HyperStandard</h1>
	</div>
`)