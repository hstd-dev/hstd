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
    <div id="app"></div>
    <script type="module" src="/src/${entry}"></script>
  </body>
</html>
`;

const gitignore = `node_modules
dist
*.local
`;

const counterModule = (ext) => `import { $, h as html, on } from "@hstd/std"

export function setupCounter(element) {
  const count = import.meta.hot?.data?.count ?? $(0);

  element[html] = html\`
    <button \${{
      [on.click]: () => count.\$++,
    }}>Count is \${count}</button>
  \`;

  if (import.meta.hot) {
    import.meta.hot.dispose((data) => { data.count = count; });
    import.meta.hot.accept();
  }
}
`;

const mainModule = (ext) => `import "./style.css"
import { h as html } from "@hstd/std"
import { setupCounter } from "./counter.${ext}"
import hstdLogo from "./assets/hstd.svg"
import viteLogo from "./assets/vite.svg"

document.querySelector("#app").innerHTML = \`
<section id="center">
  <div class="hero">
    <a href="https://hstd.io" target="_blank">
      <img src="\${hstdLogo}" class="logo" alt="hstd logo" />
    </a>
    <a href="https://vite.dev" target="_blank">
      <img src="\${viteLogo}" class="logo vite" alt="Vite logo" />
    </a>
  </div>
  <div>
    <h1>hstd + Vite</h1>
    <p>Edit <code>src/counter.${ext}</code> and save to test <code>HMR</code></p>
  </div>
  <div id="counter"></div>
</section>

<div class="ticks"></div>

<section id="next-steps">
  <div id="docs">
    <h2>Documentation</h2>
    <p>Learn the fundamentals</p>
    <ul>
      <li>
        <a href="https://hstd.io" target="_blank">
          <img class="button-icon" src="\${hstdLogo}" alt="" />
          Explore hstd
        </a>
      </li>
      <li>
        <a href="https://vite.dev/" target="_blank">
          <img class="button-icon" src="\${viteLogo}" alt="" />
          Explore Vite
        </a>
      </li>
    </ul>
  </div>
  <div id="social">
    <h2>Community</h2>
    <p>Get involved</p>
    <ul>
      <li><a href="https://github.com/hstd-dev/hstd" target="_blank">GitHub</a></li>
      <li><a href="https://www.npmjs.com/package/@hstd/std" target="_blank">npm</a></li>
    </ul>
  </div>
</section>

<div class="ticks"></div>
<section id="spacer"></section>
\`;

setupCounter(document.querySelector("#counter"));
`;

const styleCss = `:root {
  --text: #6b6375;
  --text-h: #08060d;
  --bg: #fff;
  --border: #e5e4e7;
  --code-bg: #f4f3ec;
  --accent: #646cff;
  --accent-bg: rgba(100, 108, 255, 0.1);
  --accent-border: rgba(100, 108, 255, 0.5);
  --social-bg: rgba(244, 243, 236, 0.5);
  --shadow:
    rgba(0, 0, 0, 0.1) 0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px;

  --sans: system-ui, 'Segoe UI', Roboto, sans-serif;
  --mono: ui-monospace, Consolas, monospace;

  font: 18px/145% var(--sans);
  letter-spacing: 0.18px;
  color-scheme: light dark;
  color: var(--text);
  background: var(--bg);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  @media (max-width: 1024px) {
    font-size: 16px;
  }
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
    --accent-border: rgba(129, 140, 248, 0.5);
    --social-bg: rgba(47, 48, 58, 0.5);
    --shadow:
      rgba(0, 0, 0, 0.4) 0 10px 15px -3px, rgba(0, 0, 0, 0.25) 0 4px 6px -2px;
  }
}

body {
  margin: 0;
}

h1,
h2 {
  font-family: var(--sans);
  font-weight: 500;
  color: var(--text-h);
}

h1 {
  font-size: 56px;
  letter-spacing: -1.68px;
  margin: 32px 0;
  @media (max-width: 1024px) {
    font-size: 36px;
    margin: 20px 0;
  }
}
h2 {
  font-size: 24px;
  line-height: 118%;
  letter-spacing: -0.24px;
  margin: 0 0 8px;
  @media (max-width: 1024px) {
    font-size: 20px;
  }
}
p {
  margin: 0;
}

code {
  font-family: var(--mono);
  font-size: 15px;
  line-height: 135%;
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--code-bg);
  color: var(--text-h);
}

button {
  font-family: var(--mono);
  font-size: 16px;
  display: inline-flex;
  padding: 5px 10px;
  border-radius: 5px;
  color: var(--accent);
  background: var(--accent-bg);
  border: 2px solid transparent;
  transition: border-color 0.3s;
  cursor: pointer;
  margin-bottom: 24px;

  &:hover {
    border-color: var(--accent-border);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

.hero {
  display: flex;
  justify-content: center;
  gap: 32px;

  .logo {
    height: 96px;
    transition: filter 0.3s;
    will-change: filter;

    &:hover {
      filter: drop-shadow(0 0 16px var(--accent));
    }
  }
  .logo.vite {
    height: 88px;
  }
  @media (max-width: 1024px) {
    gap: 24px;
    .logo { height: 72px; }
    .logo.vite { height: 66px; }
  }
}

#app {
  width: 1126px;
  max-width: 100%;
  margin: 0 auto;
  text-align: center;
  border-inline: 1px solid var(--border);
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

#center {
  display: flex;
  flex-direction: column;
  gap: 25px;
  place-content: center;
  place-items: center;
  flex-grow: 1;

  @media (max-width: 1024px) {
    padding: 32px 20px 24px;
    gap: 18px;
  }
}

#next-steps {
  display: flex;
  border-top: 1px solid var(--border);
  text-align: left;

  & > div {
    flex: 1 1 0;
    padding: 32px;
    @media (max-width: 1024px) {
      padding: 24px 20px;
    }
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    text-align: center;
  }
}

#docs {
  border-right: 1px solid var(--border);

  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}

#next-steps ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 8px;
  margin: 32px 0 0;

  a {
    color: var(--text-h);
    font-size: 16px;
    border-radius: 6px;
    background: var(--social-bg);
    display: flex;
    padding: 6px 12px;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: var(--shadow);
    }
    .button-icon {
      height: 18px;
      width: 18px;
    }
  }

  @media (max-width: 1024px) {
    margin-top: 20px;
    flex-wrap: wrap;
    justify-content: center;

    li {
      flex: 1 1 calc(50% - 8px);
    }
    a {
      width: 100%;
      justify-content: center;
      box-sizing: border-box;
    }
  }
}

#spacer {
  height: 88px;
  border-top: 1px solid var(--border);
  @media (max-width: 1024px) {
    height: 48px;
  }
}

.ticks {
  position: relative;
  width: 100%;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: -4.5px;
    border: 5px solid transparent;
  }
  &::before {
    left: 0;
    border-left-color: var(--border);
  }
  &::after {
    right: 0;
    border-right-color: var(--border);
  }
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
	await write(`src/counter.${ext}`, counterModule(ext));
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
