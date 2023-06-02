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

        // show spinning progress bar for 25 seconds
        window.withProgress({
          location: ProgressLocation.Notification,
          title: 'Starting Evidence dev server ...',
          cancellable: false
        }, async (progress) => {
          for (let i = 0; i < 25; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            progress.report({ increment: 4 });
          }
        });
      }
    }
    else {
      // show install node modules status
      statusBar.showInstall();

      // prompt a user to install Evidence node.js dependencies
      showInstallDependencies();
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
