import {
  languages,
  window,
  workspace,
  ExtensionContext,
} from 'vscode';

import { setExtensionContext } from './extensionContext';
import { registerCommands } from './commands/commands';
import { updateProjectContext } from './config';
import { statusBar } from './statusBar';
import { closeTerminal } from './terminal';

import { MarkdownSymbolProvider } from './providers/markdownSymbolProvider';

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

  // check for evidence app files
  const evidenceFiles = await workspace.findFiles('**/.evidence/**/*.*');
  if (workspace.workspaceFolders && evidenceFiles.length > 0) {
    updateProjectContext();

    // check for node modules
    const nodeModules = await workspace.findFiles('**/node_modules/**/*.*');
    if (nodeModules.length > 0) {
      statusBar.showStart();
    }
    else {
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
