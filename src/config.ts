import { commands } from 'vscode';
import { Commands } from './commands/commands';

/**
 * Updates Evidence project context values
 * to show available Evidence project commands in Command Palette.
 */
export function updateProjectContext() {
  // set Evidence has project context valule flag
  commands.executeCommand(Commands.SetContext, 'evidence.hasProject', true);
}
