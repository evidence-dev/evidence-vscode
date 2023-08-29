import { extensions, window, commands, ExtensionContext, workspace} from 'vscode';
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
    if (!sqltools.isActive) {
      await sqltools.activate();
    }
    // check which database is being used
    let settings = await readEvidenceSettingsFile();
    let matchingDB =false;
    supportedSqlToolsDrivers.forEach(async (db: any) => {
      if (db.id === settings.database) {
        //check if the driver is installed
        matchingDB = true;
        let driver = extensions.getExtension(db.extensionId);
        if (driver) {
          try {
            // sync settings from evidence to sqltools
            await syncSettings();
            // check if it is a chained query by looking for ${...} in the query with regex
            let isChainedQuery = query.match(/\${.*}/); 
            if (isChainedQuery) {
              let compiledQuery = await getCompiledQuery(name);
              try {
                commands.executeCommand('sqltools.executeQuery', compiledQuery);
              } catch (error) {
                console.error(error);
              }
            } else {
              commands.executeCommand('sqltools.executeQuery', query);
            }
          } catch (error) {
            console.error('Error executing query with SQLTools:', error);
          }
        } else {
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

/* Gets compiled query from evidennce file system. 
/  This will fail if Evidence has not run since the query was created.
/  And it will return old queries if the user has not saved the file containing the SQL, or if they are not on the right evidence page.
/  Maybe this is too broken and we should disable chained queries for now.
*/
export async function getCompiledQuery(name: string) {
  // read in compiled queries from .evidence/template/extracted/queries.json
  // return the query with the matching name
  let queryFiles = await workspace.findFiles('.evidence/template/.evidence-queries/extracted/**/queries.json');
  if(queryFiles.length>0)
  {
    let queries = await workspace.fs.readFile(queryFiles[0]);
    let queryList = JSON.parse(queries.toString());
    let matchingQuery = queryList.find((q: any) => q.id === name);
    // return compiled query
    if (matchingQuery){
      return matchingQuery.compiledQueryString;
    } else {
      window.showErrorMessage(`No compiled query found with name ${name}: Chained queries require Evidence to be running.`);
      throw new Error(`No chanied query found with name ${name}: Chained queries require Evidence to be running.`);
    }
  }
}