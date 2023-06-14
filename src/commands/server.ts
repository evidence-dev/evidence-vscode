import { commands, env, workspace, Uri, window } from 'vscode';

import { Commands } from './commands';
import { Settings, getConfig } from '../config';
import { getOutputChannel } from '../output';
import { closeTerminal, sendCommand } from '../terminal';
import { localAppUrl, preview } from './preview';
import { getNodeVersion, isSupportedNodeVersion } from '../node';
import { showInstallDependencies } from '../views/prompts';
import { statusBar } from '../statusBar';
import { timeout } from '../utils/timer';
import { tryPort } from '../utils/httpUtils';

const localhost = 'localhost';
let _running: boolean = false;
let _activePort: number = <number>getConfig(Settings.DefaultPort);

const downloadNodeJs = 'Download NodeJS';
const downloadNodeJsUrl = 'https://nodejs.org/en/download';

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
  const defaultPort = <number>getConfig(Settings.DefaultPort);
  const serverUrl = `${localAppUrl}:${defaultPort}`;
  if (pageUrl === undefined) {
    pageUrl = serverUrl;
  }
  else if (pageUrl.startsWith('/')) {
    // construct page url for page path wihtout host and port
    pageUrl = `${localAppUrl}:${defaultPort}${pageUrl}`;
  }

  // get external web page url
  let pageUri: Uri = await env.asExternalUri(Uri.parse(pageUrl));

  // update active server port number
  if (!_running) { //pageUri.authority.startsWith(localhost) && !isServerRunning()) {
    // get the next available localhost port number
    _activePort = await tryPort(defaultPort);
  }

  // rewrite requested app page url to use the new active localhost server port
  pageUri = Uri.parse(pageUri.toString(true) // skip encoding
    .replace(`:${defaultPort}/`, `:${_activePort}/`));

  const outputChannel = getOutputChannel();
  outputChannel.appendLine(`Requested app page: ${pageUri.toString(true)}`); // skip encoding
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
    pageUri = await getAppPageUri('/');
  }

  const previewType: string = <string>getConfig(Settings.PreviewType);

  // check supported node version prior to server start
  const nodeVersion = await getNodeVersion();
  if (!isSupportedNodeVersion(nodeVersion)) {
      // prompt to download and install the required NodeJS version
      const downloadNodeNotification = window.showErrorMessage(
        'Evidence requires NodeJS v16.14 or greater.', {
          title: downloadNodeJs
        });
  
      downloadNodeNotification.then(async (result) => {
        if (result?.title === downloadNodeJs) {
          env.openExternal(Uri.parse(downloadNodeJsUrl));
        }
      });

  } else {

    // check for /node_modules before starting dev server
    let dependencyCommand = "";
    const nodeModules = await workspace.findFiles('**/node_modules/**/*.*');
    if (nodeModules.length === 0) {
      // prompt a user to install Evidence node.js dependencies
      // showInstallDependencies();
      // return;

      dependencyCommand = `npm install && `;
    }

    if (!_running) {
      // use the last saved active port number to start dev server
      const serverPortParameter = ` --port ${_activePort}`;

      let devServerHostParameter: string = '';
      if (!pageUri.authority.startsWith(localhost)) {
        // use remote host parameter to start dev server on github codespaces
        devServerHostParameter = ' --host 0.0.0.0';
      }

      let previewParameter: string = '';
      if(previewType === 'external'){
        previewParameter = ' --open /';
      }

      // start dev server via terminal command
      sendCommand(`${dependencyCommand}npm exec evidence dev --${devServerHostParameter}${serverPortParameter}${previewParameter}`);
    }

    // update server status and show running status bar icon
    statusBar.showRunning();

    _running = true;

    // wait for the dev server to start
    await timeout(1000);

    // wait for the server to process pages
    await timeout(5000);

    if(_running === true){
      // set focus back to the active vscode editor group
      commands.executeCommand(Commands.FocusActiveEditorGroup);

      // open app preview if previewType is set to internal (simple browser)
      if(previewType === 'internal' || previewType === 'internal - side-by-side'){
        preview(pageUri);
      }

      // change button to stop server
      statusBar.showStop();
    }
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
export async function stopServer() {
  if (_running) {
    sendCommand('q', '', false);
  }

  // close Evidence server terminal instance
  closeTerminal();

  // reset server state and status display
  _running = false;
  _activePort = <number>getConfig(Settings.DefaultPort);
  statusBar.showStart();
}
