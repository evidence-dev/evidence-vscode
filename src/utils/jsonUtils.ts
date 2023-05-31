import {
  workspace,
  Uri
} from 'vscode';

import { TextDecoder } from 'util';

import { getWorkspaceFolder } from '../config';

/**
 * Loads package.json configuration file content from the open workspace folder.
 *
 * @returns package.json file content, or udefined if package.json file doesn't exist.
 */
export async function loadPackageJson() {
  if (workspace.workspaceFolders) {
    const packageJsonUri: Uri = Uri.joinPath(getWorkspaceFolder()!.uri, 'package.json');
    const packageJsonContent = await workspace.fs.readFile(packageJsonUri);
    const textDecoder = new TextDecoder('utf-8');
    const packageJson = JSON.parse(textDecoder.decode(packageJsonContent));

    return packageJson;
  }
  return undefined;
}

/**
 * Checks loaded package.json configuration devDependencies
 * and dependencies for a dependency with the given name.
 *
 * @param packageJson Package json content.
 * @param dependencyName Dependency name to check.
 *
 * @returns True if dependency exists and false otherwise.
 */
export function hasDependency(packageJson: any, dependencyName: string): boolean {
  return Boolean(packageJson?.dependencies?.[dependencyName] ||
    packageJson?.devDependencies?.[dependencyName]);
}
