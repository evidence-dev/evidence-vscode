import {
  commands
} from 'vscode';

import { Commands } from './commands';

/**
 * Local Evidence app url with a port.
 */
const localAppUrl = 'http://localhost:3000';

export function preview() {
  commands.executeCommand(Commands.ShowSimpleBrowser, localAppUrl);
}