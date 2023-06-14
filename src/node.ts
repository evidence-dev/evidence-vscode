import { exec } from 'child_process';
import { window } from 'vscode';

/**
 * Gets NodeJS version.
 *
 * @returns The NodeJS version.
 */
export async function getNodeVersion() {
  let nodeVersion;
  try {
    nodeVersion = await executeCommand('node --version');
  } catch(e) {
    nodeVersion = "none";
  }
  return nodeVersion;
}

/**
 * Checks if the provided NodeJS version string
 * meets the major and minor version requirements.
 *
 * @param nodeVersion NodeJS version string to check.
 *
 * @returns True if NodeJS version is equal or greater
 *  than the major and minor version numbers, and false otherwise.
 */
export function isSupportedNodeVersion(nodeVersion: string): boolean {

  // Minimum version of NodeJS required for Evidence:
  const majorVersion = 16;
  const minorVersion = 14;

  // check node version
  if (nodeVersion && nodeVersion.startsWith('v')) {
    const nodeVersionNumbers = nodeVersion.replace('v', '').split('.');
    const majorVersionNumber = parseInt(nodeVersionNumbers[0]);
    const minorVersionNumber = parseInt(nodeVersionNumbers[1]);

    if (majorVersionNumber > majorVersion) {
      return true;
    }
    else if (majorVersionNumber === majorVersion &&
      minorVersionNumber >= minorVersion) {
      return true;
    }
  }
  return false;
}

/**
 * Gets NPM version.
 *
 * @returns The NPM version.
 */
export async function getNpmVersion() {
  return await executeCommand('npm --version');
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


export async function nodeCheck() {
  const nodeVersion = await getNodeVersion();
  const isSupported = isSupportedNodeVersion(nodeVersion);

  if(!isSupported){
    window.showErrorMessage(`Not right NodeJS!`);
  }
}