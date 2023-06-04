import {
  window
} from 'vscode';

import { commands, Uri } from 'vscode';

import { Commands } from '../commands/commands';
import { installDependencies } from '../commands/build';

/**
 * Displays a dialog to install Evidence node.js dependencies.
 */
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
 * Displays a dialog to select a folder.
 *
 * @returns The selected folder Uri, or undefined.
 */
export async function showSelectFolderDialog(): Promise<Uri[] | undefined> {
  // show open dialog to select an empty folder for a new Evidence project
  return await window.showOpenDialog({
    title: 'New Evidence Project Folder',
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    openLabel: 'Select an empty folder to create new Evidence project.'
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

/**
 * Displays invalid template project Url message.
 *
 * @param templateUrl The provided template project Url.
 */
export function showInvalidTemplateProjectUrlErrorMessage(templateUrl: string) {
  // show invalid template project Url message
  window.showErrorMessage(
    `Invalid Evidence project template Url: ${templateUrl}.`,
    'OK'
  );
}
