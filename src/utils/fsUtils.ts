import {
  workspace,
  FileType,
  Uri
} from 'vscode';

/**
 * Deletes a folder from the open project workspace.
 *
 * @param relativeFolderPath Relative folder path to delete.
 * @returns True if the folder is deleted, and false otherwise.
 */
export async function deleteFolder(relativeFolderPath: string): Promise<boolean> {
  const workspaceFolders = workspace.workspaceFolders;
  if (workspaceFolders) {
    for (const folder of workspaceFolders) {
      const folderUri: Uri = Uri.joinPath(folder.uri, relativeFolderPath);
      try {
        const fileStat = await workspace.fs.stat(folderUri);
        if (fileStat.type === FileType.Directory) {
          await workspace.fs.delete(folderUri, {recursive: true});
          return true;
        }
      }
      catch (error) {
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
