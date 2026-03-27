import { $, h as html, on, css, io } from "./mod.js";

// ============================================================================
// Responsive helpers
// ============================================================================

const width = $(innerWidth).from(set =>
	addEventListener("resize", () => set(innerWidth), { passive: true })
);

const isMobile = width.into(w => w < 768);
const containerPad = isMobile.isit("20px", "0");

// ============================================================================
// Design tokens
// ============================================================================

const color = {
	bg:       "#02030f",
	surface:  "#0a0b1a",
	card:     "#111226",
	border:   "#1e1f3a",
	text:     "#e8e9f0",
	muted:    "#8b8ca8",
	accent:   "#6c7aff",
	accentAlt:"#9b6cff",
	white:    "#f3f4ff",
};

const font = {
	sans:  "'Inter Tight', system-ui, -apple-system, sans-serif",
	mono:  "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
};

// ============================================================================
// Shared styles
// ============================================================================

const resetBody = () => {
	Object.assign(document.documentElement.style, {
		boxSizing: "border-box",
		margin: "0",
		padding: "0",
		scrollBehavior: "smooth",
	});
	Object.assign(document.body.style, {
		margin: "0",
		padding: "0",
		backgroundColor: color.bg,
		color: color.text,
		fontFamily: font.sans,
		lineHeight: "1.6",
		overflowX: "hidden",
	});
};

const sectionStyle = {
	[css]: {
		maxWidth: "860px",
		marginLeft: "auto",
		marginRight: "auto",
		padding: isMobile.isit("60px 24px", "80px 40px"),
	}
};

// ============================================================================
// Code display
// ============================================================================

const Code = (lines) => {
	const codeText = lines.join("\n");
	const copied = $(false);
	const label = copied.isit("Copied!", "Copy");

	return html`<div ${{
		[css]: {
			position: "relative",
			backgroundColor: color.surface,
			border: $`1px solid ${color.border}`,
			borderRadius: "8px",
			padding: "20px 24px",
			marginTop: "16px",
			marginBottom: "16px",
			overflowX: "auto",
		}
	}}>
		<button ${{
			[on.click]: () => {
				navigator.clipboard?.writeText(codeText);
				copied.$ = true;
				setTimeout(() => copied.$ = false, 1500);
			},
			[css]: {
				position: "absolute",
				top: "12px",
				right: "12px",
				backgroundColor: color.card,
				color: color.muted,
				border: $`1px solid ${color.border}`,
				borderRadius: "4px",
				padding: "4px 10px",
				fontSize: "12px",
				fontFamily: font.mono,
				cursor: "pointer",
			}
		}}>${label}</button>
		<pre ${{
			[css]: {
				margin: "0",
				fontFamily: font.mono,
				fontSize: isMobile.isit("13px", "14px"),
				lineHeight: "1.7",
				color: color.white,
				whiteSpace: "pre",
				tabSize: "4",
			}
		}}>${codeText}</pre>
	</div>`;
};

const InlineCode = (text) => html`<code ${{
	[css]: {
		backgroundColor: color.surface,
		border: $`1px solid ${color.border}`,
		borderRadius: "4px",
		padding: "2px 6px",
		fontFamily: font.mono,
		fontSize: "0.9em",
		color: color.accent,
	}
}}>${text}</code>`;

// ============================================================================
// Link
// ============================================================================

const Link = (href, child) => html`<a ${{
	href,
	target: "_blank",
	rel: "noopener",
	[css]: {
		color: color.accent,
		textDecoration: "none",
	}
}}>${child}</a>`;

// ============================================================================
// Hero
// ============================================================================

const Hero = () => {
	const logoWidth = width.into(w => Math.min(w * 0.3, 140));

	return html`<header ${{
		[css]: {
			width: "100%",
			minHeight: isMobile.isit("85vh", "90vh"),
			backgroundImage: "url(./resources/hstd-wireframe.svg)",
			backgroundSize: "cover",
			backgroundPosition: "center",
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center",
			textAlign: "center",
			padding: "40px 24px",
		}
	}}>
		<img ${{
			src: "./resources/hstd.svg",
			alt: "HyperStandard logo",
			[css]: {
				width: $`${logoWidth}px`,
				marginBottom: "32px",
			}
		}}>
		<h1 ${{
			[css]: {
				color: color.white,
				fontSize: isMobile.isit("36px", "56px"),
				fontWeight: "800",
				margin: "0 0 12px",
				letterSpacing: "-1px",
			}
		}}>HyperStandard</h1>
		<p ${{
			[css]: {
				color: color.muted,
				fontSize: isMobile.isit("18px", "22px"),
				fontWeight: "500",
				margin: "0 0 48px",
			}
		}}>Fast. Interactive. Web Interface.</p>

		<div ${{
			[css]: {
				display: "flex",
				flexDirection: isMobile.isit("column", "row"),
				gap: "16px",
				alignItems: "center",
			}
		}}>
			<a ${{
				href: "https://github.com/hstd-dev/hstd",
				target: "_blank",
				[css]: {
					display: "inline-block",
					padding: "14px 32px",
					background: $`linear-gradient(135deg, ${color.accent}, ${color.accentAlt})`,
					color: color.white,
					borderRadius: "100px",
					fontSize: "16px",
					fontWeight: "600",
					fontFamily: font.sans,
					textDecoration: "none",
					border: "none",
					minWidth: "180px",
				}
			}}>Get Started</a>
			<a ${{
				href: "https://www.npmjs.com/package/hstd",
				target: "_blank",
				[css]: {
					display: "inline-block",
					padding: "14px 32px",
					backgroundColor: "transparent",
					color: color.white,
					borderRadius: "100px",
					fontSize: "16px",
					fontWeight: "600",
					fontFamily: font.sans,
					textDecoration: "none",
					border: $`1px solid ${color.border}`,
					minWidth: "180px",
				}
			}}>npm i hstd</a>
		</div>

		<div ${{
			[css]: {
				marginTop: "32px",
				display: "flex",
				gap: "12px",
			}
		}}>
			${Link("https://www.npmjs.com/package/hstd",
				html`<img ${{ src: "https://img.shields.io/npm/v/hstd?logo=npm&color=%23CC3534", alt: "npm" }}>`
			)}
			${Link("https://bundlephobia.com/package/hstd",
				html`<img ${{ src: "https://img.shields.io/bundlejs/size/hstd?logo=stackblitz", alt: "size" }}>`
			)}
		</div>
	</header>`;
};

// ============================================================================
// Quick Start
// ============================================================================

const QuickStart = () => html`<section ${{ ...sectionStyle }}>
	<h2 ${{
		[css]: {
			fontSize: isMobile.isit("28px", "36px"),
			fontWeight: "700",
			marginBottom: "16px",
		}
	}}>Quick Start</h2>
	<p ${{ [css.color]: color.muted }}>Install from npm and start building in seconds.</p>

	${Code(["npm i hstd"])}

	${Code([
		'import { $, h as html, on } from "hstd"',
		"",
		"const count = $(0);",
		"",
		"document.body[html] = html`",
		"    <h1>Count is ${count}</h1>",
		'    <button ${{ [on.click]: () => count.$++ }}>',
		"        Click me!",
		"    </button>",
		"`;",
	])}
</section>`;

// ============================================================================
// Features
// ============================================================================

const FeatureCard = (title, description, code) => html`<div ${{
	[css]: {
		backgroundColor: color.card,
		border: $`1px solid ${color.border}`,
		borderRadius: "12px",
		padding: "28px",
	}
}}>
	<h3 ${{
		[css]: {
			fontSize: "18px",
			fontWeight: "700",
			margin: "0 0 8px",
			color: color.white,
		}
	}}>${title}</h3>
	<p ${{
		[css]: {
			fontSize: "14px",
			color: color.muted,
			margin: "0 0 16px",
			lineHeight: "1.5",
		}
	}}>${description}</p>
	${Code(code)}
</div>`;

const Features = () => html`<section ${{ ...sectionStyle }}>
	<h2 ${{
		[css]: {
			fontSize: isMobile.isit("28px", "36px"),
			fontWeight: "700",
			marginBottom: "8px",
		}
	}}>Features</h2>
	<p ${{
		[css]: {
			color: color.muted,
			marginBottom: "32px",
		}
	}}>Everything you need. Nothing you don't.</p>

	<div ${{
		[css]: {
			display: "grid",
			gridTemplateColumns: isMobile.isit("1fr", "1fr 1fr"),
			gap: "20px",
		}
	}}>
		${FeatureCard(
			"Reactive Pointers",
			"Fine-grained reactivity with automatic DOM updates. No virtual DOM, no diffing.",
			[
				"const name = $('World');",
				"html`<h1>Hello ${name}</h1>`;",
				"",
				'name.$ = "hstd"; // DOM updates',
			]
		)}

		${FeatureCard(
			"Tagged Templates",
			"Write HTML naturally with template literals. Interpolate reactive values inline.",
			[
				"html`",
				"  <ul>",
				"    ${items.into(i =>",
				"      html`<li>${i}</li>`",
				"    )}",
				"  </ul>",
				"`;",
			]
		)}

		${FeatureCard(
			"CSS & Event Binding",
			"Declarative property binding with css, on, and io modules.",
			[
				"html`<button ${{",
				"  [on.click]: () => count.$++,",
				"  [css.color]: color,",
				"  [io.value]: pointer,",
				"}}>Click</button>`;",
			]
		)}

		${FeatureCard(
			"Async Generators",
			"Stream UI updates with async iterators for loading states and wizards.",
			[
				"const Page = async function*() {",
				'  yield html`<p>Loading...</p>`;',
				"  const data = await fetch(url);",
				"  yield html`<p>${data}</p>`;",
				"}",
			]
		)}

		${FeatureCard(
			"Reactive Arrays",
			"Track array mutations and update lists automatically.",
			[
				'const list = $(["a", "b"]);',
				'list.push("c"); // DOM updates',
				"list.sort();    // DOM re-renders",
			]
		)}

		${FeatureCard(
			"Property Bundles",
			"Bundle related properties with $.this cross-references.",
			[
				"[css]: {",
				"  backgroundColor: primary,",
				"  color: $.this.backgroundColor,",
				"}",
			]
		)}
	</div>
</section>`;

// ============================================================================
// Live Demos
// ============================================================================

const DemoContainer = (title, demo) => html`<div ${{
	[css]: {
		backgroundColor: color.card,
		border: $`1px solid ${color.border}`,
		borderRadius: "12px",
		padding: "28px",
		marginBottom: "20px",
	}
}}>
	<h3 ${{
		[css]: {
			fontSize: "16px",
			fontWeight: "700",
			color: color.muted,
			margin: "0 0 16px",
			textTransform: "uppercase",
			letterSpacing: "1px",
		}
	}}>${title}</h3>
	${demo}
</div>`;

const CounterDemo = () => {
	const count = $(0);
	const doubled = count.mul(2);
	const label = count.into(n =>
		n === 0 ? "not yet" : n === 1 ? "1 time" : n + " times"
	);

	return html`
		<p ${{ [css]: { fontSize: "20px", margin: "0 0 16px", color: color.white } }}>
			Clicked: ${label} (doubled: ${doubled})
		</p>
		<div ${{ [css]: { display: "flex", gap: "12px", flexWrap: "wrap" } }}>
			<button ${{
				[on.click]: () => count.$++,
				[css]: {
					padding: "10px 24px",
					background: color.accent,
					color: color.white,
					border: "none",
					borderRadius: "6px",
					fontSize: "15px",
					fontFamily: font.sans,
					fontWeight: "600",
					cursor: "pointer",
				}
			}}>Increment</button>
			<button ${{
				[on.click]: () => count.$ = 0,
				[css]: {
					padding: "10px 24px",
					backgroundColor: "transparent",
					color: color.muted,
					border: $`1px solid ${color.border}`,
					borderRadius: "6px",
					fontSize: "15px",
					fontFamily: font.sans,
					cursor: "pointer",
				}
			}}>Reset</button>
		</div>
	`;
};

const BindingDemo = () => {
	const text = $("");
	const len = text.into(t => t.length);
	const display = text.isit(text, $("Type something..."));

	return html`
		<input ${{
			[io.value]: text,
			type: "text",
			placeholder: "Type here...",
			[css]: {
				width: "100%",
				padding: "12px 16px",
				backgroundColor: color.surface,
				color: color.white,
				border: $`1px solid ${color.border}`,
				borderRadius: "6px",
				fontSize: "15px",
				fontFamily: font.sans,
				outline: "none",
				boxSizing: "border-box",
			}
		}}>
		<p ${{ [css]: { color: color.white, margin: "12px 0 4px" } }}>
			Mirror: ${display}
		</p>
		<p ${{ [css]: { color: color.muted, margin: "0", fontSize: "14px" } }}>
			Length: ${len}
		</p>
	`;
};

const ColorDemo = () => {
	const hue = $(220);
	const bg = hue.into(h => `hsl(${h}, 70%, 55%)`);
	const label = hue.into(h => `hsl(${h}, 70%, 55%)`);

	return html`
		<div ${{
			[css]: {
				width: "100%",
				height: "80px",
				borderRadius: "8px",
				backgroundColor: bg,
				marginBottom: "12px",
				transition: "background-color 0.15s",
			}
		}}></div>
		<input ${{
			[io.value]: hue,
			type: "range",
			min: "0",
			max: "360",
			[css]: {
				width: "100%",
				accentColor: color.accent,
			}
		}}>
		<p ${{ [css]: { color: color.muted, margin: "8px 0 0", fontSize: "14px", fontFamily: font.mono } }}>
			${label}
		</p>
	`;
};

const LiveDemos = () => html`<section ${{
	...sectionStyle,
	[css]: {
		...sectionStyle[css],
		backgroundColor: color.surface,
		maxWidth: "none",
		borderTop: $`1px solid ${color.border}`,
		borderBottom: $`1px solid ${color.border}`,
	}
}}>
	<div ${{
		[css]: {
			maxWidth: "860px",
			marginLeft: "auto",
			marginRight: "auto",
		}
	}}>
		<h2 ${{
			[css]: {
				fontSize: isMobile.isit("28px", "36px"),
				fontWeight: "700",
				marginBottom: "8px",
			}
		}}>Try It Live</h2>
		<p ${{
			[css]: {
				color: color.muted,
				marginBottom: "32px",
			}
		}}>Interactive demos running on this page, built with hstd.</p>

		<div ${{
			[css]: {
				display: "grid",
				gridTemplateColumns: isMobile.isit("1fr", "1fr 1fr"),
				gap: "20px",
			}
		}}>
			${DemoContainer("Counter with Derived State", CounterDemo())}
			${DemoContainer("Two-Way Binding", BindingDemo())}
		</div>
		${DemoContainer("Reactive CSS", ColorDemo())}
	</div>
</section>`;

// ============================================================================
// Ecosystem
// ============================================================================

const PackageCard = (name, description) => html`<div ${{
	[css]: {
		backgroundColor: color.card,
		border: $`1px solid ${color.border}`,
		borderRadius: "8px",
		padding: "20px 24px",
	}
}}>
	<code ${{
		[css]: {
			fontSize: "16px",
			fontFamily: font.mono,
			fontWeight: "700",
			color: color.accent,
		}
	}}>${name}</code>
	<p ${{
		[css]: {
			fontSize: "14px",
			color: color.muted,
			margin: "8px 0 0",
		}
	}}>${description}</p>
</div>`;

const Ecosystem = () => html`<section ${{ ...sectionStyle }}>
	<h2 ${{
		[css]: {
			fontSize: isMobile.isit("28px", "36px"),
			fontWeight: "700",
			marginBottom: "8px",
		}
	}}>Ecosystem</h2>
	<p ${{
		[css]: {
			color: color.muted,
			marginBottom: "32px",
		}
	}}>Modular packages for different needs.</p>

	<div ${{
		[css]: {
			display: "grid",
			gridTemplateColumns: isMobile.isit("1fr", "1fr 1fr 1fr"),
			gap: "16px",
		}
	}}>
		${PackageCard("hstd", "Core library — reactive state, DOM templates, CSS/event/IO bindings.")}
		${PackageCard("@hstd/ts", "TypeScript LSP plugin — completions and diagnostics for any editor.")}
		${PackageCard("@hstd/wc", "Web Components adapter — use hstd components as custom elements.")}
	</div>
</section>`;

// ============================================================================
// API Overview
// ============================================================================

const ApiRow = (api, desc) => html`<div ${{
	[css]: {
		display: "grid",
		gridTemplateColumns: isMobile.isit("1fr", "180px 1fr"),
		gap: isMobile.isit("4px", "16px"),
		padding: "14px 0",
		borderBottom: $`1px solid ${color.border}`,
	}
}}>
	<code ${{
		[css]: {
			fontFamily: font.mono,
			fontSize: "14px",
			color: color.accent,
			fontWeight: "600",
		}
	}}>${api}</code>
	<span ${{ [css]: { color: color.muted, fontSize: "14px" } }}>${desc}</span>
</div>`;

const ApiOverview = () => html`<section ${{ ...sectionStyle }}>
	<h2 ${{
		[css]: {
			fontSize: isMobile.isit("28px", "36px"),
			fontWeight: "700",
			marginBottom: "8px",
		}
	}}>API at a Glance</h2>
	<p ${{
		[css]: {
			color: color.muted,
			marginBottom: "24px",
		}
	}}>The full surface area, in one view.</p>

	<div ${{
		[css]: {
			backgroundColor: color.card,
			border: $`1px solid ${color.border}`,
			borderRadius: "12px",
			padding: "8px 24px",
		}
	}}>
		${ApiRow("$(value)", "Create a reactive Pointer")}
		${ApiRow("$([array])", "Create a reactive ArrayPointer")}
		${ApiRow("$`tmpl ${ptr}`", "Template literal Pointer")}
		${ApiRow("html`<tag>...</tag>`", "Create DOM fragment")}
		${ApiRow("[on.event]: fn", "Bind DOM event handler")}
		${ApiRow("[css.prop]: value", "Bind CSS property")}
		${ApiRow("[io.prop]: pointer", "Two-way form binding")}
		${ApiRow("$.this.prop", "Reference sibling in property bundle")}
		${ApiRow("ptr.into(fn)", "Derive transformed Pointer")}
		${ApiRow("ptr.watch(fn)", "Observe value changes")}
		${ApiRow("ptr.isit(t, f)", "Conditional derived value")}
		${ApiRow("ptr.timeout(ms)", "Debounce pointer updates")}
		${ApiRow("ptr.sum/sub/mul/div", "Arithmetic operations")}
		${ApiRow("ptr.is/seq/or/and", "Logic operations")}
		${ApiRow("arr.push/pop/shift", "Mutate reactive array")}
		${ApiRow("arr.find/some/every", "Reactive array queries")}
	</div>
</section>`;

// ============================================================================
// Footer
// ============================================================================

const Footer = () => html`<footer ${{
	[css]: {
		borderTop: $`1px solid ${color.border}`,
		padding: isMobile.isit("40px 24px", "48px 40px"),
		textAlign: "center",
	}
}}>
	<div ${{
		[css]: {
			display: "flex",
			justifyContent: "center",
			gap: "24px",
			marginBottom: "20px",
			flexWrap: "wrap",
		}
	}}>
		${Link("https://github.com/hstd-dev/hstd", "GitHub")}
		${Link("https://www.npmjs.com/package/hstd", "npm")}
		${Link("https://bundlephobia.com/package/hstd", "Bundlephobia")}
		${Link("https://stackblitz.com/edit/vitejs-vite-vcga6uwx?file=main.js", "StackBlitz")}
	</div>
	<p ${{
		[css]: {
			color: color.muted,
			fontSize: "14px",
			margin: "0",
		}
	}}>
		hstd is ${Link("https://opensource.org/license/mit", "MIT licensed")}.
		Built with hstd.
	</p>
</footer>`;

// ============================================================================
// Mount
// ============================================================================

resetBody();

document.body.append(...html`
	${Hero()}
	${QuickStart()}
	${Features()}
	${LiveDemos()}
	${ApiOverview()}
	${Ecosystem()}
	${Footer()}
`);
