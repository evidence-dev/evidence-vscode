import { exec } from 'child_process';
import { 
  window, 
  env, 
  Uri } from 'vscode';
import { showRestartPrompt } from './views/prompts';


const downloadNodeJs = 'Download NodeJS (LTS Version)';
const downloadNodeJsUrl = 'https://nodejs.org/en/download';


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
  const minMajorVersion = 16;
  const minMinorVersion = 14;

  // Maximum version of NodeJS required for Evidence:
  const maxMajorVersion = 20;
  const maxMinorVersion = 9;

  // check node version
  if (nodeVersion && nodeVersion.startsWith('v')) {
    const nodeVersionNumbers = nodeVersion.replace('v', '').split('.');
    const majorVersionNumber = parseInt(nodeVersionNumbers[0]);
    const minorVersionNumber = parseInt(nodeVersionNumbers[1]);

    let aboveMinVersion = false;
    let aboveMaxVersion = false;

    // Check if above min version:
    if (majorVersionNumber > minMajorVersion) {
      aboveMinVersion = true;
    }
    else if (majorVersionNumber === minMajorVersion &&
      minorVersionNumber >= minMinorVersion) {
      aboveMinVersion = true;
    }

    // Check if below max version:
    if (majorVersionNumber < maxMajorVersion) {
      aboveMaxVersion = true;
    }
    else if (majorVersionNumber === maxMajorVersion &&
      minorVersionNumber <= maxMinorVersion) {
      aboveMaxVersion = true;
    }

    return aboveMinVersion && aboveMaxVersion;
 
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

export async function promptToInstallNodeJsAndRestart(currentVersion: string | undefined) {
  const downloadNodeNotification = await window.showErrorMessage(
    currentVersion ? `Evidence requires NodeJS v16.14 to v20.9 - your NodeJS version is ${currentVersion}` : `Evidence requires NodeJS v16.14 to v20.9`,
    { title: downloadNodeJs }
  );

  if (downloadNodeNotification?.title === downloadNodeJs) {
    env.openExternal(Uri.parse(downloadNodeJsUrl));
  }
  
  showRestartPrompt();
}