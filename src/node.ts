import { exec } from 'child_process';

/**
 * Gets NodeJS version.
 *
 * @returns The NodeJS version.
 */
export async function getNodeVersion() {
  return await executeCommand('node --version');
}

/**
 * Executes command using node child_process.exec.
 *
 * @see https://nodejs.org/api/child_process.html#child_processexeccommand-options-callback
 *
 * @param command The node command to execute.
 * @returns The stdout of the executed command.
 */
export function executeCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      else {
        resolve(stdout);
      }
    });
  });
}
