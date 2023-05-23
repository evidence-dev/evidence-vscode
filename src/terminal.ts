import {
  Disposable,
  ExtensionContext,
  Terminal,
  window
} from 'vscode';

import { getExtensionContext } from './extensionContext';

const terminalName = 'Evidence';

let _terminal: Terminal | undefined;
let _currentDirectory: string | undefined;
let _disposable: Disposable | undefined;

/**
 * Gets Evidence treminal instance.
 *
 * @param context VScode extension context.
 * @param workingDirectory Optional working directory path to cd to.
 * @returns VScode Terminal instance.
 */
function getTerminal(context: ExtensionContext, workingDirectory?: string): Terminal {
  if (_terminal === undefined) {
    _terminal = window.createTerminal(terminalName);
    _disposable = window.onDidCloseTerminal((e: Terminal) => {
      if (e.name === terminalName) {
        _terminal = undefined;
        _disposable?.dispose();
        _disposable = undefined;
      }
    });

    context.subscriptions.push(_disposable);
    _currentDirectory = undefined;
  }

  if (_currentDirectory !== workingDirectory &&
    workingDirectory && workingDirectory.length > 0) {
    _terminal.sendText(`cd "${workingDirectory}"`, true); // add new line
    _currentDirectory = workingDirectory;
  }

  return _terminal;
}

/**
 * Sends command to terminal.
 *
 * @param command Command name.
 * @param workingDirectory Optional working directory path to cd to.
 * @param preserveFocus Preserve current window focus.
 */
export function sendCommand(command: string,
  workingDirectory?: string,
  preserveFocus?: boolean): void {

  const terminal = getTerminal(getExtensionContext(), workingDirectory);
  terminal.show(preserveFocus);
  terminal.sendText(command, true); // add new line
}
