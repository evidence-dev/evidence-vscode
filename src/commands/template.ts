import {
  commands,
  window,
  workspace,
  ProgressLocation,
  OutputChannel
} from 'vscode';

import { Commands } from './commands';

/**
 * @see https://github.com/tiged/tiged#javascript-api
 */
const tiged = require('tiged');

/**
 * Default Evidence app template project github Url.
 */
const templateProjectUrl = 'https://github.com/evidence-dev/template';

/**
 * Create new project prompt button title.
 */
const creteNewProject = 'Create New Project';

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
  const templateGithubUrl = await window.showInputBox({
    prompt: 'Evidence app template github repository Url',
    value: templateProjectUrl,
    ignoreFocusOut: true
  });

  if (!templateGithubUrl) {
    return;
  }

  const templateRepository = templateGithubUrl.replace('https://github.com/', '');

  if (!workspace.workspaceFolders) {
    window.showErrorMessage('This command is only available when you have an Evidence project workspace open.');
    return;
  }

  const projectFolderPath: string = workspace.workspaceFolders[0].uri.fsPath;
  await cloneTemplateRepository(templateRepository, projectFolderPath);
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
      `Create new empty project for an Evidence app from template.`, {
      title: creteNewProject,
      isCloseAffordance: true
    },
    {
      title: 'Cancel'
    });

    newProjectNotification.then(async (result) => {
      if (result?.title === creteNewProject) {
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
 * @param templateRepository Template github repository with user and repository name.
 * @param projectFolderPath Destination project folder to clone template content to.
 */
async function cloneTemplateRepository(templateRepository: string, projectFolderPath: string) {
  const outputChannel: OutputChannel = window.createOutputChannel('Evidence');
  outputChannel.show();

  await window.withProgress({
    location: ProgressLocation.Notification,
    title: 'Creating Evidence project from a template ...',
    cancellable: false
  }, async (progress, token) => {
    token.onCancellationRequested(() => {
      outputChannel.appendLine('Canceled cloning Evidence app template.');
    });

    let progressIncrement = 0;
    progress.report({increment: 0});

    const emitter = tiged(templateRepository, {
      disableCache: true,
      force: true,
      verbose: true,
    });

    emitter.on('error', (error: any) => {
      outputChannel.appendLine(error);
      progress.report({
        message: `Error while cloning Evidence app template repository. ${error.message}`
      });
    });

    emitter.on('info', (info: any) => {
      progressIncrement += 5;
      progress.report({increment: progressIncrement});
      outputChannel.appendLine(info.message);
    });

    emitter.clone(projectFolderPath)
      .then(() => {
        outputChannel.appendLine(`finished cloning ${templateRepository} to ${projectFolderPath}`);
        progress.report({
          increment: 100,
          message: 'Finished cloning Evidence project template.'
        });
      })
      .catch((error: any) => {
        outputChannel.appendLine(error);
        progress.report({
          message: `Error cloning Evidence app template repository. ${error.message}`
        });
      });

    await new Promise(resolve => setTimeout(resolve, 15000));
  });
}
