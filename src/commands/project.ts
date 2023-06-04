import {
  window,
  workspace,
  RelativePattern,
  Uri,
  OutputChannel
} from 'vscode';

import * as path from 'path';

import { getConfig } from '../config';
import { showSelectFolderDialog, showOpenFolder } from '../views/prompts';
import { gitHubUrlBase, cloneTemplateRepository } from './template';
import { getOutputChannel } from '../output';
import { getFileUri } from '../extensionContext';

/**
 * Default Evidence template project url.
 */
const defaultTemplateProjectUrl: string = '../../template';

/**
 * Evidence template project Url setting name.
 *
 * @see https://github.com/evidence-dev/evidence-vscode/issues/62
 */
const templateProjectUrlSetting = 'templateProjectUrl';

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

  // use new evidence template project Url setting
  // @see https://github.com/evidence-dev/evidence-vscode/issues/62
  const templateProjectUrl = <string>getConfig('templateProjectUrl', defaultTemplateProjectUrl);
  const projectTemplateUrl = templateProjectUrl;

  if (projectTemplateUrl.startsWith('https://')) {
    // attemplt to clone an Evidence template project from a github repository
    // into the selected new Evidence project folder
    await cloneTemplateRepository(projectTemplateUrl, projectFolderPath);
  }
  else if (projectTemplateUrl.startsWith('file://') &&
    (projectTemplateUrl === defaultTemplateProjectUrl ||
      projectTemplateUrl === '/template') ) {
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
