import * as vscode from 'vscode';

export function runQuery(query: string) {
  // Create a temporary TextDocument with the query code
  const uri = vscode.Uri.parse('untitled:' + 'query.sql');
  vscode.workspace.openTextDocument(uri).then(document => {
    // Modify the document's content with the query code
    vscode.window.showTextDocument(document, { preview: false }).then(editor => {
      editor.edit(editBuilder => {
        editBuilder.insert(new vscode.Position(0, 0), query);
      });
    });
  });
}