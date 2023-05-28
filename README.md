# Evidence VS Code

The official VS Code extension for [Evidence](https://evidence.dev) projects.

Evidence is a Markdown-based business intelligence tool. Connect to your database, write SQL queries, and include charts, tables, and dynamic text - all from Markdown. To get started, visit the [docs.](https://docs.evidence.dev)

This extension provides language support, basic commands and autocomplete for Evidence Markdown files. This is an early version of the extension and will serve as the starting point for deeper VS Code support for Evidence in the future.

![Evidence App Run](./docs/images/vscode-evidence-app-run.gif?raw=true)

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

![Evidence Extension Installation](./docs/images/evidence-vscode-installation.png?raw=true)

## Getting Started

To get started with Evidence BI using Evidence VS Code extension:

1. Create new project folder and open it in VS Code from the command line:

```
mkdir evidence-bi
cd evidence-bi
code .
```

2. Use `Evidence: Create Project from Template` command in VS Code to initialize new Evidence project from a [template](https://github.com/evidence-dev/template).

![Create Evidence Project from Template](./docs/images/evidence-project-from-template.gif?raw=true)

3. Use `Evidence:` VS Code commands described below to install dependencies, start and stop dev server, and preview Evidence BI app content.

## Commands

Evidence extension provides a number of custom VS Code shortcut commands for Evidence projects. You can access them from `View -> Command Palette...` menu (`ctrl/cmd+shift+p`) by typing `Evidence` in the command search box:

![Evidence Extension Commands](./docs/images/evidence-vscode-commands.png?raw=true)

| Command | Title | Description |
| --- | --- | --- |
| `createProjectFromTemplate` | Create Project from Template | Create new Evidence app project from [template](https://github.com/evidence-dev/template). |
| `openSettings` | Open Settings File | Open Evidence app settings file in VS Code JSON editor. |
| `installDependencies` | Install Dependencies | Install Evidence app NodeJS modules. |
| `updateDependencies` | Update to Latest Version | Updates all Evidence app NodeJS libraries to the latest version. |
| `startServer` | Start Server | Start Evidence app dev server. |
| `stopServer` | Stop Server | Stop Evidence app dev server. |
| `preview` | Preview | Preview Evidence app using built-in VS Code Simpler Browser. |
| `viewSettings` | View Settings | View Evidence app settings page in the built-in browser. |
| `clearCache` | Clear Cache | Clear Evidence application data and queries cache. |
| `build` | Build | Build Evidence app for deployment to production. |
| `buildStrict` | Build Strict | Build Evidence app for deployment to production in a strict mode. |

## Support

If you run into any issues setting up the extension, please reach out:

- [Open an issue on GitHub](https://github.com/evidence-dev/vscode/issues)
- Post in our [Slack community](https://join.slack.com/t/evidencedev/shared_invite/zt-uda6wp6a-hP6Qyz0LUOddwpXW5qG03Q)
- Email <support@evidence.dev>
