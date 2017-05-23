# jexia-js-sdk
Javascript SDK for interacting with Jexia projects.

## First Time Setup
Run the following command:
- `npm i`

Additional steps (optional):

Install `rimraf` globally in order to use `cleanup` command
- `sudo npm i rimraf -g`

## Development commands
Lint Typescript code (although I advise installing a tslint plugin for your IDE):
- `npm run lint`

Transpile TS code to JS code:
- `npm run transpile`

Run unit tests (no need to run the transpile manually before this):
- `npm run test`

HTML coverage report (will be opened with default browser):
- `npm run test:coverage`

Remove all previously installed packages and compiled bundles:
- `npm run cleanup`

Install typedef files (use `--save-dev` flag to be added to `package.json`):
- `npm i @types/<library_name>`
