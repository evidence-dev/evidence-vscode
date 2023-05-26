import { commands } from 'vscode';
import { Commands } from './commands';
import { executeCommand } from './build';
import { closeTerminal, sendCommand } from '../terminal';
import { preview } from './preview';
import { getNodeVersion, isSupportedNodeVersion } from '../node';
import { timeout } from '../utils/timer';
import { statusBar } from '../statusBar';

let _running: boolean = false;

/**
 * Starts Evidence app dev server.
 */
export async function startServer() {
  executeCommand('npm exec evidence dev');
  const nodeVersion = await getNodeVersion();
  if (isSupportedNodeVersion(nodeVersion, 16, 14)) {
    statusBar.showRunning();

    // wait for the dev server to start
    await timeout(5000);
    _running = true;

    // wait for the server to process pages
    await timeout(20000);

    // set focus back to the active vscode editor group
    commands.executeCommand(Commands.FocusActiveEditorGroup);

    // open app preview
    preview();
    statusBar.showStop();
  }
}

/**
 * Gets running server status.
 *
 * @returns True if Evidence dev server is running, and false otherwise.
 */
export function isServerRunning() {
  return _running;
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
  statusBar.showStart();
}
