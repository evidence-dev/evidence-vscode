import {workspace, window, Uri} from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { telemetryService } from '../extension';
import { isUSQL } from '../utils/jsonUtils';

function capitalizeWords(str: string) {
  return str.toLowerCase().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.substring(1)
  ).join(' ');
}

export async function createTemplatedPageFromQuery() {
  telemetryService.sendEvent('createTemplatedPageFromQuery');
    const activeEditor = window.activeTextEditor;
    if (!activeEditor || !activeEditor.document.fileName.endsWith('.sql') || 
     !activeEditor.document.fileName.includes(await isUSQL() ? '/queries/' : '/sources/')) {
      window.showWarningMessage(`This command can only be run from within a .sql file in your ${await isUSQL() ? 'sources' : 'queries'} folder`, {modal: true});
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

    const legacyIndexContent = `---\ntitle: ${capitalizeWords(sqlFileName)}\nsources:\n   - ${sqlFileName}: ${sqlFileName}.sql\n---\n\nClick on an item to see more detail\n\n\n\`\`\`sql ${sqlFileName}_with_link\nselect *, '/${sqlFileName}/' || ${columnName} as link\nfrom \$\{${sqlFileName}\}\n\`\`\`\n\n<DataTable data={${sqlFileName}_with_link} link=link/>\n`;
    const usqlIndexContent = `---\ntitle: ${capitalizeWords(sqlFileName)}\nqueries:\n   - ${sqlFileName}: ${sqlFileName}.sql\n---\n\nClick on an item to see more detail\n\n\n\`\`\`sql ${sqlFileName}_with_link\nselect *, '/${sqlFileName}/' || ${columnName} as link\nfrom \$\{${sqlFileName}\}\n\`\`\`\n\n<DataTable data={${sqlFileName}_with_link} link=link/>\n`;
    const legacyColumnFileContent = `---\nsources:\n   - ${sqlFileName}: ${sqlFileName}.sql\n---\n\n# {$page.params.${columnName}}\n\n<DataTable data={${sqlFileName}.filter(d => d.${columnName} === $page.params.${columnName})}/>\n`;
    const usqlColumnFileContent = `---\nqueries:\n   - ${sqlFileName}: ${sqlFileName}.sql\n---\n\n# {params.${columnName}}\n\n\`\`\`sql ${sqlFileName}_filtered\nselect * from \$\{${sqlFileName}\}\nwhere ${columnName} = '\$\{params.${columnName}\}'\n\`\`\`\n\n<DataTable data={${sqlFileName}_filtered}/>\n`;

    fs.writeFileSync(indexPath, await isUSQL() ? usqlIndexContent : legacyIndexContent);
    fs.writeFileSync(columnFilePath,  await isUSQL() ? usqlColumnFileContent : legacyColumnFileContent);

    // Open the templated markdown file
    const columnFileUri = Uri.file(columnFilePath);
    const document = await workspace.openTextDocument(columnFileUri);
    await window.showTextDocument(document);
    telemetryService.sendEvent('templatedPageCreated');
}
