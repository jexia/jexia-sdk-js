# jexia-js-sdk
Javascript SDK for interacting with Jexia projects.

## First Time Setup
Run the following command:
- `npm i`

Additional steps (optional):

Install `rimraf` globally in order to use the `cleanup:full` command
- `sudo npm i rimraf -g`

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
