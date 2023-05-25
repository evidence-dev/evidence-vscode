import {
  commands,
  window,
  workspace
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
  const files = await workspace.findFiles('**/*.*');
  if (files.length > 0) {
    const newProjectNotification = window.showInformationMessage(
      `Use new empty project folder to create Evidence app from a template.`, {
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
    return;
  }

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
  const emitter = tiged(templateRepository, {
    disableCache: true,
    force: true,
    verbose: true,
  });

  emitter.on('error', (error: any) => {
    window.showErrorMessage(error);
  });

  emitter.on('info', (info: any) => {
    console.log(info.message);
  });

  emitter.clone(projectFolderPath)
    .then(() => {
      console.log('done');
    })
    .catch((error: any) => {
      console.error(error);
    });

  /*
  await window.withProgress({
    location: window.ProgressLocation.Notification,
    title: 'Creating Evidence app from a template''
  });*/
}
