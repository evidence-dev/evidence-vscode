import {
  commands,
  window,
  workspace,
  ExtensionContext,
  ExtensionMode
} from 'vscode';

import { setExtensionContext } from './extensionContext';
import { registerCommands } from './commands/commands';
import { statusBar } from './statusBar';

/**
 * Activates Evidence vscode extension.
 *
 * @param context Extension context.
 */
export function activate(context: ExtensionContext) {
  setExtensionContext(context);
  registerCommands(context);
}

/**
 * Deactivates Evidence extension
 * and disposes extension resources.
 */
export function deactivate() {
  statusBar?.dispose();
}
