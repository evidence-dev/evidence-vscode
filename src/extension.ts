import {
  commands,
  window,
  workspace,
  ExtensionContext,
  ExtensionMode
} from 'vscode';

import { setExtensionContext } from './extensionContext';
import { registerCommands } from './commands/commands';

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
 * Deactivates Evidence vscode extension,
 * and disposes extension resources.
 */
export function deactivate() {
}
