#!/usr/bin/env node

import { mkdir, writeFile, access } from "node:fs/promises";
import { resolve, join, basename } from "node:path";

// ============================================================================
// CLI argument parsing
// ============================================================================

const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith("-")));
const positional = args.filter(a => !a.startsWith("-"));

const projectName = positional[0];
const useTS = flags.has("--ts") || flags.has("--typescript");

if (!projectName || flags.has("--help") || flags.has("-h")) {
	console.log(`
  Usage: npm create hstd <project-name> [options]

  Options:
    --ts, --typescript   Use TypeScript template
    -h, --help           Show this help message

  Examples:
    npm create hstd my-app
    npm create hstd my-app --ts
`);
	process.exit(projectName ? 0 : 1);
}

// ============================================================================
// Template definitions
// ============================================================================

const pkgName = basename(projectName).toLowerCase().replace(/[^a-z0-9-]/g, "-");

const indexHtml = (entry) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/hstd.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${pkgName}</title>
  </head>
  <body>
    <script type="module" src="/src/${entry}"></script>
  </body>
</html>
`;

const gitignore = `node_modules
dist
*.local
`;

const appModule = (ext) => `import { $, h as html, on, css } from "@hstd/std"
import hstdLogo from "./assets/hstd.svg"
import viteLogo from "./assets/vite.svg"

const link = {
  [css]: {
    color: "inherit",
    textDecoration: "none",
  }
};

const btnStyle = {
  [css]: {
    fontFamily: "var(--mono)",
    fontSize: "16px",
    padding: "5px 10px",
    borderRadius: "5px",
    color: "var(--accent)",
    background: "var(--accent-bg)",
    border: "2px solid transparent",
    cursor: "pointer",
  }
};

const logoStyle = (size = "96px") => ({
  [css]: {
    height: size,
    willChange: "filter",
    transition: "filter 0.3s",
  }
});

function Counter() {
  const count = $(0);

  return html\`
    <button \${{
      ...btnStyle,
      [on.click]: () => count.\$++,
    }}>Count is \${count}</button>
  \`;
}

function LinkButton(href, label, iconSrc) {
  return html\`
    <a \${{
      href, target: "_blank",
      [css]: {
        color: "var(--text-h)",
        fontSize: "16px",
        borderRadius: "6px",
        background: "var(--social-bg)",
        display: "flex",
        padding: "6px 12px",
        alignItems: "center",
        gap: "8px",
        textDecoration: "none",
      }
    }}>\${iconSrc
      ? html\`<img \${{ src: iconSrc, alt: "", [css]: { height: "18px", width: "18px" } }}>\`
      : ""
    }\${label}</a>
  \`;
}

export function App() {
  return html\`
    <div \${{
      [css]: {
        width: "1126px",
        maxWidth: "100%",
        margin: "0 auto",
        textAlign: "center",
        borderInline: "1px solid var(--border)",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }
    }}>

      <section \${{
        [css]: {
          display: "flex",
          flexDirection: "column",
          gap: "25px",
          placeContent: "center",
          placeItems: "center",
          flexGrow: "1",
          padding: "32px 20px",
        }
      }}>
        <div \${{ [css]: { display: "flex", justifyContent: "center", gap: "32px" } }}>
          <a \${{ ...link, href: "https://hstd.io", target: "_blank" }}>
            <img \${{ ...logoStyle(), src: hstdLogo, alt: "hstd logo" }}>
          </a>
          <a \${{ ...link, href: "https://vite.dev", target: "_blank" }}>
            <img \${{ ...logoStyle("88px"), src: viteLogo, alt: "Vite logo" }}>
          </a>
        </div>

        <div>
          <h1 \${{
            [css]: {
              fontSize: "56px",
              letterSpacing: "-1.68px",
              margin: "32px 0",
              fontWeight: "500",
              color: "var(--text-h)",
            }
          }}>hstd + Vite</h1>
          <p>Edit <code>src/App.${ext}</code> and save to test HMR</p>
        </div>

        \${Counter()}
      </section>

      <section \${{
        [css]: {
          display: "flex",
          borderTop: "1px solid var(--border)",
          textAlign: "left",
        }
      }}>
        <div \${{ [css]: { flex: "1 1 0", padding: "32px", borderRight: "1px solid var(--border)" } }}>
          <h2 \${{ [css]: { fontSize: "24px", fontWeight: "500", color: "var(--text-h)", margin: "0 0 8px" } }}>
            Documentation
          </h2>
          <p>Learn the fundamentals</p>
          <div \${{ [css]: { display: "flex", gap: "8px", marginTop: "32px" } }}>
            \${LinkButton("https://hstd.io", "Explore hstd", hstdLogo)}
            \${LinkButton("https://vite.dev", "Explore Vite", viteLogo)}
          </div>
        </div>

        <div \${{ [css]: { flex: "1 1 0", padding: "32px" } }}>
          <h2 \${{ [css]: { fontSize: "24px", fontWeight: "500", color: "var(--text-h)", margin: "0 0 8px" } }}>
            Community
          </h2>
          <p>Get involved</p>
          <div \${{ [css]: { display: "flex", gap: "8px", marginTop: "32px" } }}>
            \${LinkButton("https://github.com/hstd-dev/hstd", "GitHub")}
            \${LinkButton("https://www.npmjs.com/package/@hstd/std", "npm")}
          </div>
        </div>
      </section>

      <div \${{ [css]: { height: "88px", borderTop: "1px solid var(--border)" } }}></div>
    </div>
  \`;
}
`;

const mainModule = (ext) => `import "./style.css"
import { h as html } from "@hstd/std"
import { App } from "./App.${ext}"

document.body[html] = App();

if (import.meta.hot) {
  import.meta.hot.accept("./App.${ext}", (mod) => {
    document.body[html] = mod.App();
  });
}
`;

const styleCss = `:root {
  --text: #6b6375;
  --text-h: #08060d;
  --bg: #fff;
  --border: #e5e4e7;
  --code-bg: #f4f3ec;
  --accent: #646cff;
  --accent-bg: rgba(100, 108, 255, 0.1);
  --social-bg: rgba(244, 243, 236, 0.5);

  --sans: system-ui, "Segoe UI", Roboto, sans-serif;
  --mono: ui-monospace, Consolas, monospace;

  font: 18px/145% var(--sans);
  color-scheme: light dark;
  color: var(--text);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
}

@media (prefers-color-scheme: dark) {
  :root {
    --text: #9ca3af;
    --text-h: #f3f4f6;
    --bg: #16171d;
    --border: #2e303a;
    --code-bg: #1f2028;
    --accent: #818cf8;
    --accent-bg: rgba(129, 140, 248, 0.15);
    --social-bg: rgba(47, 48, 58, 0.5);
  }
}

body { margin: 0; }
p { margin: 0; }

code {
  font-family: var(--mono);
  font-size: 15px;
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--code-bg);
  color: var(--text-h);
}
`;

// hstd logo SVG (simplified from docs/resources/hstd.svg)
const hstdLogoSvg = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="22" height="98" rx="11" fill="currentColor"/><rect x="77" y="1" width="22" height="98" rx="11" fill="currentColor"/><rect x="1" y="39" width="98" height="22" rx="11" fill="currentColor"/></svg>`;

// Vite logo SVG
const viteSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="46" fill="none" viewBox="0 0 48 46"><path fill="#863bff" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" style="fill:#863bff;fill:color(display-p3 .5252 .23 1);fill-opacity:1"/></svg>`;

const packageJson = (isTS) => JSON.stringify({
	name: pkgName,
	private: true,
	version: "0.0.0",
	type: "module",
	scripts: {
		dev: "vite",
		build: "vite build",
		preview: "vite preview",
	},
	dependencies: {
		"@hstd/std": "^0.1.0",
	},
	devDependencies: {
		vite: "^6.0.0",
		...(isTS ? {
			typescript: "^5.7.0",
			"@hstd/ts": "^0.1.0",
		} : {}),
	},
}, null, 2) + "\n";

const tsconfig = JSON.stringify({
	compilerOptions: {
		target: "ES2022",
		module: "ESNext",
		moduleResolution: "bundler",
		strict: true,
		noEmit: true,
		isolatedModules: true,
		skipLibCheck: true,
		plugins: [
			{ name: "@hstd/ts" },
		],
	},
	include: ["src"],
}, null, 2) + "\n";

const viteConfigTS = `import { defineConfig } from "vite"

export default defineConfig({})
`;

// ============================================================================
// File writing
// ============================================================================

async function scaffold() {
	const root = resolve(process.cwd(), projectName);

	try {
		await access(root);
		console.error(`\n  Error: directory "${projectName}" already exists.\n`);
		process.exit(1);
	} catch {
		// directory does not exist — proceed
	}

	const write = async (path, content) => {
		const full = join(root, path);
		await mkdir(join(full, ".."), { recursive: true });
		await writeFile(full, content);
	};

	const ext = useTS ? "ts" : "js";

	await write("index.html", indexHtml(`main.${ext}`));
	await write("package.json", packageJson(useTS));
	await write(".gitignore", gitignore);
	await write(`src/main.${ext}`, mainModule(ext));
	await write(`src/App.${ext}`, appModule(ext));
	await write("src/style.css", styleCss);
	await write("src/assets/hstd.svg", hstdLogoSvg);
	await write("src/assets/vite.svg", viteSvg);
	await write("public/hstd.svg", hstdLogoSvg);

	if (useTS) {
		await write("tsconfig.json", tsconfig);
		await write("vite.config.ts", viteConfigTS);
	}

	const pm = detectPackageManager();
	const installCmd = pm === "yarn" ? "yarn" : `${pm} install`;
	const devCmd = pm === "yarn" ? "yarn dev" : `${pm} run dev`;

	console.log(`
  Done! Created ${pkgName} at ${root}

  To get started:

    cd ${projectName}
    ${installCmd}
    ${devCmd}
`);
}

function detectPackageManager() {
	const ua = process.env.npm_config_user_agent || "";
	if (ua.startsWith("yarn")) return "yarn";
	if (ua.startsWith("pnpm")) return "pnpm";
	if (ua.startsWith("bun")) return "bun";
	return "npm";
}

scaffold().catch(err => {
	console.error(err);
	process.exit(1);
});
