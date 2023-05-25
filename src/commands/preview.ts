import {
  commands
} from 'vscode';

import { Commands } from './commands';

/**
 * Local Evidence app url with a port.
 */
export const localAppUrl = 'http://localhost:3000';

/**
 * Opens Evidence app preview in a Simple Browser built-in VSCode webview.
 */
export function preview() {
  commands.executeCommand(Commands.ShowSimpleBrowser, localAppUrl);
}
