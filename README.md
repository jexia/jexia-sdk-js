# jexia-js-sdk
Javascript SDK for interacting with Jexia projects.

## First Time Setup
Run the following command:
- `npm run setup`

It will install node modules, type definition files, it will transpile the codebase and run the unit tests (as a check that everything works properly - no errors should be thrown during this setup process).

## Development commands
Lint Typescript code (although I advise installing a tslint plugin for your IDE):
- `npm run lint`

Transpile TS code to JS code:
- `npm run transpile`

Run unit tests (no need to run the transpile manually before this):
- `npm run test`

There are also a few other helper NPM scripts, check the package.json file for more info.

## Using the Typings tool
The Typings tool is used for installing Typescript type definition files for third party libraries.

To search for typedef files for a library:
- `npm run typings -- search <library_name>`

To install typedef files:
- `npm run typings -- install <source>~<library_name>` 

Example:

`npm run typings -- search node`

`npm run typings install dt~node`
