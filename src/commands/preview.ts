import {
  commands,
  env,
  workspace,
  Uri
} from 'vscode';

import { Commands } from './commands';
import { getWorkspaceFolder } from '../config';

import {
  getAppPageUri,
  isServerRunning,
  startServer
} from './server';


/**
 * Default Evidence app port.
 */
export const defaultAppPort: number = 3000;

/**
 * Local Evidence app url.
 */
export const localAppUrl = `http://localhost:${defaultAppPort}`;

/**
 * Opens Evidence app or markdown page preview
 * in the built-in VSCode Simple Browser webview.
 *
 * @param uri Optional Uri of the page to preview.
 *
 * @see Simple browser extension implementation:
 *  https://github.com/microsoft/vscode/pull/109276
 */
export async function preview(uri?: Uri) {
  // default page url
  let pageUrl: string = localAppUrl;

  // create web page url from page Uri
  if (uri && (uri.scheme === 'http' || uri.scheme === 'https')) {
    pageUrl = uri.toString(true); // skip encoding
  }
  else if (uri && uri.scheme === 'file' && workspace.workspaceFolders) {
    // get project folder root path
    const workspaceFolderPath: string = getWorkspaceFolder()!.uri.fsPath;

    // create web page url from file Uri by converting .md path to app page path
    let pagePath: string = uri.fsPath.replace(workspaceFolderPath, '')
      .split('\\').join('/').replace('/pages/', '')
      .replace('index.md', '').replace('.md', '');
    pageUrl = `${localAppUrl}/${pagePath}`;
  }

  // create external app page Uri from page url
  const pageUri: Uri = await getAppPageUri(pageUrl);

  // start server if not running
  if (!isServerRunning()) {
    startServer(pageUri);
  }
  else {
    // open web page in the built-in simple browser webview
    commands.executeCommand(Commands.ShowSimpleBrowser,
      pageUri.toString(true)); // skip encoding
  }
}
