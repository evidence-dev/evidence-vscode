import {
  commands,
  window,
  workspace
} from 'vscode';

import { Commands } from './commands';

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

  const template = await window.showInputBox({
    prompt: 'Evidence app template github repository Url',
    value: templateProjectUrl,
    ignoreFocusOut: true
  });

  if (!template) {
    return;
  }

  /*
  await window.withProgress({
    location: window.ProgressLocation.Notification,
    title: 'Creating Evidence app from a template''
  });*/
}
