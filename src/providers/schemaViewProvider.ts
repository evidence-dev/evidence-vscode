import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getManifest } from '../utils/jsonUtils';

export class SchemaViewProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  constructor(private manifestUri: vscode.Uri) {}

  getTreeItem(element: SchemaItem | TableItem | ColumnItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: SchemaItem | TableItem | ColumnItem): Thenable<vscode.TreeItem[]> {
    if (!this.manifestUri) {
      // should we add a warning or info box?
      return Promise.resolve([]);
    }

    if (element instanceof SchemaItem) {
      return element.getTables();
    } else if (element instanceof TableItem) {
      return Promise.resolve(element.columns);
    } else {
      if (this.pathExists(this.manifestUri)) {
        return this.getSchemaFiles(this.manifestUri);
      } else {
        return Promise.resolve([]);
      }
    }
  }

  private async getSchemaFiles(manifestUri: vscode.Uri): Promise<SchemaItem[]> {
    const manifest = await getManifest(manifestUri);
    if (!manifest) {
      return [];
    }
    // ./.evidence/template/static/data/manifest.json -> ./.evidence/template
    const templateDirectory = path.dirname(path.dirname(path.dirname(manifestUri.fsPath)));

    return Object.entries(manifest.renderedFiles).map(([schemaName, schemaFiles]) => {
      const schemaFilesUris = schemaFiles.map((schemaFile) => {
        const schemaFilePath = `${schemaFile.slice(0, -'.parquet'.length)}.schema.json`;
        return vscode.Uri.file(path.join(templateDirectory, schemaFilePath));
      });
      return new SchemaItem(schemaName, schemaFilesUris);
    });
  }

  private pathExists(p: vscode.Uri): boolean {
    return fs.existsSync(p.fsPath);
  }
}

class SchemaItem extends vscode.TreeItem {
  constructor(schema: string, private tables: vscode.Uri[]) {
    super(schema, vscode.TreeItemCollapsibleState.Collapsed);
    this.tooltip = schema;
  }
  
  async getTables(): Promise<TableItem[]> {
    return Promise.all(this.tables.map(async (table) => {
      const tableName = path.basename(table.fsPath, '.schema.json');
      const tableContent = await vscode.workspace.fs.readFile(table);
      const tableJson = JSON.parse(Buffer.from(tableContent).toString());
      return new TableItem(tableName, tableJson);
    }));
  }

  // in the future: use each datasource icon for iconPath
}

type Table = { name: string, evidenceType: string }[];

class TableItem extends vscode.TreeItem {
  columns: ColumnItem[];

  constructor(name: string, table: Table) {
    super(name, vscode.TreeItemCollapsibleState.Collapsed);
    this.columns = table.map(({ name, evidenceType }) => new ColumnItem(name, evidenceType));
  }
}

class ColumnItem extends vscode.TreeItem {
  constructor(name: string, evidenceType: string) {
    super(name, vscode.TreeItemCollapsibleState.None);
    this.description = evidenceType;
  }

  // todo: convert evidenceType to iconPath like sqltools
}
