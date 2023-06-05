import {
  commands,
  workspace,
  Uri
} from 'vscode';

import { Commands } from './commands';
import { getExtensionContext } from '../extensionContext';
import { Context, getWorkspaceFolder } from '../config';

import {
  getAppPageUri,
  isServerRunning,
  startServer
} from './server';

import { waitFor } from '../utils/httpUtils';
import { get } from 'http';

/**
 * Local Evidence app url.
 */
export const localAppUrl = `http://localhost`;

/**
 * Opens a markdown document Preview webview.
 *
 * Uses the built-in vscode markdown document preview webview
 * for the standard markdown documents, and .md documents
 * not in the Evidence /pages/ folder.
 *
 * For the Evidence markdown documents in the /pages/ folder,
 * opens the requested app page in the built-in simple browser webview.
 *
 * @param uri Optional Uri of the markdown document to preview.
 *
 * @see Simple browser extension implementation:
 *  https://github.com/microsoft/vscode/pull/109276
 */
export async function preview(uri?: Uri) {
  // default page url
  let pageUrl: string = '/';

  // check if the open workspace has an Evidence project
  const isEvidenceProject =
    getExtensionContext().workspaceState.get(Context.HasEvidenceProject);

  // check for a regular markdown document, like README.md, etc.
  // in an open workspace without or with an Evidence project folder
  // @see https://github.com/evidence-dev/evidence-vscode/issues/67
  if (!isEvidenceProject || !uri?.path.includes('/pages/')) {
    // show standard markdown document preview
    commands.executeCommand(Commands.MarkdownShowPreview, uri);
    return;
  }

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
