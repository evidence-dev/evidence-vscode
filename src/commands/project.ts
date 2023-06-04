import {
  window,
  workspace,
  RelativePattern,
  Uri,
  OutputChannel
} from 'vscode';

import * as path from 'path';

import { showSelectFolderDialog, showOpenFolder } from '../views/prompts';
import { gitHubUrlBase, templateProjectUrl, cloneTemplateRepository } from './template';
import { getOutputChannel } from '../output';
import { getFileUri } from '../extensionContext';

/**
 * Default Evidence template project url.
 */
const defaultTemplateProjectUrl = '../../template';

/**
 * Creates a new Evidence project.
 *
 * @param {Uri} projectFolder Optional project folder Uri to create the project in.
 */
export async function createNewProject(projectFolder?: Uri) {

  if (!projectFolder) {
    const selectedFolders: Uri[] | undefined = await showSelectFolderDialog();
    if (!selectedFolders) {
      // user cancelled folder selection and new Evidence project creation action
      return;
    }
    else {
      // get the first selected folder
      projectFolder = selectedFolders[0];
    }
  }

  // get the list of files and folders in the selected new project folder
  const projectFiles = await workspace.findFiles(
    new RelativePattern(projectFolder.fsPath, '**/*'));

  // check if the selected folder is empty
  if (projectFiles.length > 0 ) {

    // prompt to select an empty new project folder
    window.showErrorMessage(
     'Select an empty folder to create a new Evidence project.');

    // display create new project dialog again
    createNewProject();
    return;
  }

  // get new project folder path and name
  const projectFolderPath = projectFolder.fsPath;
  const projectFolderName = path.basename(projectFolderPath);

  // display creating new Evidence project status in the output channel
  const outputChannel: OutputChannel = getOutputChannel();
  outputChannel.show();
  outputChannel.append(`\nCreating new project ...\n- New Project Folder: ${projectFolderPath}\n`);

  // TODO: add and use new evidence.templateProjectUrl setting
  // to determine if user prefers to create new project
  // from the template project github url or
  // use new simple template from exension /template folder
  // @see https://github.com/evidence-dev/evidence-vscode/issues/61
  const projectTemplateUrl = templateProjectUrl;

  if (projectTemplateUrl.startsWith(gitHubUrlBase)) {
    // clone default Evidence template project from github repository
    // into the selected new Evidence project folder
    await cloneTemplateRepository(templateProjectUrl, projectFolderPath);
  }
  else if (projectTemplateUrl === defaultTemplateProjectUrl) {
    // get embedded /template folder Uri from extension context
    const templateFolder: Uri = getFileUri(defaultTemplateProjectUrl);

    // copy template folder to the new project folder
    const projectFolderCreated: boolean = await copyFolder(templateFolder, projectFolder);
    if (projectFolderCreated) {
      // display Open Folder prompt to open newly created Evidence project
      // in a new VS Code workspace window and enable all Evidence extensioin commands
      // in the open workspace with an Evidence project for the app and markdown pages development
      showOpenFolder(projectFolder);
    }
  }
}

/**
 * Copies template folder to the destination project folder.
 *
 * @param templateFolder Template folder Uri.
 * @param destinationFolder Destination folder Uri.
 */
async function copyFolder(templateFolder: Uri, destinationFolder: Uri): Promise<boolean> {
  // display folder copy progress in the output channel
  const outputChannel: OutputChannel = getOutputChannel();
  outputChannel.show();
  outputChannel.appendLine('\nCreating project from template ...');
  outputChannel.appendLine(`- Template Project: ${templateFolder.fsPath}\n`);

  try {
    await workspace.fs.copy(templateFolder, destinationFolder, { overwrite: true });
    outputChannel.appendLine(`✔ New project created successfully.`);
    return true;
  }
  catch (error) {
    outputChannel.appendLine('✗ Error copying template project:');
    outputChannel.appendLine(` ${error}`);
    return false;
  }
}
