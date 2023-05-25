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

## Requirements

Evidence VS Code requires the Svelte for VS Code extension. This will be installed automatically when you install Evidence VS Code.

## Commands

This extension provides a number of custom VS Code shortcut commands to help you get started with Evidence. You can access them from `View -> Command Palette...` menu (`ctrl/cmd+shift+p`) by typing `Evidence` in the command search box:

![Evidence Extension Commands](./docs/images/evidence-vscode-commands.png?raw=true)

| Command | Name | Description |
| --- | --- | --- |
| `createProjectFromTemplate` | Create Project from Template | Create new Evidence app project from [template](https://github.com/evidence-dev/template). |
| `openSettings` | Open Settings File | Open Evidence app settings file in VS Code JSON editor. |
| `installDependencies` | Install Dependencies | Install Evidence app NodeJS modules. |
| `startServer` | Start Server | Start Evidence app dev server. |
| `stopServer` | Stop Server | Stop Evidence app dev server. |
| `preview` | Preview | Preview Evidence app using built-in VS Code Simpler Browser. |
| `viewSettings` | View Settings | View Evidence app settings page in the built-in browser. |
| `clearCache` | Clear Cache | Clear Evidence application data and queries cache. |
| `build` | Build | Build Evidence app for deployment to production. |
| `buildStrict` | Build Strict | Build Evidence app for deployment to production in a strict mode. |

## Support

If you run into any issues setting up the extension, please reach out:

- [Open an issue on GitHub](https://github.com/evidence-dev/evidence/issues)
- Post in our [Slack community](https://join.slack.com/t/evidencedev/shared_invite/zt-uda6wp6a-hP6Qyz0LUOddwpXW5qG03Q)
- Email <support@evidence.dev>
