import {
  commands,
  window,
  workspace,
  ProgressLocation,
  OutputChannel,
  WorkspaceFolder,
  Uri
} from 'vscode';

import { Commands } from './commands';
import { getWorkspaceFolder, updateProjectContext } from '../config';
import { showInstallDependencies } from '../views/prompts';
import { timeout } from '../utils/timer';
import { statusBar } from '../statusBar';
import { deleteFile, deleteFolder } from '../utils/fsUtils';
import { getOutputChannel } from '../output';

/**
 * @see https://github.com/tiged/tiged#javascript-api
 */
const tiged = require('tiged');

/**
 * Open new project workspace prompt button title.
 */
const openNewProjectWorkspace = 'Open New Project Workspace';

/**
 * GitHub Url base for all the template github projects.
 */
export const gitHubUrlBase = 'https://github.com';

/**
 * Default Evidence app template project github Url.
 */
export const templateProjectUrl = `${gitHubUrlBase}/evidence-dev/template`;

/**
 * Creates new Evidence app project from a github repository template.
 *
 * @see https://github.com/evidence-dev/template
 */
export async function createProjectFromTemplate() {
  if (await projectHasFiles()) {
    // don't overwrite it
    return;
  }

  // show project template github repository Url input box
  const templateRepositoryUrl = await window.showInputBox({
    title: 'Evidence Template GitHub Url',
    prompt: 'Enter Evidence template repository GitHub Url',
    value: templateProjectUrl,
    ignoreFocusOut: true
  });

  if (!templateRepositoryUrl) {
    return;
  }
  else if (!templateRepositoryUrl.startsWith(gitHubUrlBase)) {
    window.showErrorMessage(`Invalid Evidence template GitHub Url: ${templateRepositoryUrl}.\
      Evidence extension only supports template repositories hosted on GitHub.\
      Provide a valid template repository GitHub Url, or use the default ${templateProjectUrl} instead.`);

    // display this prompt again with the default template repository Url
    createProjectFromTemplate();
    return;
  }

  if (!workspace.workspaceFolders) {
    window.showInformationMessage(
      'Open new empty project folder to create new Evidence project from a template.');
    return;
  }

  // get root project folder path and clone template repo into it
  const projectFolderPath: string = workspace.workspaceFolders[0].uri.fsPath;
  await cloneTemplateRepository(
    templateRepositoryUrl, projectFolderPath, true); // prompt to install dependencies
}

/**
 * Checks open project workspace for files,
 * and prompts to start new vscode project window.
 *
 * @returns True if open project workspace has files, and false otherwise.
 */
async function projectHasFiles(): Promise<boolean> {

  // check open project workspace for any files
  const files = await workspace.findFiles('**/*.*');
  if (files.length > 0) {
    const newProjectNotification = window.showInformationMessage(
      `Use new Workspace with an empty folder \
      to create new Evidence project from a template.`, {
      title: openNewProjectWorkspace,
      isCloseAffordance: true
    },
    {
      title: 'Cancel'
    });

    newProjectNotification.then(async (result) => {
      if (result?.title === openNewProjectWorkspace) {
        await commands.executeCommand(Commands.NewWindow);
      }
    });
    return true;
  }

  return false;
}

/**
 * Clones github repository to the destination project folder.
 *
 * @param templateRepositoryUrl Template GitHub repository Url with user and repository name.
 * @param projectFolderPath Destination project folder to clone template content to.
 * @param showInstallDependenciesNotification Optional show install dependencies notification flag.
 */
export async function cloneTemplateRepository(
  templateRepositoryUrl: string, projectFolderPath: string,
  showInstallDependenciesNotification: boolean = false) {

  // create user or organization and repository name path from github template repository Url
  const templateRepository = templateRepositoryUrl.replace(`${gitHubUrlBase}/`, '');

  // display project creation progress in Evidence Output view
  const outputChannel: OutputChannel = getOutputChannel();
  outputChannel.show();
  outputChannel.appendLine(`\nCloning ${templateRepositoryUrl}\n to: ${projectFolderPath}:`);

  await window.withProgress({
    location: ProgressLocation.Notification,
    title: 'Create Project',
    cancellable: false
  }, async (progress, token) => {
    // listen for cancellation
    token.onCancellationRequested(() => {
      outputChannel.appendLine('Canceled cloning template project.');
    });

    let increment = 0;
    progress.report({
      increment: increment,
      message: 'Cloning template repository...'
    });

    // clone template repository
    const emitter = tiged(templateRepository, {
      disableCache: true,
      force: true,
      verbose: true,
    });

    emitter.on('error', (error: any) => {
      outputChannel.appendLine(error);
      progress.report({
        message: `Error while cloning template repository.\n${error.message}`
      });
    });

    emitter.on('info', (info: any) => {
      // replace terminal ascii escape characters in the info message from github cloning library
      const infoMessage: string = info.message?.replaceAll('[1m', '').replaceAll('[22m', '')
        .replace(' to ', '\n to: '); // show destination on new line in the Output view

      if (!infoMessage.includes(' cache')) {
        // show git cloning info messages in the Evidence Output view
        outputChannel.appendLine(`- ${infoMessage}`);
      }

      // update cloning progress
      increment += 5;
      progress.report({
        increment: increment,
        message: infoMessage
      });
    });

    emitter.clone(projectFolderPath)
      .then(async () => {
        // display project creation progress in Evidence Output view
        outputChannel.appendLine(`✔ Finished creating Evidence project from ${templateRepositoryUrl}`);
        progress.report({
          increment: 100,
          message: 'Finished cloning template project.'
        });

        // degit.json does not seem to be respected by tiged in this case
        // add credentials file to .evidence/template/evidence.settings.json if it is using default template, and also delete the degit.json file
        if (templateRepositoryUrl === templateProjectUrl) {
          console.log('Adding credentials file to .evidence/template/evidence.settings.json');
          let credentialsString = `{"database":"duckdb","credentials":{"filename":"needful_things.duckdb","gitignoreDuckdb":null}}`
          await workspace.fs.writeFile(Uri.file(`${projectFolderPath}/.evidence/template/evidence.settings.json`), Buffer.from(credentialsString));
          await workspace.fs.delete(Uri.file(`${projectFolderPath}/degit.json`));
        }
        
        // update Evidence project context and status bar
        updateProjectContext();
        statusBar.showInstall();

        progress.report({
          increment: 100,
          message: 'Finished creating Evidence project.'
        });

        if (showInstallDependenciesNotification) {
          // prompt a user to install Evidence node.js dependencies
          showInstallDependencies();
        }
        else {
          // get open workspace folder
          const workspaceFolder: WorkspaceFolder | undefined = getWorkspaceFolder();

          // check if open workspace folder is the same as the created project folder
          if (workspaceFolder && workspaceFolder.uri.fsPath !== projectFolderPath) {
            commands.executeCommand(Commands.OpenFolder, Uri.file(projectFolderPath), true);
            // display Open Folder notification message
            // window.showInformationMessage(
            //   `Evidence project created in: ${projectFolderPath}.`,
            //   'Open Folder'
            // ).then((selection: string | undefined) => {
            //   if (selection === 'Open Folder') {
            //     // open created project folder in a new VS Code window
            //     // if the user selected the Open Folder option
            //     commands.executeCommand(Commands.OpenFolder, Uri.file(projectFolderPath), true);
            //   }
            // });
          }
        }
      })
      .catch((error: any) => {
        const errorMessage = `Error cloning template repository. ${error.message}`;
        outputChannel.appendLine(`✗ ${errorMessage}`);
        progress.report({ increment: 100 });
        window.showErrorMessage(errorMessage);
      });

    // 15 seconds delay for the github repo cloning progress display
    await timeout(15000);
  });
}
