import { extensions, window, commands, ExtensionContext } from 'vscode';
import { IExtension} from '@sqltools/types';
import { syncSettings, readEvidenceSettingsFile } from '../settings';

// TODO: move this to a settings file
const supportedSqlToolsDrivers = [
    {
      "id": "mssql",
      "name": "Microsoft SQL Server",
      "extensionId": "mtxr.sqltools-driver-mssql"
    },
    {
      "id": "mysql",
      "name": "MySQL",
      "extensionId": "mtxr.sqltools-driver-mysql"
    },
    {
      "id": "postgres",
      "name": "PostgreSQL",
      "extensionId": "mtxr.sqltools-driver-pg"
    },
    {
      "id": "sqlite",
      "name": "SQLite",
      "extensionId": "mtxr.sqltools-driver-sqlite"
    },
    {
      "id": "redshift",
      "name": "Amazon Redshift",
      "extensionId": "kj.sqltools-driver-redshift"
    },
    {
      "id": "bigquery",
      "name": "BigQuery",
      "extensionId": "Evidence.sqltools-bigquery-driver"
    },
    {
      "id": "snowflake",
      "name": "Snowflake",
      "extensionId": "koszti.snowflake-driver-for-sqltools"
    }
  ];

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
  // check if sqltools is installed
  if (sqltools) {
    console.log('SQLTools is installed');
    if (!sqltools.isActive) {
      await sqltools.activate();
    }
    // check which database is being used
    let settings = await readEvidenceSettingsFile();
    let matchingDB =false;
    supportedSqlToolsDrivers.forEach(async (db: any) => {
      if (db.id === settings.database) {
        console.log(`Found matching SQLTools driver for ${db.name}`);
        //check if the driver is installed
        matchingDB = true;
        let driver = extensions.getExtension(db.extensionId);
        if (driver) {
          console.log(`SQLTools ${db.name} driver is installed`);
          try {
            // sync settings from evidence to sqltools
            await syncSettings();
            commands.executeCommand('sqltools.executeQuery', query);
          } catch (error) {
            console.error('Error executing query with SQLTools:', error);
          }
        } else {
          console.log(`SQLTools ${db.name} driver is not installed`);
          // Prompt the user to install the driver
          const choice = await window.showInformationMessage(`Install the SQLTools ${db.name} driver?`, 'Install', 'View In Marketplace');
          if (choice === 'Install') {
            commands.executeCommand('workbench.extensions.installExtension', db.extensionId);
          } else if (choice === 'View In Marketplace') {
            commands.executeCommand('workbench.extensions.action.showExtensionsWithIds', [db.extensionId]);
          }
        }
      }
    });
    if (!matchingDB) {
      window.showErrorMessage(`No supported SQLTools driver found for: ${settings.database}`);
    }
  } else {
    //  Prompt the user to install sqltools
    const choice = await window.showInformationMessage(`Running queries in VSCode requires the SQLTools extension, install?`, 'Install', 'View In Marketplace');
    if (choice === 'Install') {
      commands.executeCommand('workbench.extensions.installExtension', 'mtxr.sqltools');
    }
    else if (choice === 'View In Marketplace') {
      commands.executeCommand('workbench.extensions.action.showExtensionsWithIds', ['mtxr.sqltools']);
    }
  }
}