# Change Log


## 1.0.0

### Major Changes

- Import evidence.dev VSCode extension code from evidence monorepo
([#1](https://github.com/evidence-dev/vscode/issues/1))
- Add Evidence: Create Project from Template command
([#2](https://github.com/evidence-dev/vscode/issues/2))
- Create Evidence app Preview and render app content in VSCode IDE
([#3](https://github.com/evidence-dev/vscode/issues/3))
- Create Terminal API to run Evidence app dev server
([#4](https://github.com/evidence-dev/vscode/issues/4))
- Add Evidence: Open Settings File shortcut command
([#5](https://github.com/evidence-dev/vscode/issues/5))
- Create Evidence app status bar
([#6](https://github.com/evidence-dev/vscode/issues/6))
- Add Evidence: Clear Cache shortcut command
([#7](https://github.com/evidence-dev/vscode/issues/7))
- Add Evidence: Build shortcut commands
([#8](https://github.com/evidence-dev/vscode/issues/8))
- Document new Evidence extension commands
([#12](https://github.com/evidence-dev/vscode/issues/12))
- Add Evidence: Install Dependencies shortcut command
([#13](https://github.com/evidence-dev/vscode/issues/13))
- Add Evidence: View Settings shortcut command
([#14](https://github.com/evidence-dev/vscode/issues/14))
- Add local NodeJS version check prior to running Evidence app commands in terminal
([#15](https://github.com/evidence-dev/vscode/issues/15))
- Add Evidence extension demo gif to the intro section in readme.md
([#16](https://github.com/evidence-dev/vscode/issues/16))
- Add Evidence: Update to Latest Version shortcut command
([#17](https://github.com/evidence-dev/vscode/issues/17))
- Enable custom Evidence project commands only when ./evidence/template files are present
([#18](https://github.com/evidence-dev/vscode/issues/18))
- Add Getting Started section to README.md
([#19](https://github.com/evidence-dev/vscode/issues/19))
- Update Requirements and add Installation section to README.md
([#20](https://github.com/evidence-dev/vscode/issues/20))
- Package and publish Evidence extension v1.0.0 release
([#11](https://github.com/evidence-dev/vscode/issues/11))

## 0.0.9

### Patch Changes

- c9dde3d: Addition of a "next" release tag in-sync with main branch

All notable changes to the Evidence VS Code extension will be documented in this file.

## 0.0.8

- Add autocomplete suggestion for markdown table
- Update autocomplete suggestions to match simplified Evidence dataset syntax

## 0.0.7

- Fixed markdown preview shortcuts (cmd-shift-V, cmd-K V)
- Adding more space in js snippets so they 'work' by default rather than throwing a user error

## 0.0.6

- Bug fix for most recent VS Code release

## 0.0.5

- Remove template select statement from SQL query block autocomplete (issues with behaviour of Markdown's asterisk surrounding pair)

## 0.0.4

- Deactivated `editor.acceptSuggestionsOnEnter` to avoid insertion of autocomplete suggestions when trying to add a new line. This is a temporary fix until VS Code fixes the sensitivity of the suggestion triggers (e.g., suggestions appearing on the last character of a word)
- Minor autocomplete fixes

## 0.0.3

- Added extension dependency for Svelte for VS Code (Svelte language support)

## 0.0.2

- Extension published to Open VSX for availability in cloud IDEs and web versions of VS Code.

## 0.0.1

Initial release of the official VSCode extension for Evidence:

- Syntax highlighting for Markdown, SQL, Svelte, and JavaScript
- Autocomplete suggestions for inserting:
  - SQL Query Blocks
  - Components: Charts, Tables, and Text Components
  - Templating: Loops and Conditionals
