import { workspace, Uri, window} from 'vscode';

// read in settings file from disk: /.evidence/template/evidence.settings.json
export async function readEvidenceSettingsFile() {
  const settingsFile = await workspace.findFiles('.evidence/template/evidence.settings.json');
  if (settingsFile.length > 0) {
    const settings = await workspace.fs.readFile(settingsFile[0]);
    console.log("Read" + settings.toString());
    return JSON.parse(settings.toString());
  }
  else {
    return null;
  }
}

function transformSettings(settings: EvidenceSettings) {
  let transformedSettings: SqlToolsSettings = {};

  if (settings.database === "snowflake") {
    transformedSettings = ({
      "sqltools.connections": [{
        "authenticator": settings.credentials.authenticator.toUpperCase(),
        "ocspOptions": {
          "ocspFailOpen": true
        },
        "snowflakeOptions": {
          "clientSessionKeepAlive": true,
          "clientSessionKeepAliveHeartbeatFrequency": 3600,
          "role": settings.credentials.role
        },
        "previewLimit": 50,
        "driver": "Snowflake",
        "name": "Snowflake",
        "account": settings.credentials.account,
        "username": settings.credentials.username,
        "password": settings.credentials.password,
        "database": settings.credentials.database,
        "warehouse": settings.credentials.warehouse
      }]
    });
  } else if (settings.database === "bigquery") {
    transformedSettings = ({
      "sqltools.connections": [{
      "name": "BigQuery",
      "authenticator": "CLI",
      "previewLimit": 50,
      "driver": "BigQuery",
      "projectId": settings.credentials.project_id
      }]
    });
  } else {
    throw new Error("Credential auto import not supported for this database, set up the connection in the SQLTools sidebar");
  }

  return transformedSettings;
}

async function writeSettingsFile(settings: object) {
  // check if settings file exists
  console.log("Checking for existing settings file...");
  const settingsFiles = await workspace.findFiles('.vscode/settings.json');
  // there should only be one settings file
  const settingsFile = settingsFiles[0];
  if (settingsFile) {
    console.log("Found settings file, overwriting...");
    await workspace.fs.writeFile(settingsFile, Buffer.from(JSON.stringify(settings, null, 2)));
    console.log("Wrote" + JSON.stringify(settings));
  } else {
    console.log("No settings file found, creating...");
    const workspaceFolder = workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      throw new Error("No workspace folder found");
    }
    const settingsFilePath = Uri.joinPath(workspaceFolder.uri, '.vscode/settings.json');
    await workspace.fs.writeFile(settingsFilePath, Buffer.from(JSON.stringify(settings, null, 2)));
    console.log("Wrote" + JSON.stringify(settings));
  }
}

// sync evidence credentials file to sqltools credentials file
export async function syncSettings() {
  console.log("Syncing settings...");
  let evidenceSettings: EvidenceSettings = await readEvidenceSettingsFile();
  let sqlToolsSettings: SqlToolsSettings;
  if (evidenceSettings) {
    try {
      sqlToolsSettings = transformSettings(evidenceSettings);
      writeSettingsFile(sqlToolsSettings);
    } catch (error) {
      // show info prompt
      window.showInformationMessage(error.message);
    }
    
  }
}


interface EvidenceSettings extends Object {
  database: string;
  credentials: {
    [key: string]: string;
  };
  localGitRepo: string;
}


interface SqlToolsSettings extends Object {
  "sqltools.connections"?: [
    {
      [key: string]: string | Object | null
    }
  ] | undefined;
}