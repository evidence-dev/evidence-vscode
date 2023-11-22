import {workspace, window, Uri} from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { telemetryService } from '../extension';

export async function createTemplatedPageFromQuery() {
  telemetryService.sendEvent('createTemplatedPageFromQuery');
    const activeEditor = window.activeTextEditor;
    if (!activeEditor || !activeEditor.document.fileName.endsWith('.sql') || 
     !activeEditor.document.fileName.includes('/sources/')) {
      window.showWarningMessage("This command can only be run from within a .sql file in your sources folder", {modal: true});
      telemetryService.sendEvent('createTemplatedPageSqlWarning');
    return;
}

    const columnName = await window.showInputBox({ prompt: 'Enter the column name containing the identifier for your templated items (e.g., customer_id)' });
    if (!columnName) {
        return; // User cancelled the input box
    }

    const workspaceFolders = workspace.workspaceFolders;
    if (!workspaceFolders) {
        window.showErrorMessage("No workspace folder is open.");
        return;
    }

  const projectRoot = workspaceFolders[0].uri.fsPath;
    const sqlFileName = path.basename(activeEditor.document.fileName, '.sql');
    const newFolderPath = path.join(projectRoot, 'pages', sqlFileName);
    fs.mkdirSync(newFolderPath, { recursive: true });

    const indexPath = path.join(newFolderPath, 'index.md');
    const columnFilePath = path.join(newFolderPath, `[${columnName}].md`);

    const indexContent = `---\ntitle: Index for ${sqlFileName}\nsources:\n   - ${sqlFileName}: ${sqlFileName}.sql\n---\n\n<DataTable data={${sqlFileName}} link=link/>\n`;
    const columnFileContent = `---\nsources:\n   - ${sqlFileName}: ${sqlFileName}.sql\n---\n\n# {$page.params.${columnName}}\n\n<DataTable data={${sqlFileName}.filter(d => d.${columnName} === $page.params.${columnName})}/>\n`;

    fs.writeFileSync(indexPath, indexContent);
    fs.writeFileSync(columnFilePath, columnFileContent);

    // Open the templated markdown file
    const columnFileUri = Uri.file(columnFilePath);
    const document = await workspace.openTextDocument(columnFileUri);
    await window.showTextDocument(document);
    telemetryService.sendEvent('templatedPageCreated');
}
