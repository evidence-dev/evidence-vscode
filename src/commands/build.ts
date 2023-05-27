import {
  workspace,
  FileStat,
  FileType,
  Uri
} from 'vscode';

import { sendCommand } from '../terminal';
import { timeout } from '../utils/timer';
import { isServerRunning, stopServer } from './server';

/**
 * Node modules folder name to check in the open project workspace
 * for installed Evidence app NodeJS dependencies.
 *
 * @see https://docs.evidence.dev/getting-started/install-evidence
 */
const nodeModules = `node_modules`;

/**
 * Evidence node modules to update to the latest version.
 */
const evidencePackages: string[] = [
  '@evidence-dev/evidence@latest',
  '@evidence-dev/preprocess@latest',
  '@evidence-dev/components@latest'
];

/**
 * Installs Evidence app NodeJS dependencies.
 *
 * @see https://docs.evidence.dev/getting-started/install-evidence
 */
export async function installDependencies() {
  sendCommand('npm install');
  await timeout(15000);
}

/**
 * Updates all Evidence app librarires to the latest versions.
 */
export async function updateDependencies() {
  if (isServerRunning()) {
    stopServer();
    await timeout(1000);
  }
  sendCommand(`npm install ${evidencePackages.join(' ')}`);
}

/**
 * Builds Evidence project for deployment.
 *
 * @see https://docs.evidence.dev/deployment/overview#build-process
 */
export function buildProject() {
  executeCommand('npm run build');
}

/**
 * Builds Evidence project in a strict mode.
 *
 * @see https://docs.evidence.dev/deployment/overview#buildstrict
 */
export function buildProjectStrict() {
  executeCommand('npm run build:strict');
}

/**
 * Checks node modules dependencies,
 * install them if they don't exist,
 * and sends the requested project build command
 * to the Evidence terminal instance.
 *
 * @param command Terminal command to execute.
 */
export async function executeCommand(command: string) {
  if (!(await hasDependencies())) {
    await installDependencies();
  }
  sendCommand(command);
}

/**
 * Checks if open Evidence project has /node_modules folder
 * and NodeJS dependencies installed.
 *
 * @see https://docs.evidence.dev/getting-started/install-evidence
 */
export async function hasDependencies(): Promise<boolean> {
  if (workspace.workspaceFolders) {
    const nodeModulesUri: Uri = Uri.joinPath(workspace.workspaceFolders[0].uri, nodeModules);
    try {
      const nodeModulesStat: FileStat = await workspace.fs.stat(nodeModulesUri);
      return nodeModulesStat.type === FileType.Directory;
    }
    catch (error) {
      return false;
    }
  }
  return false;
}
