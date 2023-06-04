import {
  window
} from 'vscode';

import { commands, Uri } from 'vscode';

import { Commands } from '../commands/commands';
import { installDependencies } from '../commands/build';

export async function showInstallDependencies() {
  // prompt a user to install Evidence node.js dependencies
  window.showInformationMessage(
    'Would you like to install Evidence dev server dependencies?', 'Yes', 'No')
    .then((selection) => {
      if (selection === 'Yes') {
        installDependencies();
      }
    });

}

/**
 * Displays Open Folder notification message,
 * and opens it in a new VS Code window
 * when a user confirms the Open Folder dialog selection.
 *
 * @param projectFolder Project folder to open.
 */
export async function showOpenFolder(projectFolder: Uri) {
  // display Open Folder notification message
  window.showInformationMessage(
    `Evidence project created in: ${projectFolder.fsPath}.`,
    'Open Folder'
  ).then((selection: string | undefined) => {
    if (selection === 'Open Folder') {
      // open created project folder in a new VS Code window
      // if the user selected the Open Folder option
      commands.executeCommand(Commands.OpenFolder, projectFolder, true);
    }
  });

}