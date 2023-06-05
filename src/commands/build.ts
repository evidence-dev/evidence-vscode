import {
  workspace,
  FileStat,
  FileType,
  Uri,
  WorkspaceFolder
} from 'vscode';

import { sendCommand } from '../terminal';
import { timeout } from '../utils/timer';
import { isServerRunning, stopServer } from './server';
import { statusBar } from '../statusBar';
import { getWorkspaceFolder, updateProjectContext } from '../config';

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
  if (isServerRunning()) {
    stopServer();
    await timeout(1000);
  }
  else {
    // update open workspace context
    updateProjectContext();
  }

  sendCommand('npm install');
  await timeout(1000);
  statusBar.showInstalling();
  await timeout(25000);
  statusBar.showStart();
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
  await timeout(5000);
  statusBar.showStart();
}

/**
 * Builds Evidence project for deployment.
 *
 * @see https://docs.evidence.dev/deployment/overview#build-process
 */
export async function buildProject() {
  if (isServerRunning()) {
    stopServer();
    await timeout(1000);
  }
  executeCommand('npm run build');
}

/**
 * Builds Evidence project in a strict mode.
 *
 * @see https://docs.evidence.dev/deployment/overview#buildstrict
 */
export async function buildProjectStrict() {
  if (isServerRunning()) {
    stopServer();
    await timeout(1000);
  }
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
  const workspaceFolder: WorkspaceFolder | undefined = getWorkspaceFolder();
  if (workspaceFolder) {
    const nodeModulesUri: Uri = Uri.joinPath(workspaceFolder.uri, nodeModules);
    try {
      const nodeModulesStat: FileStat = await workspace.fs.stat(nodeModulesUri);
      return (nodeModulesStat.type === FileType.Directory);
    }
    catch (error) {
      return false;
    }
  }
  return false;
}
