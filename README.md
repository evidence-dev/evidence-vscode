# Evidence VS Code

[![Version](https://img.shields.io/visual-studio-marketplace/v/Evidence.evidence-vscode.svg?color=orange&style=?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=Evidence.evidence-vscode)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/Evidence.evidence-vscode.svg?color=orange)](https://marketplace.visualstudio.com/items?itemName=Evidence.evidence-vscode)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/Evidence.evidence-vscode.svg?color=orange)](https://marketplace.visualstudio.com/items?itemName=Evidence.evidence-vscode)

The official VS Code extension for [Evidence](https://evidence.dev) projects.

Evidence is a Markdown-based business intelligence tool. Connect to your database, write SQL queries, and include charts, tables, and dynamic text - all from Markdown. To get started, visit the [docs.](https://docs.evidence.dev)

This extension provides language support, basic commands and autocomplete for Evidence Markdown files. This is an early version of the extension and will serve as the starting point for deeper VS Code support for Evidence in the future.

![Evidence App Run](https://raw.githubusercontent.com/evidence-dev/evidence-vscode/main/docs/images/vscode-evidence-app-run.gif?raw=true)

## Features

- Syntax highlighting for:
  - Markdown
  - SQL Query Blocks
  - Components (Svelte syntax highlighting)
  - JavaScript expressions
- Autocomplete suggestions for inserting:
  - Components (Charts, Tables, Text Components)
  - SQL Query Blocks
  - Templating (Loops, Conditionals)
- Evidence commands to:
  - Create new project from a template
  - Install dependencies
  - Start and stop dev server
  - Update to latest version
  - View settings page and file
  - Clear app data and queries cache
  - Build app for deployment to production
  - Preview app and markdown files in built-in browser

## Requirements

Evidence dev server and this extension require **Node.js** `version 16.14` or higher. You can download and install the latest version from [nodejs.org](https://nodejs.org/en/download/).

This extension also depends on [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) that provides syntax highlighting and rich intellisense for Svelte components in VS Code. Svelte for VS Code will be installed automatically when you install Evidence extension.

## Installation

You can install Evidence extension from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=evidence-dev.evidence-vscode), or by searching for `Evidence` in the VS Code Extensions tab.

![Evidence Extension Installation](https://raw.githubusercontent.com/evidence-dev/evidence-vscode/main/docs/images/evidence-vscode-installation.png?raw=true)

## Getting Started

To get started with Evidence BI application development using VS Code desktop version, follow these steps:

1. Create new project folder and open it in VS Code from the command line:

```
mkdir evidence-bi
cd evidence-bi
code .
```

2. Use `Evidence: Create Project from Template` command in VS Code to initialize new Evidence project from a [template](https://github.com/evidence-dev/template).

![Create Evidence Project from Template](https://raw.githubusercontent.com/evidence-dev/evidence-vscode/main/docs/images/evidence-project-from-template.gif?raw=true)

3. Use `Evidence:` VS Code commands described below to install dependencies, start and stop dev server, and preview Evidence BI app content.

## Running Evidence app in GitHub Codespaces

You can use Evidence VS Code extension with [GitHub Codespaces](https://github.com/features/codespaces).

1. Open Evidence [template](https://github.com/evidence-dev/template) project github repository in a browser.
2. Click the green `Use this template` button, and select `Open in a codespace`.
3. Install Evidence extension in the Codespace when prompted.
4. Use new Evidence status bar and commands to run and Preview `template` Evidence app.

![Running Evidence App Template in GitHub Codespaces](https://raw.githubusercontent.com/evidence-dev/evidence-vscode/main/docs/images/vscode-evidence-app-run-in-codespaces.gif?raw=true)

## Commands

Evidence extension provides a number of custom VS Code shortcut commands for Evidence projects. You can access them from `View -> Command Palette...` menu (`ctrl/cmd+shift+p`) by typing `Evidence` in the command search box:

![Evidence Extension Commands](https://raw.githubusercontent.com/evidence-dev/evidence-vscode/main/docs/images/evidence-vscode-commands.png?raw=true)

| Command | Title | Description |
| --- | --- | --- |
| `createProjectFromTemplate` | Create Project from Template | Create new Evidence app project from [template](https://github.com/evidence-dev/template). |
| `openSettings` | Open Settings File | Open Evidence app settings file in VS Code JSON editor. |
| `installDependencies` | Install Dependencies | Install Evidence app NodeJS modules. |
| `updateDependencies` | Update to Latest Version | Update all Evidence app NodeJS libraries to the latest version. |
| `startServer` | Start Dev Server | Start Evidence app dev server. |
| `stopServer` | Stop Dev Server | Stop Evidence app dev server. |
| `preview` | Preview | Preview Evidence app using built-in VS Code Simpler Browser. |
| `viewSettings` | View Settings | View Evidence app settings page in the built-in browser. |
| `clearCache` | Clear Cache | Clear Evidence application data and queries cache. |
| `build` | Build | Build Evidence app for deployment to production. |
| `buildStrict` | Build Strict | Build Evidence app for deployment to production in a strict mode. |
| `showOutput` | Show Output | Show Evidence extension output in Output view. |

## Limitations

Our first version of Evidence VS Code extension with new interactive commands has the following limitations:


- New commands only work in workspaces that have `/pages` and other Evidence BI application files at the root of the open project ([#25](https://github.com/evidence-dev/evidence-vscode/issues/25#issuecomment-1567647672))
- Open Evidence markdown documents do not display [Outline](https://code.visualstudio.com/docs/getstarted/userinterface#_outline-view) ([#33](https://github.com/evidence-dev/evidence-vscode/issues/33))
- Preview and Start/Stop Dev Server commands do not perform dynamic free port lookup yet.
([#31](https://github.com/evidence-dev/evidence-vscode/issues/31)) You can change the default Evidence app dev server port from `3000` to another unoccupied port using new `evidence.defaultPort` extension configuration settings added in ([#52](https://github.com/evidence-dev/evidence-vscode/issues/52))
- Preview of the open Evidence markdown document for the [templated pages](https://docs.evidence.dev/core-concepts/templated-pages/) doesn't properly rewrite template page Urls  ([#30](https://github.com/evidence-dev/evidence-vscode/issues/30))


We plan to address these shortcomings in the upcoming releases.

## Dev Build

To build the latest version of Evidence VS Code extension from source:

1. Clone this github repository and run the following commands from the command line:
```
$ git clone https://github.com/evidence-dev/evidence-vscode
$ cd evidence-vscode
$ npm install
$ npm run compile
$ code .
```
2. Press `F5` to start debugging Evidence VS Code extension.
3. Open any Evidence project folder in the new `Extension Host Window` to try updated extension commands and features.

**Note**: Disable Evidence extension installed from marketpace to see your code changes reflected in the running host extension window during debug.

See the official [Debugging extension](https://code.visualstudio.com/api/get-started/your-first-extension#debugging-the-extension) documentation for more information about developing extensions in VS Code.

## Support

If you run into any issues setting up the extension, please reach out:

- [Open an issue on GitHub](https://github.com/evidence-dev/evidence-vscode/issues)
- Post in our [Slack community](https://join.slack.com/t/evidencedev/shared_invite/zt-uda6wp6a-hP6Qyz0LUOddwpXW5qG03Q)
- Email <support@evidence.dev>
