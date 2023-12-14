import {
  window,
  workspace,
  commands,
  RelativePattern,
  Uri,
  WorkspaceFolder,
  OutputChannel,
  env,
  ProgressLocation
} from 'vscode';
import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import * as path from 'path';
import { sendCommand } from '../terminal';
import { isServerRunning, stopServer } from './server';
import { timeout } from '../utils/timer';
import { exec } from 'child_process';
import {
  Settings,
  getConfig,
  getWorkspaceFolder,
  updateProjectContext
} from '../config';

import { Commands } from './commands';
import { getOutputChannel } from '../output';
import { statusBar } from '../statusBar';
import { cloneTemplateRepository } from './template';
import { getExtensionFileUri } from '../extensionContext';
import { folderExists, copyFolder } from '../utils/fsUtils';
import { getPackageJsonFolder } from '../utils/jsonUtils';
import { openNewProjectFolder } from '../views/prompts';
import { telemetryService } from '../extension';

import {
  showSelectFolderDialog,
  showOpenFolder,
  showInvalidTemplateProjectUrlErrorMessage
} from '../views/prompts';

/**
 * Relative path to the built-in Evidence app /template folder
 *
 * @see https://github.com/evidence-dev/evidence-vscode/issues/61
 */
const extensionTemplateProjectFolderName: string = 'template';

/**
 * Default Evidence template project url setting value.
 *
 * @see https://github.com/evidence-dev/evidence-vscode/issues/62
 */
const templateProjectUrlSetting = 'https://github.com/evidence-dev/template';

/**
 * Creates a new Evidence project.
 *
 * @param {Uri} projectFolder Optional project folder Uri to create the project in.
 * @param {string} projectUrl Optional template project url to copy the project from. If not provided, the template project will be used.
 */
export async function createNewProject(projectFolder?: Uri, projectUrl?: string) {
  telemetryService.sendEvent('createNewProjectStart');

  if (!projectFolder) {
    const selectedFolders: Uri[] | undefined = await showSelectFolderDialog();
    if (!selectedFolders) {
      // user cancelled folder selection and new Evidence project creation action
      return;
    }
    else {
      // get the first selected folder
      projectFolder = selectedFolders[0];
    }
  }

  // get the list of files and folders in the selected new project folder
  const projectFiles = await workspace.fs.readDirectory(projectFolder);

  // check if the selected folder is empty
  if (projectFiles.length > 0 ) {

    // prompt to select an empty new project folder
    window.showErrorMessage(
     'Selected folder must be empty to create a new Evidence project.', {modal: true});

    // display create new project dialog again
    createNewProject();
    return;
  }

  // get new project folder absolute/full path
  const projectFolderPath = projectFolder.fsPath;

  // display creating new Evidence project status in the output channel
  const outputChannel: OutputChannel = getOutputChannel();
  outputChannel.show();
  outputChannel.appendLine('\nCreating new project ...');
  outputChannel.appendLine(`- New Project Folder: ${projectFolderPath}`);

  // use new evidence template project Url setting
  // @see https://github.com/evidence-dev/evidence-vscode/issues/62
  const templateProjectUrl =
    <string>getConfig(Settings.TemplateProjectUrl, templateProjectUrlSetting);
  
  // if the projectUrl is defined, use that instead of the templateProjectUrl
  const projectTemplateUrl = projectUrl ? projectUrl : templateProjectUrl;

  if (projectTemplateUrl.startsWith('https://')) {
    // attempt to clone an Evidence template project from a github repository
    // into the selected new Evidence project folder
    await cloneTemplateRepository(projectTemplateUrl, projectFolderPath);
  }
  else if (projectTemplateUrl.startsWith('file://')) {
    // create local template folder Uri to check if that template folder exists
    const templateFolder: Uri = Uri.file(projectTemplateUrl.replace('file://', ''));

    if (await folderExists(templateFolder)) {
      outputChannel.appendLine(`- Template Project Folder: ${templateFolder.fsPath}`);

      // create new Evidence project folder from the local user-defined template folder
      createProjectFolder(templateFolder, projectFolder);
    }
    else {
      // template folder specified in evidence.templateProjectUrl settings doesn't exist
      showInvalidTemplateProjectUrlErrorMessage(projectTemplateUrl);
      outputChannel.appendLine(`✗ Invalid Template Project Folder: ${projectTemplateUrl}`);
    }
  }
  else if (projectTemplateUrl === templateProjectUrlSetting) {

    // get built-in /template folder Uri from extension context
    const templateFolder: Uri = getExtensionFileUri(extensionTemplateProjectFolderName);

    if (await folderExists(templateFolder)) {
      outputChannel.appendLine(`- Template Project Folder: ${templateFolder.fsPath}`);

      // create new Evidence project folder from the built-in /template
      createProjectFolder(templateFolder, projectFolder);
    }
    else {
      // invalid built-in /template folder path
      showInvalidTemplateProjectUrlErrorMessage(templateFolder.fsPath);
      outputChannel.appendLine(`✗ Invalid Template Project Folder: ${templateFolder.fsPath}`);
    }
  }
  else {
    // invalid template project Uri scheme
    showInvalidTemplateProjectUrlErrorMessage(projectTemplateUrl);
    outputChannel.appendLine(`✗ Invalid Template Project Folder: ${projectTemplateUrl}`);
  }
  telemetryService.sendEvent('createNewProjectComplete');
}

/**
 * Copies an existing Evidence project from a remote repository, without retaining the git history.
 */
export async function copyProject(){
  // ask the user for the remote repository url
  const projectUrl = await window.showInputBox({
    prompt: 'Enter an Evidence repository URL to copy',
    ignoreFocusOut: true
  });
  // if the user cancelled the input box, return
  if(!projectUrl) {
    return;
  };
  telemetryService.sendEvent('copyProject');
  createNewProject(undefined, projectUrl);
  telemetryService.sendEvent('copyProject');
}

/**
 * Creates new Evidence project folder from a local template project folder.
 *
 * @param templateFolder Template folder Uri.
 * @param projectFolder Target Evidence project folder Uri.
 */
async function createProjectFolder(templateFolder: Uri, projectFolder: Uri) {
  // copy template folder to the new project folder
  const projectFolderCreated: boolean = await copyFolder(templateFolder, projectFolder);
  if (projectFolderCreated) {

    // If the environment is not Codespaces, remove the .devcontainer folder
    if (env.remoteName !== 'codespaces') {
      const devContainerPath = path.join(projectFolder.fsPath, '.devcontainer');
      try {
        await fs.rm(devContainerPath, { recursive: true, force: true });
      } catch (error) {
        // fail silently - leave the devcontainer folder in
      }
    }

      openNewProjectFolder(projectFolder);
  }
}

/**
 * Opens index.md if no other files are open in the VS Code Workspace
 *
 */
export async function openIndex() {
  let openMarkdownFiles = workspace.textDocuments.filter(doc => doc.fileName.endsWith('.md'));

  // check if evidence is in a subdirectory - don't open index/walkthrough if monorepo
  const packageJsonFolder = await getPackageJsonFolder();

  if (packageJsonFolder === '' && openMarkdownFiles.length === 0) {
    const folderPath = getWorkspaceFolder();
    const filePath = folderPath?.uri.toString() + '/pages/index.md';
    const fileUri = Uri.parse(filePath);
    await commands.executeCommand('vscode.open', fileUri, 1);
    await commands.executeCommand('vscode.open', fileUri, 2);
    openWalkthrough();
    telemetryService.sendEvent('openIndex');
  }
}

export async function openWalkthrough(){
  await commands.executeCommand(Commands.OpenWalkthrough, `Evidence.evidence-vscode#getStarted`, false);
  telemetryService.sendEvent('openWalkthrough');
}




// Scaffold USQL template project:

function isValidFolderName(folderName: string): boolean {
  return /^[a-z0-9\-_]+$/.test(folderName); // Adjust regex as needed
}

export async function migrateProjectToUSQL() {
    window.showWarningMessage(`Make sure your server is not running and you create a backup before attempting migration. \n\nThis migration script creates a backup in a folder called '_legacy_project', but there may be edge cases that cause unexpected behaviour`, {modal:true});

    telemetryService.sendEvent('migrateProjectToUSQL');
    const packageJsonFolder = await getPackageJsonFolder();
    if(packageJsonFolder !== ''){
      window.showErrorMessage('Migration command should only be run from within the Evidence folder workspace. You will need to use VS Code to open the folder as the current workspace.', {modal: true});
    } else {
      // const dataConnectors = ['bigquery', 'csv', 'duckdb', 'mssql', 'mysql', 'postgres', 'redshift', 'snowflake', 'sqlite', 'trino', 'databricks'];
    
      // const selectedDataConnector = await window.showQuickPick(dataConnectors, {
      //     placeHolder: 'Which data connector does your project use?',
      // });
  
      // if (!selectedDataConnector) {
      //     window.showErrorMessage('Data connector selection is required.');
      //     return;
      // }
  
      const dataSourceFolderName = await window.showInputBox({ 
          prompt: 'Provide a name to use for your data source folder (E.g., needful_things or bigquery)' 
      });
  
      if (!dataSourceFolderName || dataSourceFolderName.trim() === '') {
          window.showErrorMessage('Data source folder name is required.');
          return;
      }
  
      const validatedName = dataSourceFolderName.trim().toLowerCase();
  
      if (!isValidFolderName(validatedName)) {
          window.showErrorMessage('The data source folder name must be lowercase and must not contain spaces.', {modal: true});
          return;
      }
  
      const confirmation = await window.showInformationMessage(
          // `You inputted "${validatedName}", a ${selectedDataConnector} connection. Is this right?`, 
          `You inputted "${validatedName}". Is this right?`, 
          {modal: true},
          'Yes', 
          'No'
      );
  
      if (confirmation === 'Yes') {
  
                window.withProgress({
                  location: ProgressLocation.Notification,
                  title: "Migrating your project to USQL...",
                  cancellable: true
              }, async (progress) => {
                  const workspaceRoot = workspace.workspaceFolders![0].uri.fsPath;
                  const legacyProjectPath = path.join(workspaceRoot, '_legacy_project');

                  try {
                      progress.report({ message: "Moving files to legacy project..." });
                      await moveFilesToLegacyProject(workspaceRoot, legacyProjectPath);
                      
                      progress.report({ message: "Scaffolding USQL project..." });
                      await runDegitCommand(workspaceRoot);
                      await emptySpecificFolders(workspaceRoot, ['sources', 'components']);

                      progress.report({ message: "Creating data source folder..." });
                      await createDataSourceFolder(workspaceRoot, dataSourceFolderName);
                      // await createConnectionYamlFile(workspaceRoot, dataSourceFolderName, selectedDataConnector);

                      progress.report({ message: "Copying specific files..." });
                      await copySpecificFilesToDataSourceFolder(legacyProjectPath, workspaceRoot, dataSourceFolderName);
                      
                      progress.report({ message: "Copying folders from legacy project..." });
                      await copyFoldersFromLegacyProject(legacyProjectPath, workspaceRoot, dataSourceFolderName);
                      
                      progress.report({ message: "Migrating queries to USQL..." });
                      await migrateQueriesToUSQL(dataSourceFolderName);

                      telemetryService.sendEvent('migrateProjectToUSQL_success');

                      const readmePath = path.join(workspaceRoot, 'README.md');
                      const readmeUri = Uri.file(readmePath);

                      window.showTextDocument(readmeUri, { preview: false });

                    } catch (err) {
                      if (err instanceof Error) {
                          window.showErrorMessage('Error during project migration: ' + err.message);
                      } else {
                          // Handle the case where the error is not an Error instance
                          window.showErrorMessage('An unknown error occurred during project migration.');
                      }
                  }
              });
                  } else {
                    window.showErrorMessage('Data source folder name was not confirmed. Operation cancelled.', {modal: true});
                }
                }
                
}

async function createDataSourceFolder(workspaceRoot: string, dataSourceFolderName: string): Promise<void> {
  const dataSourceFolderPath = path.join(workspaceRoot, 'sources', dataSourceFolderName);
  await fs.mkdir(dataSourceFolderPath, { recursive: true });
}

// async function createConnectionYamlFile(workspaceRoot: string, dataSourceFolderName: string, dataConnectorType: string): Promise<void> {
//   const connectionYamlPath = path.join(workspaceRoot, 'sources', dataSourceFolderName, 'connection.yaml');
//   const connectionYamlContent = `name: ${dataSourceFolderName}\ntype: ${dataConnectorType}`;

//   await fs.writeFile(connectionYamlPath, connectionYamlContent, 'utf-8');
// }

async function copySpecificFilesToDataSourceFolder(legacyProjectPath: string, workspaceRoot: string, dataSourceFolderName: string): Promise<void> {
  const fileTypes = ['.duckdb', '.db', '.sqlite', '.sqlite3', '.csv', '.parquet'];
  const dataSourceFolderPath = path.join(workspaceRoot, 'sources', dataSourceFolderName);

  // Copy files from the root of legacy_project
  await copyFilesByType(legacyProjectPath, dataSourceFolderPath, fileTypes);

  // Copy files from the sources folder of legacy_project
  // const legacySourcesPath = path.join(legacyProjectPath, 'sources');
  // if (existsSync(legacySourcesPath)) {
  //     await copyFilesByType(legacySourcesPath, dataSourceFolderPath, fileTypes);
  // }
}

async function copyFilesByType(sourcePath: string, destinationPath: string, fileTypes: string[]): Promise<void> {
  const entries = await fs.readdir(sourcePath, { withFileTypes: true });
  for (const entry of entries) {
      if (entry.isFile() && fileTypes.includes(path.extname(entry.name))) {
          const srcFilePath = path.join(sourcePath, entry.name);
          const destFilePath = path.join(destinationPath, entry.name);
          await fs.copyFile(srcFilePath, destFilePath);
      }
  }
}


async function moveFilesToLegacyProject(workspaceRoot: string, legacyProjectPath: string): Promise<void> {
  await fs.mkdir(legacyProjectPath, { recursive: true });
  const entries = await fs.readdir(workspaceRoot, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name !== '_legacy_project' && entry.name !== '.git') { // Exclude .git folder
        const oldPath = path.join(workspaceRoot, entry.name);
        const newPath = path.join(legacyProjectPath, entry.name);
        await fs.rename(oldPath, newPath);
    }
}
}

async function runDegitCommand(workspaceRoot: string): Promise<void> {
  if (isServerRunning()) {
    stopServer();
    await timeout(1000);
  }

  const usqlTemplatePath = path.join(workspaceRoot, 'usql-template');

  await fs.mkdir(usqlTemplatePath, { recursive: true });

  return new Promise((resolve, reject) => {
    exec('npx degit evidence-dev/template#next usql-template', { cwd: workspaceRoot }, async (error, stdout, stderr) => {
        if (error) {
            reject(error);
            return;
        }
        console.log(stdout);

        // Move contents from usql-template to workspace root
        await moveContents(usqlTemplatePath, workspaceRoot);
        resolve();
    });
});
}

async function emptySpecificFolders(workspaceRoot: string, folderNames: string[]): Promise<void> {
  for (const folderName of folderNames) {
      const folderPath = path.join(workspaceRoot, folderName);

      if (existsSync(folderPath)) {
          const files = await fs.readdir(folderPath, { withFileTypes: true });

          for (const file of files) {
              const filePath = path.join(folderPath, file.name);
              if (file.isDirectory()) {
                  await removeDirectory(filePath);
              } else {
                  await fs.unlink(filePath);
              }
          }
      }
  }
}

async function copyFoldersFromLegacyProject(legacyProjectPath: string, workspaceRoot: string, dataSourceFolderName: string): Promise<void> {
  const foldersToCopy = ['pages', 'static', 'partials', 'components'];
  const sourcesFolder = 'sources';
  const queriesFolder = 'queries';

  // Process 'sources' folder separately
  const legacySourcesPath = path.join(legacyProjectPath, sourcesFolder);
  const newSourcesPath = path.join(workspaceRoot, sourcesFolder, dataSourceFolderName);

  if (existsSync(legacySourcesPath)) {
      await copyDirectory(legacySourcesPath, newSourcesPath);
  }

  // Process other folders
  for (const folder of foldersToCopy) {
      const sourcePath = path.join(legacyProjectPath, folder);
      const destPath = path.join(workspaceRoot, folder);

      if (folder === 'pages' && existsSync(destPath)) {
          await removeDirectory(destPath);
      }

      if (existsSync(sourcePath)) {
          await copyDirectory(sourcePath, destPath);
      }
  }

  // Create empty 'queries' folder
  const queriesPath = path.join(workspaceRoot, queriesFolder);
  if (!existsSync(queriesPath)) {
      await fs.mkdir(queriesPath, { recursive: true });
  }
}


async function removeDirectory(directoryPath: string) {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
      const entryPath = path.join(directoryPath, entry.name);
      entry.isDirectory() ? await removeDirectory(entryPath) : await fs.unlink(entryPath);
  }

  await fs.rmdir(directoryPath);
}

async function copyDirectory(source: string, destination: string, isSourcesFolder: boolean = false) {
  await fs.mkdir(destination, { recursive: true });
  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
      const srcPath = path.join(source, entry.name);
      const destPath = path.join(destination, entry.name);

      if (entry.isDirectory()) {
          await copyDirectory(srcPath, destPath, isSourcesFolder);
      } else if (entry.isFile()) {
          if (!isSourcesFolder || ['.csv', '.parquet', '.sql'].includes(path.extname(entry.name))) {
              await fs.copyFile(srcPath, destPath);
          }
      }
  }
}



async function moveContents(source: string, destination: string) {
  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
      const srcPath = path.join(source, entry.name);
      const destPath = path.join(destination, entry.name);

      await fs.rename(srcPath, destPath);
  }

  // Optionally, remove the now-empty usql-template directory
  await fs.rmdir(source);
}


// Migrate queries and syntax to USQL:


export function migrateQueriesToUSQL(sourcesFolder: string) {
          const workspaceFolders = workspace.workspaceFolders;

          if(workspaceFolders){
            const projectRoot = workspaceFolders[0].uri.fsPath;
            
            // Assuming 'pages' and 'queries' directories are at the root
            const pagesPath = path.join(projectRoot, 'pages');
            const queriesPath = path.join(projectRoot, 'queries');
            const sourcesPath = path.join(projectRoot, 'sources', sourcesFolder ?? '');

            if (!existsSync(sourcesPath)) {
                window.showErrorMessage(`The folder "${sourcesFolder}" cannot be found in the sources directory.`, {modal:true});
                return;
            }
            
            // change sources to queries in frontmatter:
            processDirectory(pagesPath, sourcesPath);
            createQueryFiles(sourcesPath, queriesPath);
          } else {
            window.showErrorMessage('No workspace folder is open.');
          }
}


// Function to recursively process .md files
async function processDirectory(directory: string, sourcesFolderPath: string): Promise<void> {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
          await processDirectory(fullPath, sourcesFolderPath);
      } else if (entry.isFile() && path.extname(entry.name) === '.md') {
          await handleMarkdownFile(fullPath, sourcesFolderPath);
      }
  }
}


// Handler function for each Markdown file
async function handleMarkdownFile(filePath: string, sourcesFolderPath: string): Promise<void> {
  // Here, you can call all the functions required to process the Markdown file
  await updateFrontmatterInFile(filePath);
  console.log('Chagned frontmatter to reference queries instead of sources');
  await processCodeFences(filePath, sourcesFolderPath);
  console.log('Extracted inline queries into source query files');
  await updatePageParamsSyntax(filePath);
  console.log('Updated page parameter syntax');
}


// Function to update frontmatter in a single file
async function updateFrontmatterInFile(filePath: string): Promise<void> {
  try {
      const content = await fs.readFile(filePath, 'utf8');
      const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
      const match = frontmatterRegex.exec(content);

      if (match) {
          let frontmatter = match[1];
          if (frontmatter.includes('sources:')) {
              frontmatter = frontmatter.replace(/sources:/g, 'queries:');
              const newContent = content.replace(match[0], `---\n${frontmatter}\n---`);
              await fs.writeFile(filePath, newContent, 'utf8');
          }
      }
  } catch (err) {
      if (err instanceof Error) {
          window.showErrorMessage('Error updating file: ' + filePath + ' - ' + err.message);
      } else {
          window.showErrorMessage('An unknown error occurred while processing: ' + filePath);
      }
  }
}


// Takes .sql files from sources directory and creates corresponding .sql files in the queries directory
async function createQueryFiles(sourcesFolderPath: string, queriesFolderPath: string): Promise<void> {
  try {
      const files = await fs.readdir(sourcesFolderPath);

      for (const file of files) {
          if (path.extname(file) === '.sql') {
              const filenameWithoutExtension = path.basename(file, '.sql');
              const newSqlContent = `select * from ${path.basename(sourcesFolderPath)}.${filenameWithoutExtension}`;
              const newFilePath = path.join(queriesFolderPath, filenameWithoutExtension + '.sql');

              await fs.writeFile(newFilePath, newSqlContent, 'utf8');
          }
      }
  } catch (err) {
      if (err instanceof Error) {
          window.showErrorMessage('Error creating query files: ' + err.message);
      } else {
          window.showErrorMessage('An unknown error occurred while creating query files');
      }
  }
}

async function processCodeFences(filePath: string, sourcesFolderPath: string): Promise<void> {
  try {
      let content = await fs.readFile(filePath, 'utf-8');

      // List of reserved language keywords to exclude
      const reservedLanguages = ['python', 'html', 'svelte', 'javascript', 'js', 'r'];
      const reservedPattern = reservedLanguages.join('|');

      // Regex to match SQL code fences with a query name, optionally preceded by 'sql', excluding reserved languages
      const codeFenceRegex = new RegExp(`\`\`\`(?!(?:${reservedPattern})\\s)(?:sql\\s+)?(\\w+)\\s*\\n([\\s\\S]*?)\`\`\``, 'g');
      let match;
      let replacements = [];

      while ((match = codeFenceRegex.exec(content)) !== null) {
          const [fullMatch, originalQueryName, queryContent] = match;

          // Skip processing if the queryContent contains a chained query pattern
          if (!/\$\{\w+\}/.test(queryContent)) {
              let newQueryName = await getUniqueQueryName(sourcesFolderPath, originalQueryName);
              const newFilePath = path.join(sourcesFolderPath, `${newQueryName}.sql`);

              await fs.writeFile(newFilePath, queryContent.trim(), 'utf-8');

              // Prepare replacement text for the markdown file
              const replacementQuery = `select * from ${path.basename(sourcesFolderPath)}.${newQueryName}`;
              const replacementText = fullMatch.replace(/\b\w+\s*\n/, `${newQueryName}\n`).replace(queryContent.trim(), replacementQuery);
              replacements.push({ fullMatch, replacementText, originalQueryName, newQueryName });
          }
      }

      // Replace code fences and references in the markdown file
      for (const { fullMatch, replacementText, originalQueryName, newQueryName } of replacements) {
          content = content.replace(fullMatch, replacementText);
          content = content.replace(new RegExp(`\\{${originalQueryName}\\}`, 'g'), `{${newQueryName}}`);
          content = content.replace(new RegExp(`\\{${originalQueryName}\\.`, 'g'), `{${newQueryName}.`);
      }

      await fs.writeFile(filePath, content, 'utf-8');
    } catch (err) {
      if (err instanceof Error) {
          console.error('Error processing code fences in file:', filePath, '-', err.message);
      } else {
          console.error('An unknown error occurred while processing code fences in file:', filePath);
      }
  }
}


async function getUniqueQueryName(sourcesFolderPath: string, baseName: string): Promise<string> {
  let counter = 1;
  let queryName = baseName;
  let queryFilePath = path.join(sourcesFolderPath, `${queryName}.sql`);

  while (existsSync(queryFilePath)) {
      queryName = `${baseName}${counter}`;
      queryFilePath = path.join(sourcesFolderPath, `${queryName}.sql`);
      counter++;
  }

  return queryName;
}


async function updatePageParamsSyntax(filePath: string): Promise<void> {
  try {
      let content = await fs.readFile(filePath, 'utf8');

      // Regex to find and replace the old page params syntax
      const pageParamsRegex = /\$page\.params\.(\w+)/g;
      const updatedContent = content.replace(pageParamsRegex, 'params.$1');

      await fs.writeFile(filePath, updatedContent, 'utf8');
  } catch (err) {
      if (err instanceof Error) {
          console.error('Error updating page params syntax in file:', filePath, '-', err.message);
      } else {
          console.error('An unknown error occurred while updating page params syntax in file:', filePath);
      }
  }
}
