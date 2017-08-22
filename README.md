# jexia-js-sdk
Javascript SDK for interacting with Jexia projects.

## Requirements


Latest version of Node.JS is needed in order to run any of the development environment commands.

For contributing with code changes, the following are must-haves in order to not break code formatting:
  - `Editorconfig` plugin for your IDE of choice: http://editorconfig.org/
  - `Tslint` plugin for your IDE of choice: https://palantir.github.io/tslint/

It is also recommended to install the `Typescript` plugin for your IDE of choice - this will highlight Typescript errors in code as you are writing it.

Install `rimraf` globally in order to use the `cleanup:full` command
- `npm i rimraf -g`

## First Time Setup
Run the following command:
- `npm i`

Additional steps (optional):



## Development commands
Lint Typescript code (install a tslint plugin for your favourite IDE for real-time linting while coding):
- `npm run lint`

Transpile TS code to JS code:
- `npm run transpile`

Run unit tests (no need to run the transpile manually before this):
- `npm run test`

HTML coverage report (will be opened with default browser):
- `npm run test:coverage`

Remove all transpiled code, webpack bundles, documentation, test coverage info, etc.:
- `npm run cleanup`

Remove all of the above **and** installed node modules (needs rimraf installed globally in order to finish without errors):
- `npm run cleanup:full`

Install typedef files (use `--save-dev` flag to be added to `package.json`):
- `npm i @types/<library_name>`

Generate HTML documentation/API reference for the project:
- `npm run docs`

Generate Javascript bundles using Webpack (handles necessary transpiling on its own but only produces transpiled bundles):

- `npm run bundle`
