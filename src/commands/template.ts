import {
  commands,
  window,
  workspace,
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
  cloneTemplateRepository(templateRepository, projectFolderPath);
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
      `Create new empty project for an Evidence app from a template.`, {
      title: 'Create new project',
      isCloseAffordance: true
    },
      {
        title: "Cancel"
      });

    newProjectNotification.then(async (result) => {
      if (result?.title === 'Create new project') {
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
function cloneTemplateRepository(templateRepository: string, projectFolderPath: string) {
  const outputChannel: OutputChannel = window.createOutputChannel('Evidence');
  outputChannel.show();

  const emitter = tiged(templateRepository, {
    disableCache: true,
    force: true,
    verbose: true,
  });

  emitter.on('error', (error: any) => {
    outputChannel.appendLine(error);
    window.showErrorMessage(error);
  });

  emitter.on('info', (info: any) => {
    outputChannel.appendLine(info.message);
  });

  emitter.clone(projectFolderPath)
    .then(() => {
      outputChannel.appendLine(`finiished cloning ${templateRepository} to ${projectFolderPath}`);
    })
    .catch((error: any) => {
      window.showErrorMessage(error);
      outputChannel.appendLine(error);
    });

  /*
  await window.withProgress({
    location: window.ProgressLocation.Notification,
    title: 'Creating Evidence app from a template''
  });*/
}
