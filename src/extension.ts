import {
  commands,
  workspace,
  ExtensionContext,
} from 'vscode';

import { setExtensionContext } from './extensionContext';
import { registerCommands } from './commands/commands';
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

  // check for evidence app files
  const evidenceFiles = await workspace.findFiles('**/.evidence/**/*.*');
  if (workspace.workspaceFolders && evidenceFiles.length > 0) {
    updateProjectContext();
    statusBar.showStart();
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
