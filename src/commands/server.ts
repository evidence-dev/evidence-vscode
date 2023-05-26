import { commands } from 'vscode';
import { Commands } from './commands';
import { executeCommand } from './build';
import { closeTerminal, sendCommand } from '../terminal';
import { preview } from './preview';
import { getNodeVersion, isSupportedNodeVersion } from '../node';
import { timeout } from '../utils/timer';

let _running: boolean = false;

/**
 * Starts Evidence app dev server.
 */
export async function startServer() {
  executeCommand('npm exec evidence dev');
  const nodeVersion = await getNodeVersion();
  if (isSupportedNodeVersion(nodeVersion, 16, 14)) {

    // wait for the dev server to start
    await timeout(5000);

    // set focus back to the active vscode editor group
    commands.executeCommand(Commands.FocusActiveEditorGroup);
    _running = true;

    // wait for the server to process pages
    await timeout(20000);

    // open app preview
    preview();
  }
}

/**
 * Stops running app dev server,
 * and closes Evidence app terminal.
 */
export function stopServer() {
  if (_running) {
    sendCommand('q', '', false);
  }

  closeTerminal();
  _running = false;
}
