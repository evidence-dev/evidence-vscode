import {
  window,
  workspace,
  RelativePattern,
  Uri,
  WorkspaceFolder,
  OutputChannel
} from 'vscode';

import {
  Settings,
  getConfig,
  getWorkspaceFolder,
  updateProjectContext
} from '../config';

import * as fs from 'fs';

import { getOutputChannel } from '../output';
import { statusBar } from '../statusBar';
import { cloneTemplateRepository } from './template';
import { getExtensionFileUri } from '../extensionContext';
import { folderExists, copyFolder } from '../utils/fsUtils';
import { showInstallDependencies } from '../views/prompts';

import {
  showSelectFolderDialog,
  showOpenFolder,
  showInvalidTemplateProjectUrlErrorMessage
} from '../views/prompts';

/**
 * Relative path to the built-in Evidence app /template folder
 *
 * @see https://github.com/evidence-dev/evidence-vscode/issues/61
 */
const extensionTemplateProjectFolderName: string = 'template';

/**
 * Default Evidence template project url setting value.
 *
 * @see https://github.com/evidence-dev/evidence-vscode/issues/62
 */
const templateProjectUrlSetting = '/template';

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

  // Check if the selected folder is empty
  try {
    const files = await fs.promises.readdir(projectFolder.fsPath);
    if (files.length > 0) {
      // The folder is not empty
      window.showErrorMessage('Select an empty folder to create a new Evidence project.');
      createNewProject();
      return;
    }
  } catch (error) {
    // Handle error while reading the folder
    console.error(`Error reading folder: ${error}`);
    return;
  }

  // get new project folder absolute/full path
  const projectFolderPath = projectFolder.fsPath;

  // display creating new Evidence project status in the output channel
  const outputChannel: OutputChannel = getOutputChannel();
  outputChannel.show();
  outputChannel.appendLine('\nCreating new project ...');
  outputChannel.appendLine(`- New Project Folder: ${projectFolderPath}`);

  // use new evidence template project Url setting
  // @see https://github.com/evidence-dev/evidence-vscode/issues/62
  const templateProjectUrl =
    <string>getConfig(Settings.TemplateProjectUrl, templateProjectUrlSetting);
  const projectTemplateUrl = templateProjectUrl;

  if (projectTemplateUrl.startsWith('https://')) {
    // attemplt to clone an Evidence template project from a github repository
    // into the selected new Evidence project folder
    await cloneTemplateRepository(projectTemplateUrl, projectFolderPath);
  }
  else if (projectTemplateUrl.startsWith('file://')) {
    // create local template folder Uri to check if that template folder exists
    const templateFolder: Uri = Uri.file(projectTemplateUrl.replace('file://', ''));

    if (await folderExists(templateFolder)) {
      outputChannel.appendLine(`- Template Project Folder: ${templateFolder.fsPath}`);

      // create new Evidence project folder from the local user-defined template folder
      createProjectFolder(templateFolder, projectFolder);
    }
    else {
      // template folder specified in evidence.templateProjectUrl settings doesn't exist
      showInvalidTemplateProjectUrlErrorMessage(projectTemplateUrl);
      outputChannel.appendLine(`✗ Ivalid Template Project Folder: ${projectTemplateUrl}`);
    }
  }
  else if (projectTemplateUrl === templateProjectUrlSetting) {

    // get built-in /template folder Uri from extension context
    const templateFolder: Uri = getExtensionFileUri(extensionTemplateProjectFolderName);

    if (await folderExists(templateFolder)) {
      outputChannel.appendLine(`- Template Project Folder: ${templateFolder.fsPath}`);

      // create new Evidence project folder from the built-in /template
      createProjectFolder(templateFolder, projectFolder);
    }
    else {
      // invalid built-in /template folder path
      showInvalidTemplateProjectUrlErrorMessage(templateFolder.fsPath);
      outputChannel.appendLine(`✗ Ivalid Template Project Folder: ${templateFolder.fsPath}`);
    }
  }
  else {
    // invalid template project Uri scheme
    showInvalidTemplateProjectUrlErrorMessage(projectTemplateUrl);
    outputChannel.appendLine(`✗ Ivalid Template Project Folder: ${projectTemplateUrl}`);
  }
}

/**
 * Creates new Evidence project folder from a local template project folder.
 *
 * @param templateFolder Template folder Uri.
 * @param projectFolder Target Evidence project folder Uri.
 */
async function createProjectFolder(templateFolder: Uri, projectFolder: Uri) {
  // copy template folder to the new project folder
  const projectFolderCreated: boolean = await copyFolder(templateFolder, projectFolder);
  if (projectFolderCreated) {

    // check if new Evidence project was created in the open workspace folder
    const workspaceFolder: WorkspaceFolder | undefined = getWorkspaceFolder();
    if (workspaceFolder?.uri.fsPath === projectFolder.fsPath) {
      // update Evidence project context and status bar
      // to enable all the Evidence project commands, etc.
      updateProjectContext();
      statusBar.showInstall();

      // prompt to install Evidence app dependencis in the open workspace
      showInstallDependencies();
    }
    else {
      // prompt to open created Evidence project subfolder
      // in a new VS Code workspace window
      // to enable all Evidence extensioin commands
      // and custom Evidence markdown Preview handling
      // for the Evidence app and markdown pages development
      showOpenFolder(projectFolder);
    }
  }
}
