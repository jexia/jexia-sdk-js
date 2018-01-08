# Code Contribution Guide

This document covers development environment / code contribution related details.

You can find the repo at https://github.com/jexia-com/jexia-sdk-js.

## Development Environment Requirements

Latest version of Node.JS is needed in order to run any of the development environment commands.

For contributing with code changes, the following are must-haves in order to not break code formatting:
  - [Editorconfig](http://editorconfig.org/) plugin for your IDE of choice: 
  - [Tslint](https://github.com/palantir/tslint) plugin for your IDE of choice

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

- `npm run build`

## Commit convention

This repository follows the convention used by the [AngularJS Commit Message Conventions](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit). This means that every commit has to have a message with meta information that will be read by the semantic-release package to calculate the following version every time a PR is merged.

Each commit message consists of a **header**, a **body** and a **footer**. The header has a special format that includes a **type**, a **scope** and a **subject**:

<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>

You can use the command line utility [cz-cli](https://github.com/commitizen/cz-cli) to create commits with the message following the right format in a very easy way. The package is already setup to work with it.

## Contributing

Please make sure you have no linting or unit test errors before creating a PR. Again, we advise installing a [Tslint](https://github.com/palantir/tslint) addon for your IDE. 
Unit test coverage for new code is also highly appreciated and will be met with thunderous (virtual) applause.

A few details on our development flow:
- `master` is the stable branch, `develop` is the development branch. We never push directly to these branches, only create pull requests
- for each Github issue (be it a bug, feature, etc.) we can create any number of pull requests
- when working on a Github issue, you should assign it to yourself first, then move it to the "In Progress" column on the [Zeus board](https://github.com/orgs/jexia-com/projects/4?fullscreen=true&card_filter_query=label%3Asdk)
- it is highly appreciated if you strive for `atomic commits` - try to logically separate the work into multiple commits that each add in bits of functionality. This helps with code reviews and the code history
- keep your PRs small, also for code review purposes. Ideally this is already suggested by the way the Github issues are created.
- always fix your unit tests and linting errors

Now for the Git flow
- create a feature branch based off `develop`
- add commits - add logic, add unit tests, fix bugs, fix unit tests
- push the local feature branch to the remote repo
- rebase your feature branch onto `develop` if other PRs went in while you were working on your feature
- create a PR from the feature branch into `develop`
- receive code review comments
- make changes to your code based on review comments
- rebase again if necessary
- when the reviews are approved, squash+merge into `develop`
