# Contribution Guide

[First please read and abide by the Code of Conduct](https://github.com/jexia/jexia-sdk-js/blob/master/CODE_OF_CONDUCT.md).

## Environment

Everything you need is a stable version of Node.JS (v8+).

## Coding Style Guidelines

The source code is written in [TypeScript](http://www.typescriptlang.org/) using strict compilation mode and all the ES2017 features. We are following the [TSLint](https://github.com/palantir/tslint) and [Editorconfig](http://editorconfig.org/) rules listed at their config files. We strongly recommend to use a code editor with good support for these tools (we recommend [VSCode](https://code.visualstudio.com/)), so that it is easy to integrate new code into our code base.

## First Run

After cloning the project and installing the dependencies with `npm install` you should be able start coding.

You can double check if the local environment is fully working by running the tests with `npm test` and building the project with `npm run build`.

## Main Development Commands

Execute unit tests and check coverage:

- `npm test`

Execute unit tests in watch mode for TDD purposes:

- `npm run tdd`

Lint Typescript code:

- `npm run lint`

Commit convention helper (see related topic below):

- `npm run commit`

Generate API reference documentation locally:

- `npm run docs`

Build the project locally:

- `npm run build`

## Commit Message Format

This repository follows a strict **Commit Message Conventions**, which leads to more readable messages that are easy to follow when looking through the project history. Also, we use the git commit messages to generate the change log, calculate the new version number and automatically publish new versions to NPM. For these purposes, we are using [Semantic Release](https://github.com/semantic-release/semantic-release). We have a helper script `npm run commit` that provides a command line based wizard for easy commit message formatting.

Each commit message consists of a **header**, a **body** and a **footer**. The header has a special format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

Only the first line is mandatory, and any line of the commit message cannot be longer than 100 characters! A linter will check your commit message in a git hook for each commit and guide you to fix any error. Please take a look at the [AngularJS Commit Message Conventions](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit) for detailed information about this convention.

## Submitting a Pull Request (PR)

Before you submit your Pull Request (PR) consider the following guidelines:

- Search our repository for an open or closed PR that relates to your submission. You don't want to duplicate effort.
- Fork the project on Github
- Make your changes in a new git branch:

    ```shell
    git checkout -b my-fix-branch master
    ```

- Create your patch, following [code style guidelines](#coding-style-guidelines), and **including appropriate test cases**.
- Run the full test suite and ensure that all tests pass.
- Commit your changes using a descriptive commit message that follows our [commit message format](#commit-message-format):

     ```shell
     npm run commit
     ```

- Push your branch to your GitHub fork:

    ```shell
    git push origin my-fix-branch
    ```

- In GitHub, send a pull request to `jexia-sdk-js:master`.
- Check if our **Continuous Integration** checks passed against your PR and make the necessary fixes if something breaks.
- If we suggest changes then:
  - Please apply the required updates.
  - Re-run the test suites to ensure tests are still passing.
  - Re-run performance tests to make sure your changes didn't hurt performance.
  - Rebase your branch and force push to your GitHub repository (this will update your Pull Request):

    ```shell
    git rebase master -i
    git push -f
    ```

That's it! Thank you for your contribution!
