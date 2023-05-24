import {
  window,
  workspace,
  Uri
} from 'vscode';

const settingsFilePath = '.evidence/template/evidence.settings.json';

export function openSettingsFile() {
  if (!workspace.workspaceFolders) {
    window.showErrorMessage('This command is only available when you have a workspace open.');
  }
  else {
    const settingsPath = Uri.joinPath(workspace.workspaceFolders[0].uri, settingsFilePath);
    window.showTextDocument(settingsPath);
  }
}
