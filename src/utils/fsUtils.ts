import {
  workspace,
  FileType,
  Uri
} from 'vscode';

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
