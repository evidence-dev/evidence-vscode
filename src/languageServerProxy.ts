import * as vscode from 'vscode';
import * as path from 'path';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient/node';

export class LanguageServerProxy {
    private client: LanguageClient | null = null;
    private extensionPath: string;

    constructor(extensionPath: string) {
        this.extensionPath = extensionPath;
    }

    startOrUpdateServer(uri?: vscode.Uri, content?: string, version?: number): void {
      // Start the language server if it's not already running
      if (!this.client) {
          const serverModule = path.join(this.extensionPath, 'node_modules', 'svelte-language-server', 'bin', 'server.js');
          console.log(`Svelte Language Server Path: ${serverModule}`);
  
          const serverOptions: ServerOptions = {
              command: 'node',
              args: [serverModule, 'no-tsconfig'],
              transport: TransportKind.stdio
          };
  
          const clientOptions: LanguageClientOptions = {
              documentSelector: [{ scheme: 'file', language: 'svelte'}],
              synchronize: {
                  // Watch for changes in node_modules of the specific package
                  fileEvents: vscode.workspace.createFileSystemWatcher(
                      '**/node_modules/@evidence-dev/core-components/dist/unsorted/viz/*'
                  )
              },
              // Optionally, set the workspace folder if `uri` is defined
              workspaceFolder: uri ? vscode.workspace.getWorkspaceFolder(uri) : undefined
          };

          console.log(`log: ${uri}`);
  
          this.client = new LanguageClient(
              'svelteLanguageServer',
              'Svelte Language Server',
              serverOptions,
              clientOptions
          );
  
          this.client.start();
          console.log('Starting server!!!!');
      }
  
      // Send the updated content to the language server
      if (this.client && uri && content && version) {
          const documentUri = uri.toString();
          const languageId = 'svelte';
          const textDocument = { uri: documentUri, languageId, version, text: content };
          const params = { textDocument, contentChanges: [{ text: content }] };
          this.client.sendNotification('textDocument/didChange', params);
      }
  }
  
  
    openDocument(uri: vscode.Uri, content: string): void {
      if (this.client) {
          const documentUri = uri.toString();
          const languageId = 'svelte'; 
          const version = 1; // Initial version number for a new document
          const textDocument = { uri: documentUri, languageId, version, text: content };
  
          const params = {
              textDocument
          };
          console.log(params.textDocument.uri);
  
          this.client.sendNotification('textDocument/didOpen', params);
      }
  }

    stopServer(): void {
        if (this.client) {
            this.client.stop();
            this.client = null;
        }
    }
}
