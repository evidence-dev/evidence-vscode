import {
  languages,
  window,
  workspace,
  ExtensionContext,
} from 'vscode';

import { MarkdownSymbolProvider } from './providers/markdownSymbolProvider';
import { setExtensionContext } from './extensionContext';
import { registerCommands } from './commands/commands';
import { loadPackageJson, hasDependency } from './utils/jsonUtils';
import { Settings, getConfig, updateProjectContext } from './config';
import { installDependencies } from './commands/build';
import { startServer } from './commands/server';
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
  languages.registerDocumentSymbolProvider(markdownLanguage, provider);

  // check for evidence app files and node modules
  const packageJson = await loadPackageJson();
  const evidenceFiles = await workspace.findFiles('**/.evidence/**/*.*');
  if (workspace.workspaceFolders && evidenceFiles.length > 0 &&
    hasDependency(packageJson, '@evidence-dev/evidence')) {

    // set Evidence project context
    updateProjectContext();

    // check for node modules and auto start dev server
    const nodeModules = await workspace.findFiles('**/node_modules/**/*.*');
    const autoStart: boolean = <boolean>getConfig(Settings.AutoStart);
    if (nodeModules.length > 0) {
      // show start dev server status
      statusBar.showStart();

      if (autoStart) {
        startServer();
      }
    }
    else {
      // show install node modules status
      statusBar.showInstall();

      // prompt a user to install Evidence node.js dependencies
      window.showInformationMessage(
        'Would you like to install Evidence project node.js dependencies?', 'Yes', 'No')
        .then((selection) => {
          if (selection === 'Yes') {
            installDependencies();
          }
        });
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
