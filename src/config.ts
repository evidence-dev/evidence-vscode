import {
  commands,
  workspace,
  WorkspaceFolder
} from 'vscode';

import { Commands } from './commands/commands';

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
