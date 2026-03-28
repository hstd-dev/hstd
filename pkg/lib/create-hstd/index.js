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

const indexHtml = (entry) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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

const appTemplate = (ext) => `import { $, h as html, on, css, io } from "@hstd/std"

// Preserve reactive state across HMR updates
const count = import.meta.hot?.data?.count ?? $(0);

function App() {
  return html\`
    <div \${{
      [css]: {
        maxWidth: "640px",
        margin: "100px auto",
        padding: "0 24px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        textAlign: "center",
        color: "#ffffffde",
      }
    }}>
      <h1>hstd + Vite</h1>
      <p \${{ [css.color]: "#888" }}>Edit src/main.${ext} and save to see updates.</p>

      <div \${{
        [css]: {
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          marginTop: "32px",
        }
      }}>
        <button \${{
          [on.click]: () => count.\$++,
          [css]: {
            padding: "12px 28px",
            fontSize: "16px",
            fontFamily: "inherit",
            fontWeight: "600",
            backgroundColor: "#646cff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }
        }}>Count is \${count}</button>
      </div>
    </div>
  \`;
}

document.body[html] = App();

if (import.meta.hot) {
  import.meta.hot.dispose((data) => {
    data.count = count;
  });
  import.meta.hot.accept();
}
`;

const mainJS = appTemplate("js");
const mainTS = appTemplate("ts");

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

	const entry = useTS ? "main.ts" : "main.js";

	await write("index.html", indexHtml(entry));
	await write("package.json", packageJson(useTS));
	await write(".gitignore", gitignore);
	await write(`src/${entry}`, useTS ? mainTS : mainJS);

	if (useTS) {
		await write("tsconfig.json", tsconfig);
		await write("vite.config.ts", viteConfigTS);
	}

	const pm = detectPackageManager();
	const runCmd = pm === "npm" ? "npx" : pm;
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
