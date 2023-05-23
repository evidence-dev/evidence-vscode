/* eslint-disable @typescript-eslint/naming-convention */
import {
  commands,
  window,
  Disposable,
  ExtensionContext,
  Uri
} from 'vscode';

/**
 * VSCode and Evidence extension commands.
 */
export const enum Commands {
  Open = 'vscode.open',
  ReloadWindow = 'workbench.action.reloadWindow',
  SetContext = 'setContext',
  CreateProjectFromTemplate = 'evidence.createProjectFromTemplate'
}

let _context: ExtensionContext;

/**
 * Registers Evidence extension commands.
 *
 * @param context Extension context.
 */
export function registerCommands(context: ExtensionContext) {
  _context = context;

  // TODO: regiester Evidence extension commands here
}

/**
 * Registers extension command.
 *
 * @param commandId Command id.
 * @param callback Command callback.
 * @param thisArg The `this` context used when invoking the handler function.
 */
function registerCommand(commandId: string, callback: (...args: any[]) => any, thisArg?: any): void {
  const command: Disposable = commands.registerCommand(commandId, async (...args) => {
    try {
      await callback(...args);
    }
    catch (e: unknown) {
      window.showErrorMessage(String(e));
      console.error(e);
    }
  }, thisArg);
  _context.subscriptions.push(command);
}
