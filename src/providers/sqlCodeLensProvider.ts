import {
  CodeLens,
  CodeLensProvider,
  CancellationToken,
  ProviderResult,
  TextDocument,
  Range,
  extensions,
} from 'vscode';

import { IExtension, IExtensionPlugin, IDriverExtensionApi } from '@sqltools/types';

export class SqlCodeLensProvider implements CodeLensProvider {
  // check if mtxr/sqltools is installed and if so diable the code lens
  async provideCodeLenses(document: TextDocument, token: CancellationToken): Promise<CodeLens[]> {
    // check
    const sqltools = extensions.getExtension<IExtension>('mtxr.sqltools');
    // if installed, dont enable the code lens - we will use the one from sqltools
    if (sqltools) {
      if (!sqltools.isActive) {
        await sqltools.activate();
      }
      return [];
    } else {
    // if not installed, enable the code lens
    const firstLine = document.lineAt(0);
    const range = new Range(0, 0, firstLine.lineNumber, firstLine.text.length);
    const command = {
      title: '$(play) Run Query',
      command: 'evidence.runQuery',
      arguments: [document.fileName, document.getText()]
    };

    const codeLens = new CodeLens(range, command);
    return [codeLens];
  }
  }

  resolveCodeLens?(codeLens: CodeLens, token: CancellationToken): ProviderResult<CodeLens> {
    return codeLens;
  }
  

}

export function deactivate() {}
