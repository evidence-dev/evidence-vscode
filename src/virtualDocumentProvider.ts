import * as vscode from 'vscode';

export class VirtualDocumentProvider implements vscode.TextDocumentContentProvider {
    private _documents = new Map<string, string>();
    private _documentVersions = new Map<string, number>(); // Map to store document versions
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

    public get onDidChange() {
        return this._onDidChange.event;
    }

    provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string> {
        return this._documents.get(uri.toString()) || '';
    }

    updateVirtualDocument(originalUri: vscode.Uri, content: string): void {
      const virtualUri = this.getVirtualUri(originalUri);
      const virtualUriString = virtualUri.toString();
  
      // Check if the content actually changed
      const existingContent = this._documents.get(virtualUriString);
      if (existingContent !== content) {
          this._documents.set(virtualUriString, content);
  
          // Increment the document version only if content changed
          const currentVersion = this._documentVersions.get(virtualUriString) || 0;
          this._documentVersions.set(virtualUriString, currentVersion + 1);
  
          // Fire the change event only if content changed
          this._onDidChange.fire(virtualUri);
  
          console.log(`Virtual document updated for: ${originalUri.toString()}`);
          console.log(`Content: ${content.substring(0, 100)}...`);
      } else {
          console.log(`No change in content for: ${originalUri.toString()}`);
      }
  }
  

    getDocumentVersion(uri: vscode.Uri): number {
        return this._documentVersions.get(uri.toString()) || 0;
    }

  getVirtualUri(originalUri: vscode.Uri): vscode.Uri {
    // Check if '.svelte' is already appended to avoid duplication
    if (!originalUri.path.endsWith('.svelte')) {
        // Create a new URI with the 'svelte' scheme and a modified path
        return originalUri.with({ scheme: 'svelte', path: `${originalUri.path}.svelte` });
        // return originalUri.with({ path: `${originalUri.path}.svelte` });
    }
    return originalUri;
}
}
