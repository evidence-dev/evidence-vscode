import {
  commands,
  window,
  workspace,
  Uri
} from 'vscode';

import { Commands } from './commands';
import { localAppUrl } from './preview';

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

export function viewAppSettings() {
  commands.executeCommand(Commands.ShowSimpleBrowser, settingsPageUrl);
}

/**
 * Opens Evidence settings file for editing.
 */
export function openSettingsFile() {
  if (!workspace.workspaceFolders) {
    window.showErrorMessage('This command is only available when you have an Evidence project workspace open.');
  }
  else {
    const settingsFileUri: Uri = Uri.joinPath(workspace.workspaceFolders[0].uri, settingsFilePath);
    window.showTextDocument(settingsFileUri);
  }
}
