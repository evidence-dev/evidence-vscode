import { workspace, window } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function createTemplatedPage() {
  const workspaceFolders = workspace.workspaceFolders;
  if (!workspaceFolders) {
      window.showWarningMessage("No workspace folder is open.");
      return;
  }

  const pageName = await window.showInputBox({ prompt: 'Enter the name for the templated page' });
  if (!pageName) {
      return; // User cancelled the input box
  }

  const workspaceFolder = workspaceFolders[0].uri.fsPath;
  const pagesDir = path.join(workspaceFolder, 'pages', pageName);
  fs.mkdirSync(pagesDir, { recursive: true });

  const indexPath = path.join(pagesDir, 'index.md');
  const templatedPath = path.join(pagesDir, `[${pageName}].md`);

  fs.writeFileSync(indexPath, `# Index page for ${pageName}\n\nThis is the index page for your templated page. It is recommended to include a "linked table" here to generate a link to each templated page.`);
  fs.writeFileSync(templatedPath, `# {$page.params.${pageName}}\n\nThis is a templated page for ${pageName}`);
}