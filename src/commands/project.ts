import {
  window,
  workspace,
  RelativePattern,
  Uri,
  OutputChannel,
  ProgressLocation
} from 'vscode';

import * as path from 'path';

import { getOutputChannel } from '../output';

/**
 * Create a new Evidence project in the given folder.
 *
 * @param {Uri} projectFolderUri Optional project folder Uri to create the project in.
 */
export async function createNewProject(projectFolderUri?: Uri) {

  if (!projectFolderUri) {
    const selectedFolders: Uri[] | undefined = await showSelectFolderDialog();
    if (!selectedFolders) {
      // user cancelled folder selection and new Evidence project creation action
      return;
    }
    else {
      // get the first selected folder
      projectFolderUri = selectedFolders[0];
    }
  }

  // get the list of files and folder in the selected new project folder
  const projectFiles = await workspace.findFiles(
    new RelativePattern(projectFolderUri.fsPath, '**/*'));

  // check if the selected folder is empty
  if (projectFiles.length > 0 ) {
    // prompt to select an empty new project folder
    // and display the project selection dialog again
    window.showInformationMessage(
     'Select an empty folder to create a new Evidence project.');

    // display create new project dialog again
    createNewProject();
    return;
  }

  // get new project folder path and name
  const projectFolderPath = projectFolderUri.fsPath;
  const projectFolderName = path.basename(projectFolderPath);

  // display creating new Evidence project status in the output channel
  const outputChannel: OutputChannel = getOutputChannel();
  outputChannel.show();
  outputChannel.append(`\nCreating new Evidence project ...\n\
  - ProjectFolder: ${projectFolderPath}`);

  window.withProgress({
    location: ProgressLocation.Notification,
    title: 'New Evidence Project',
    cancellable: false,
  }, async (progress, token) => {

    let increment = 0;
    progress.report({
      increment: increment,
      message: `Creating new Evidence project in ${projectFolderPath}`
    });

    progress.report({
      increment: 100,
      message: 'TODO: creat project from template in'+ projectFolderName });
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
