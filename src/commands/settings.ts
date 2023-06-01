import {
  commands,
  env,
  window,
  workspace,
  Uri
} from 'vscode';

import { Commands } from './commands';
import { getWorkspaceFolder } from '../config';
import { localAppUrl } from './preview';

import {
  getAppPageUri,
  isServerRunning,
  startServer
} from './server';

/**
 * Evidence app setting file location to configure data sources.
 */
const settingsFilePath = '.evidence/template/evidence.settings.json';

/**
 * Evidence app settings page to configure data source(s).
 *
 * @see https://docs.evidence.dev/core-concepts/data-sources/
 */
const settingsPageUrl = `${localAppUrl}/settings`;

/**
 * Opens Evidence app settings page in the built-in vscode simple browser webview.
 */
export async function viewAppSettings() {
  const settingsPageUri: Uri = await getAppPageUri(settingsPageUrl);
  if (!isServerRunning()) {
    startServer(settingsPageUri);
  }
  else {
    // show app settings page in simple browser webview
    commands.executeCommand(Commands.ShowSimpleBrowser,
      settingsPageUri.toString(true)); // skip encoding
  }
}

/**
 * Opens Evidence settings file in JSON editor for editing.
 */
export function openSettingsFile() {
  if (!workspace.workspaceFolders) {
    window.showErrorMessage('This command is only available when you have an Evidence project workspace open.');
  }
  else {
    const settingsFileUri: Uri = Uri.joinPath(getWorkspaceFolder()!.uri, settingsFilePath);
    window.showTextDocument(settingsFileUri);
  }
}
