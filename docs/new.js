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

const logoWidth = $.innerWidth.mul(0.3).into($ => $ > 200 ? 200 : $);

const basicWhite = "#f3f4ff"


const isPC = $.innerWidth.into($ => $ > 600)

const buttonStyle = {
	[css]: {
		fontFamily: "Inter Tight",
		fontWeight: 600,
		backgroundColor: basicWhite,
		color: "#02030f",
		borderRadius: "190px",
		border: "none",
		fontSize: "16px",
		textAlign: "center",
		userSelect: "none",
		lineHeight: $`${isPC.into($ => $ ? 40 : 50)}px`
	}
}

document.body.append(...html`
	<div ${{
		[css]: {
			width: "100%",
			height: "800px",
			backgroundColor: "#025dff",
			overflow: "hidden"
		}
	}}>
		<img ${{
			src: "./resources/hstd.svg",
			[css]: {
				width: $`${logoWidth}px`,
				marginLeft: $`${$.innerWidth.sub(logoWidth).div(2)}px`,
				marginTop: "160px",
				marginBottom: "10px"
			}
		}}>
		<h1 ${{
			[css]: {
				color: basicWhite,
				width: "400px",
				marginTop: 0,
				marginLeft: $`${$.innerWidth.sub(400).div(2)}px`,
				textAlign: "center",

				fontSize: "40px",
				fontFamily: "Inter Tight",
				fontWeight: "bold",
			}
		}}>HyperStandard</h1>
		<h3 ${{
			[css]: {
				color: basicWhite,
				fontFamily: "Inter Tight",
				fontWeight: 550,
				width: "100%",
				textAlign: "center",
				fontStyle: "italic"
			}
		}}>Fast. Interactive. Web Interface.</h3>

		<!-- button container -->
		<div ${{
			[css]: {
				width: $`${isPC.into($ => $ ? 380 : 210)}px`,
				height: $`${isPC.into($ => $ ? 40 : 100)}px`,
				marginTop: "60px",
				marginLeft: $`${$.innerWidth.sub(isPC.into($ => $ ? 380 : 210)).div(2)}px`,

				display: "grid",
				gridTemplateColumns: isPC.into($ => $ ? "auto auto" : ""),
				gridTemplateRows: isPC.into($ => $ ? "" : "auto auto"),
				gap: "20px",
			}
		}}>
			<a ${{
				...buttonStyle,
				[css]: {
					backgroundColor: "#02030f",
					color: basicWhite,
					// fontSize: {
					// 	default: "200px",
					// 	[on.hover]: "300px"
					// }
				}
			}}>Get Started</a>
			<a ${{ ...buttonStyle }}>View Documentation</a>
		</div>
	</div>
`)