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
export async function loadPackageJson(): Promise<any | undefined> {
  const packageJsonFiles = await workspace.findFiles('package.json');
  if (workspace.workspaceFolders && packageJsonFiles.length > 0) {
    // get package.json from the top workspace folder for now
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


/**
 * Checks loaded package.json configuration devDependencies
 * and dependencies for a dependency with the given name.
 *
 * @param packageJson Package json content.
 * @param dependencyName Dependency name to check.
 *
 * @returns the version number of the package if it exists
 */
export function dependencyVersion(packageJson: any, dependencyName: string): string {
  return packageJson.dependencies[dependencyName];
}

export type Manifest = {
  renderedFiles: Record<string, string[]>;
};

function validateManifest(x: any): x is Manifest {
  return x && 
    typeof x === 'object' &&
    typeof x.renderedFiles === 'object' && 
    Object.keys(x.renderedFiles).length > 0?
      Object.values(x.renderedFiles).every(Array.isArray)
      : true;
}

export async function getManifestUri(): Promise<Uri> {
  const [manifestUri] = await workspace.findFiles('**/.evidence/template/static/data/manifest.json', null, 1);
  return manifestUri;
}

export async function getManifest(uri: Uri): Promise<Manifest | null> {
  const manifestJson = await workspace.fs.readFile(uri);
  const manifest = JSON.parse(Buffer.from(manifestJson).toString());
  if (validateManifest(manifest)) {
    return manifest;
  }
  return null;
}
