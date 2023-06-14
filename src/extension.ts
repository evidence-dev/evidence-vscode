import {
  languages,
  window,
  workspace,
  ExtensionContext,
  ProgressLocation
} from 'vscode';

import { MarkdownSymbolProvider } from './providers/markdownSymbolProvider';
import { setExtensionContext } from './extensionContext';
import { registerCommands } from './commands/commands';
import { loadPackageJson, hasDependency } from './utils/jsonUtils';
import { Settings, getConfig, updateProjectContext } from './config';
import { showInstallDependencies } from './views/prompts';
import { startServer } from './commands/server';
import { openIndex } from './commands/project';
import { statusBar } from './statusBar';
import { closeTerminal } from './terminal';

/**
 * Activates Evidence vscode extension.
 *
 * @param context Extension context.
 */
export async function activate(context: ExtensionContext) {
  setExtensionContext(context);
  registerCommands(context);

  // register markdown symbol provider
  const markdownLanguage = { language: 'emd', scheme: 'file' };
  const provider = new MarkdownSymbolProvider();
  // languages.registerDocumentSymbolProvider(markdownLanguage, provider);

  // load package.json
  const workspacePackageJson = await loadPackageJson();

  // get all evidence files in workspace
  const evidenceFiles = await workspace.findFiles('**/.evidence/**/*.*');

  // check for evidence app files and dependencies in the loaded package.json
  if (workspace.workspaceFolders && evidenceFiles.length > 0 &&
    workspacePackageJson && hasDependency(workspacePackageJson, '@evidence-dev/evidence')) {

    // set Evidence project context
    updateProjectContext();

    // get autoStart setting:
    const autoStart: boolean = <boolean>getConfig(Settings.AutoStart);

    // show start dev server status
    statusBar.showStart();

    // open index.md if no other files are open
    openIndex();

    if (autoStart) {
      startServer();
    }
  }
}

/**
 * Deactivates Evidence extension
 * and disposes extension resources.
 */
export function deactivate() {
  statusBar?.dispose();
  closeTerminal();
}
