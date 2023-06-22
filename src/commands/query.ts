import { extensions, window, commands, ExtensionContext} from 'vscode';
import { IExtension, IExtensionPlugin, IDriverExtensionApi } from '@sqltools/types';

export async function activate(context: ExtensionContext) {
  // load the SQLTools extension
  const sqltools = extensions.getExtension<IExtension>('mtxr.sqltools');
  if (sqltools) {
    if (!sqltools.isActive) {
      await sqltools.activate();
    }
  }
  // register the command
  context.subscriptions.push(commands.registerCommand('evidence.runQuery', runQuery));
}


export async function runQuery(name: string, query: string) {
  const sqltools = extensions.getExtension<IExtension>('mtxr.sqltools');
  if (sqltools) {
    if (!sqltools.isActive) {
      await sqltools.activate();
    }
    try {
      commands.executeCommand('sqltools.executeQuery', query);
    } catch (error) {
      console.error('Error executing query with SQLTools:', error);
    }
  } else {
    // Prompt user to install SQLTools
    window.showInformationMessage('Running queries in VSCode requires the SQLTools extension, install?', 'Install', 'View In Marketplace').then(choice => {
      if (choice === 'Install') {
        commands.executeCommand('workbench.extensions.installExtension', 'mtxr.sqltools');
      } else if (choice === 'View In Marketplace') {
        commands.executeCommand('workbench.extensions.action.showExtensionsWithIds', ['mtxr.sqltools']);
      }
    }
    );
  }
}