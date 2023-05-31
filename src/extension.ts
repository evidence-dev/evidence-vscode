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
import { updateProjectContext } from './config';
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
    updateProjectContext();

    // check for node modules
    const nodeModules = await workspace.findFiles('**/node_modules/**/*.*');
    if (nodeModules.length > 0) {
      // show start dev server status
      statusBar.showStart();
    }
    else {
      // show install node modules status
      statusBar.showInstall();
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
