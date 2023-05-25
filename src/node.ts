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
 * @param command The node command to execute.
 * @returns
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
