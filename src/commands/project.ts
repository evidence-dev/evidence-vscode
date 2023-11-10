import {
  window,
  workspace,
  commands,
  RelativePattern,
  Uri,
  WorkspaceFolder,
  OutputChannel,
  env
} from 'vscode';
import { promises as fs } from 'fs';
import * as path from 'path';
import {
  Settings,
  getConfig,
  getWorkspaceFolder,
  updateProjectContext
} from '../config';

import { Commands } from './commands';
import { getOutputChannel } from '../output';
import { statusBar } from '../statusBar';
import { cloneTemplateRepository } from './template';
import { getExtensionFileUri } from '../extensionContext';
import { folderExists, copyFolder } from '../utils/fsUtils';
import { openNewProjectFolder, showInstallDependencies } from '../views/prompts';

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
 * @param {string} projectUrl Optional template project url to copy the project from. If not provided, the template project will be used.
 */
export async function createNewProject(projectFolder?: Uri, projectUrl?: string) {

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
  const projectFiles = await workspace.fs.readDirectory(projectFolder);

  // check if the selected folder is empty
  if (projectFiles.length > 0 ) {

    // prompt to select an empty new project folder
    window.showErrorMessage(
     'Selected folder must be empty to create a new Evidence project.', {modal: true});

    // display create new project dialog again
    createNewProject();
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
  
  // if the projectUrl is defined, use that instead of the templateProjectUrl
  const projectTemplateUrl = projectUrl ? projectUrl : templateProjectUrl;

  if (projectTemplateUrl.startsWith('https://')) {
    // attempt to clone an Evidence template project from a github repository
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
      outputChannel.appendLine(`✗ Invalid Template Project Folder: ${projectTemplateUrl}`);
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
      outputChannel.appendLine(`✗ Invalid Template Project Folder: ${templateFolder.fsPath}`);
    }
  }
  else {
    // invalid template project Uri scheme
    showInvalidTemplateProjectUrlErrorMessage(projectTemplateUrl);
    outputChannel.appendLine(`✗ Invalid Template Project Folder: ${projectTemplateUrl}`);
  }
}

/**
 * Copies an existing Evidence project from a remote repository, without retaining the git history.
 */
export async function copyProject(){
  // ask the user for the remote repository url
  const projectUrl = await window.showInputBox({
    prompt: 'Enter an Evidence repository URL to copy',
    ignoreFocusOut: true
  });
  // if the user cancelled the input box, return
  if(!projectUrl) {
    return;
  };
  createNewProject(undefined, projectUrl);
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

    // If the environment is not Codespaces, remove the .devcontainer folder
    if (env.remoteName !== 'codespaces') {
      const devContainerPath = path.join(projectFolder.fsPath, '.devcontainer');
      try {
        await fs.rm(devContainerPath, { recursive: true, force: true });
      } catch (error) {
        // fail silently - leave the devcontainer folder in
      }
    }

    // check if new Evidence project was created in the open workspace folder
    const workspaceFolder: WorkspaceFolder | undefined = getWorkspaceFolder();
    if (workspaceFolder?.uri.fsPath === projectFolder.fsPath) {
      // update Evidence project context and status bar
      // to enable all the Evidence project commands, etc.
      updateProjectContext();
      statusBar.showInstall();

      // prompt to install Evidence app dependencies in the open workspace
      showInstallDependencies();
    }
    else {
      // prompt to open created Evidence project subfolder
      // in a new VS Code workspace window
      // to enable all Evidence extension commands
      // and custom Evidence markdown Preview handling
      // for the Evidence app and markdown pages development
      openNewProjectFolder(projectFolder);
    }
  }
}

/**
 * Opens index.md if no other files are open in the VS Code Workspace
 *
 */
export async function openIndex() {
  // This requires error handling for situations where an index file does not exist.
  // In that case, it should not execute anything.

  let openFiles = workspace.textDocuments;

  if(openFiles.length === 0){
    const folderPath = getWorkspaceFolder();
    const filePath = folderPath?.uri + '/pages/index.md';
    const fileUri = Uri.parse(filePath);
    await commands.executeCommand('vscode.open', fileUri, 1);  
    await commands.executeCommand('vscode.open', fileUri, 2);  
    openWalkthrough();
  }
}


export async function openWalkthrough(){
  await commands.executeCommand(Commands.OpenWalkthrough, `Evidence.evidence-vscode#getStarted`, false);
}
