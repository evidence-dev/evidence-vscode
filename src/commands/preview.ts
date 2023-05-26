import {
  commands,
  workspace,
  Uri
} from 'vscode';

import { Commands } from './commands';

/**
 * Local Evidence app url with a port.
 */
export const localAppUrl = 'http://localhost:3000';

/**
 * Opens Evidence app or markdown page preview
 * in the built-in VSCode Simple Browser webview.
 *
 * @param uri Optional Uri of the page to preview.
 */
export function preview(uri?: Uri) {
  let pageUrl: string = localAppUrl;
  if (uri && workspace.workspaceFolders) {
    const workspaceFolderPath: string = workspace.workspaceFolders[0].uri.fsPath;
    let pagePath: string = uri.fsPath.replace(workspaceFolderPath, '')
      .split('\\').join('/').replace('/pages/', '')
      .replace('index.md', '').replace('.md', '');
    pageUrl = `${localAppUrl}/${pagePath}`;
  }
  commands.executeCommand(Commands.ShowSimpleBrowser, pageUrl);
}
