import { executeCommand } from './build';
import { closeTerminal, sendCommand } from '../terminal';
import { preview } from './preview';
import { getNodeVersion, isSupportedNodeVersion } from '../node';

let _running: boolean = false;

/**
 * Starts Evidence app dev server.
 */
export async function startServer() {
  executeCommand('npm run dev');
  const nodeVersion = await getNodeVersion();
  if (isSupportedNodeVersion(nodeVersion, 16, 14)) {
    _running = true;

    // wait for the server to start
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

/**
 * Sets timeout for the given number of milliseconds.
 *
 * @param ms Millisends to use for the timeout.
 * @returns Promise that resolves after the given number of milliseconds.
 */
export function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
