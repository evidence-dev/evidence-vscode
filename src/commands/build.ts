import {
  workspace,
  FileStat,
  FileType,
  Uri
} from 'vscode';

import { sendCommand } from '../terminal';

/**
 * Node modules folder name to check in the open project workspace
 * for installed Evidence app NodeJS dependencies.
 *
 * @see https://docs.evidence.dev/getting-started/install-evidence
 */
const nodeModules = `node_modules`;

/**
 * Installs Evidence app NodeJS dependencies.
 *
 * @see https://docs.evidence.dev/getting-started/install-evidence
 */
export function installDependencies() {
  sendCommand('npm install');
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
    installDependencies();
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
