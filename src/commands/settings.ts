import {
  window,
  workspace,
  Uri
} from 'vscode';

/**
 * Evidence app setting file location to configure data sources.
 */
const settingsFilePath = '.evidence/template/evidence.settings.json';

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
