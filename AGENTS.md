# AGENTS.md for hstd

## Project Overview

`hstd` (HyperStandard) is a minimal JavaScript library for building fast, interactive, and extensible web interfaces. The core philosophy is to provide a minimal set of tools to create powerful user interfaces with a simple and intuitive API.

The repository is structured as a monorepo, with several packages located in the `pkg/lib/` directory.

## Development Environment

- The project uses `npm` for package management. Run `npm install` at the root to install dependencies.
- This is a monorepo. Individual packages are located under `pkg/lib/@hstd/`.

## Build Instructions

To build the project, run the following command from the root directory:

```sh
npm run build
```

This command utilizes the `bundle` script defined in the root `package.json`.

## Testing Instructions

A top-level test command is not defined in the root `package.json`. Tests appear to be located within individual packages (e.g., `pkg/vscode/test`, `pkg/lib/@hstd/ts/e2e/tests`).

To run tests, you may need to navigate to the specific package directory and execute the test command defined in its own `package.json`, or look for specific testing instructions within that package's documentation.

## Code Style

There are no explicit code style configuration files like `.eslintrc` or `.prettierrc` at the root level. Please infer the coding style from the existing source code. Key characteristics include:

- Semicolons are used.
- Indentation appears to be 4 spaces.
- Single quotes for strings seem to be preferred, but this is not strictly enforced.

## Pull Request Instructions

- Ensure your code passes any existing tests within the package you are modifying.
- Update or add tests for the code you change.
- Keep PRs focused on a single issue or feature.
