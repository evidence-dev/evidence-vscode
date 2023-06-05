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

import { waitFor } from '../utils/httpUtils';

/**
 * Local Evidence app url.
 */
export const localAppUrl = `http://localhost`;

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
  let pageUrl: string = '/';

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
    pageUrl = `/${pagePath}`;
  }

  // create external app page Uri from page url
  const pageUri: Uri = await getAppPageUri(pageUrl);

  // start server if not running
  if (!isServerRunning()) {
    startServer(pageUri);
  }
  else {
    // open requested page in the built-in simple browser webview
    openPageView(pageUri);

    // wait for the server to load the page
    await waitFor(pageUri.toString(true), 1000, 30000); // encoding, ms interval, max total wait time ms

    // call the built-in simple browser once more to load page conent
    openPageView(pageUri);
  }
}

/**
 * Opens a page in the built-in VSCode Simple Browser webview.
 *
 * @param pageUri Uri of the page to open.
 */
async function openPageView(pageUri: Uri) {
  if (pageUri) {
    // open requested page in the built-in simple browser webview
    commands.executeCommand(Commands.ShowSimpleBrowser,
      pageUri.toString(true)); // skip encoding
  }
}
