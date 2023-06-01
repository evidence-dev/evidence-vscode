/* eslint-disable @typescript-eslint/naming-convention */
import {
  commands,
  workspace,
  WorkspaceFolder
} from 'vscode';

import { Commands } from './commands/commands';

/**
 * VSCode and Evidence extension settings.
 */
export const enum Settings {
  DefaultPort = 'defaultPort',
  AutoStart = 'autoStart'
}

/**
 * Gets Evidence extension configuration setting.
 *
 * @param settingName Configuration setting name.
 * @param defaultValue Optional efault setting value to use when not found.
 * @returns
 */
export function getConfig<T>(settingName: string, defaultValue?: T) {
  return workspace.getConfiguration().get(`evidence.${settingName}`, defaultValue);
}

/**
 * Updates Evidence project context values
 * to show available Evidence project commands in Command Palette.
 */
export function updateProjectContext() {
  // set Evidence has project context valule flag
  commands.executeCommand(Commands.SetContext, 'evidence.hasProject', true);
}

/**
 * Gets the first workspace folder.
 *
 * @see https://code.visualstudio.com/docs/editor/multi-root-workspaces
 *
 * @returns {WorkspaceFolder | undefined} The first workspace folder.
 */
export function getWorkspaceFolder(): WorkspaceFolder | undefined {
  const workspaceFolders = workspace.workspaceFolders;
  if (workspaceFolders) {
    return workspaceFolders[0];
  }
  return undefined;
}
