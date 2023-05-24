import { executeCommand } from './build';
import { sendCommand } from '../terminal';

/**
 * Starts Evidence app dev server.
 */
export function startServer() {
  executeCommand('npm run dev');
}

/**
 * Stops running app dev server.
 */
export function stopServer() {
  // send ctrl+c to stop running dev server
  sendCommand('\x03', '', false); // shift focus to terminal
  //sendCommand('q', '', false);
}
