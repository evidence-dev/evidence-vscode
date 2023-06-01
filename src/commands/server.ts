import { commands, env, Uri } from 'vscode';

import { Commands } from './commands';
import { executeCommand } from './build';
import { closeTerminal, sendCommand } from '../terminal';
import { defaultAppPort, localAppUrl, preview } from './preview';
import { getNodeVersion, isSupportedNodeVersion } from '../node';
import { timeout } from '../utils/timer';
import { statusBar } from '../statusBar';
import { tryPort } from '../utils/httpUtils';

const localhost = 'localhost';
let _running: boolean = false;
let _activePort: number = defaultAppPort;

/**
 * Creates Evidence app page Uri from the provided pageUrl,
 * and rewrites the host name for the host and port forwarding
 * when running in GitHub Codespaces.
 *
 * @param pageUrl Optional target web page Url.
 *
 * @returns Rewritten page Uri with the active server port number,
 * and rewritten host name for the host and port forwarding
 * when running in GitHub Codespaces.
 */
export async function getAppPageUri(pageUrl?: string): Promise<Uri> {
  if (pageUrl === undefined) {
    pageUrl = localAppUrl;
  }

  // get external web page url
  let pageUri: Uri = await env.asExternalUri(Uri.parse(pageUrl));

  if (pageUri.authority.startsWith(localhost) && !isServerRunning()) {
    // get the next available localhost port number
    _activePort = await tryPort(defaultAppPort);
  }

  if (_activePort !== defaultAppPort) {
    // rewrite requested app page url to use the new active localhost server port
    pageUri = Uri.parse(pageUri.toString(true) // skip encoding
      .replace(`/:${defaultAppPort}/`, `/:${_activePort}/`));
  }
  console.log(pageUri);
  return pageUri;
}

/**
 * Starts Evidence app dev server, and opens Evidence app preview
 * in the built-in vscode simple browser.
 *
 * @param pageFileUri Optional Uri of the starting page to load in preview.
 */
export async function startServer(pageUri?: Uri) {
  if (!pageUri) {
    pageUri = await getAppPageUri(localAppUrl);
  }

  // check supported node version prior to server start
  const nodeVersion = await getNodeVersion();
  if (isSupportedNodeVersion(nodeVersion, 16, 14)) {

    if (!_running) {
      let devServerHostParameter: string = '';
      let serverPortParameter: string = '';
      if (!pageUri.authority.startsWith(localhost)) {
        // use remote host parameter to start dev server on github codespaces,
        // and assume default app port is available on remote host
        devServerHostParameter = ' -- --host 0.0.0.0';
      }
      else {
        // use the last saved active local host port number to start dev server
        serverPortParameter = ` -- --port ${_activePort}`;
      }

      // start dev server via terminal command
      executeCommand(`npm exec evidence dev${devServerHostParameter}${serverPortParameter}`);
    }

    // update server status and show running status bar icon
    statusBar.showRunning();

    // wait for the dev server to start
    await timeout(1000);
    _running = true;

    // wait for the server to process pages
    await timeout(5000);

    // set focus back to the active vscode editor group
    commands.executeCommand(Commands.FocusActiveEditorGroup);

    // open app preview
    preview(pageUri);
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
 * Gets active port number for Evidence app dev server.
 *
 * @returns Active port number.
 */
export function getActivePort() {
  return _activePort;
}

/**
 * Stops running app dev server,
 * resets active port number,
 * and closes Evidence app terminal.
 */
export function stopServer() {
  if (_running) {
    sendCommand('q', '', false);
  }

  // close Evidence server terminal instance
  closeTerminal();

  // reset server state and status display
  _running = false;
  _activePort = defaultAppPort;
  statusBar.showStart();
}
