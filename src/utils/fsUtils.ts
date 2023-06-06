import {
  workspace,
  FileType,
  OutputChannel,
  Uri
} from 'vscode';

import { getOutputChannel } from '../output';
/**
 * Checks if the given folder exists using workspace.fs API.
 *
 * @param folder Folder Uri.
 */
export async function folderExists(folder: Uri): Promise<boolean> {
  try {
    const fileStat = await workspace.fs.stat(folder);
    if (fileStat.type === FileType.Directory) {
      return true;
    }
  }
  catch (error) {
    return false;
  }
  return false;
}

/**
 * Copies template folder to the destination project folder.
 *
 * @param templateFolder Template folder Uri.
 * @param destinationFolder Destination folder Uri.
 */
export async function copyFolder(templateFolder: Uri, destinationFolder: Uri): Promise<boolean> {
  // display folder copy progress in the output channel
  const outputChannel: OutputChannel = getOutputChannel();
  outputChannel.show();
  outputChannel.appendLine('\nCreating project from template ...');
  outputChannel.appendLine(`- Template Project: ${templateFolder.fsPath}\n`);

  try {
    await workspace.fs.copy(templateFolder, destinationFolder, { overwrite: false });
    outputChannel.appendLine(`✔ New project created successfully.`);
    return true;
  }
  catch (error) {
    outputChannel.appendLine('✗ Error copying template project:');
    outputChannel.appendLine(` ${error}`);
    return false;
  }
}

/**
 * Deletes a folder from the open project workspace
 * ussing workspace.fs API.
 *
 * @param relativeFolderPath Relative folder path to delete.
 * @returns True if the folder is deleted, and false otherwise.
 */
export async function deleteFolder(relativeFolderPath: string): Promise<boolean> {
  const workspaceFolders = workspace.workspaceFolders;
  if (workspaceFolders) {
    for (const folder of workspaceFolders) {
      const folderUri: Uri = Uri.joinPath(folder.uri, relativeFolderPath);
      if (await folderExists(folderUri)) {
        try {
          await workspace.fs.delete(folderUri, { recursive: true });
          return true;
        }
        catch (error) {
          return false;
        }
      }
    }
  }
  return false;
}

/**
 * Deletes a file from the project workspace.
 *
 * @param relativeFilePath Relative file path to delete.
 * @returns True if the file is deleted, and false otherwise.
 */
export async function deleteFile(relativeFilePath: string): Promise<boolean> {
  const workspaceFolders = workspace.workspaceFolders;
  if (workspaceFolders) {
    for (const folder of workspaceFolders) {
      const fileUri: Uri = Uri.joinPath(folder.uri, relativeFilePath);
      try {
        const fileStat = await workspace.fs.stat(fileUri);
        if (fileStat.type === FileType.File) {
          await workspace.fs.delete(fileUri);
          return true;
        }
      }
      catch (error) {
      }
    }
  }
  return false;
}
