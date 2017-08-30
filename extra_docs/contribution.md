# Code Contribution Guide

This document covers development environment / code contribution related details.

You can find the repo at https://github.com/jexia-com/jexia-sdk-js.

## Development Environment Requirements

Latest version of Node.JS is needed in order to run any of the development environment commands.

For contributing with code changes, the following are must-haves in order to not break code formatting:
  - `Editorconfig` plugin for your IDE of choice: http://editorconfig.org/
  - `Tslint` plugin for your IDE of choice: https://palantir.github.io/tslint/

It is also recommended to install the `Typescript` plugin for your IDE of choice - this will highlight Typescript errors in code as you are writing it.

Install `rimraf` globally in order to use the `cleanup:full` command
- `npm i rimraf -g`

## First Time Setup of the Development Environment
It is sufficient to run `npm install` and then you can start coding.

Ideally you should also run `npm run test` once, in order to validate that everything is working properly (also `npm run test` is an integral part of the development process, you'll be running it a lot).

## Development Commands
Lint Typescript code (install a tslint plugin for your favourite IDE for real-time linting while coding):
- `npm run lint`

Transpile TS code to JS code:
- `npm run transpile`

Run unit tests (automatically executes a clean transpile before running tests):
- `npm run test`

HTML coverage report (will be opened with default browser):
- `npm run test:coverage`

Remove all transpiled code, webpack bundles, documentation, test coverage info, etc.:
- `npm run cleanup`

Remove all of the above **and** installed node modules (needs rimraf installed globally):
- `npm run cleanup:full`

Add a typedef file to the project (use `--save-dev` flag to be added to `package.json`):
- `npm i @types/<library_name>`

Generate HTML documentation/API reference for the project:
- `npm run docs`

Generate Javascript bundles using Webpack (handles necessary transpiling on its own but only produces transpiled bundles, not separate transpiled modules):

- `npm run bundle`

## Contributing

Please make sure you have no linting or unit test errors before creating a PR. Unit test coverage for new code is also highly appreciated and will be met with thunderous (virtual) applause.
