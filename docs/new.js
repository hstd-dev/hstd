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
	padding: 0,
	backgroundColor: "#02030f"
});

const logoWidth = $.innerWidth.mul(0.3).into($ => $ > 160 ? 160 : $);

const basicBlack = "#02030f"
const textBlack = "#000001"
const basicWhite = "#f3f4ff"


const isPC = $.innerWidth.into($ => $ > 600)

const buttonStyle = {
	[css]: {
		fontFamily: "Inter Tight",
		fontWeight: 600,
		fontSize: "16px",
		backgroundColor: basicWhite,
		color: "#02030f",
		borderRadius: "190px",
		border: "none",
		textAlign: "center",
		textDecoration: "none",
		userSelect: "none",
		lineHeight: $`${isPC.into($ => $ ? 40 : 50)}px`
	}
}

document.body.append(...html`
	<div ${{
		[css]: {
			width: "100%",
			backgroundColor: "#025dff",
			overflow: "hidden"
		}
	}}>
		<img ${{
			src: "./resources/hstd.svg",
			[css]: {
				width: $`${logoWidth}px`,
				marginLeft: $`${$.innerWidth.sub(logoWidth).div(2)}px`,
				marginTop: "100px",
				marginBottom: "40px"
			}
		}}>
		<h1 ${{
			[css]: {
				color: basicWhite,
				width: "100%",
				marginTop: 0,
				marginBottom: "10px",
				textAlign: "center",

				fontSize: "50px",
				fontFamily: "Inter Tight",
				fontWeight: 700,
			}
		}}>HyperStandard</h1>
		<h3 ${{
			[css]: {
				color: basicWhite,
				fontFamily: "Inter Tight",
				fontSize: "22px",
				fontWeight: 600,
				width: "100%",
				textAlign: "center"
			}
		}}>Fast. Interactive. Web Interface.</h3>

		<!-- button container -->
		<div ${{
			[css]: {
				width: $`${isPC.into($ => $ ? 380 : 210)}px`,
				height: $`${isPC.into($ => $ ? 40 : 100)}px`,
				marginTop: "60px",
				marginBottom: "150px",
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
				},
				href: "./get-started"
			}}>Get Started</a>
			<a ${{
				...buttonStyle, 
				href: "./docs"
			}}>View Documentation</a>
		</div>
	</div>
`)