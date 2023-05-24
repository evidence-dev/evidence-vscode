import {
  workspace,
  FileType,
  Uri
} from 'vscode';

/**
 * Deletes a folder from the workspace.
 *
 * @param relativeFolderPath Relative folder path to delete.
 * @returns True if the folder is deleted, otherwise false.
 */
export async function deleteFolder(relativeFolderPath: string): Promise<boolean> {
  const workspaceFolders = workspace.workspaceFolders;
  if (workspaceFolders) {
    for (const folder of workspaceFolders) {
      const folderUri: Uri = Uri.file(folder.uri.fsPath + '/' + relativeFolderPath);
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
