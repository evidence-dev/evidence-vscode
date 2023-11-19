import {
  languages,
  window,
  workspace,
  ExtensionContext,
  ProgressLocation,
  TextEditor,
  DecorationOptions,
  TextDocument,
  Range,
  Position,
  Uri,
  commands,
  extensions
} from 'vscode';
import { VirtualDocumentProvider } from './virtualDocumentProvider';
import { LanguageServerProxy } from './languageServerProxy';
import { MarkdownParser } from './markdownParser';
import { TelemetryService } from './telemetryService';

import { Commands } from './commands/commands';

import { MarkdownSymbolProvider } from './providers/markdownSymbolProvider';
import { setExtensionContext } from './extensionContext';
import { registerCommands } from './commands/commands';
import { loadPackageJson, hasDependency, dependencyVersion } from './utils/jsonUtils';
import { Settings, getConfig, updateProjectContext } from './config';
import { startServer } from './commands/server';
import { openIndex, openWalkthrough } from './commands/project';
import { statusBar } from './statusBar';
import { closeTerminal } from './terminal';
import { isGitRepository } from './utils/gitCheck';
import * as path from 'path';
import * as fs from 'fs';

export const enum Context {
  isNewLine = 'evidence.isNewLine',
  isPagesDirectory = 'evidence.isPagesDirectory'
}

export let telemetryService: TelemetryService;

const decorationType = window.createTextEditorDecorationType({
  after: {
    contentText: " Press / for commands...",
    color: '#99999959'
  }
});


function decorate(editor: TextEditor) {
  let decorationsArray: DecorationOptions[] = [];
  const {text} = editor.document.lineAt(editor.selection.active.line);
  const position = editor.selection.active;

  let range = new Range(
    new Position(position.line, position.character),
    new Position(position.line, position.character)
  );

  let decoration = { range };

  // new lines are defined as empty (undefined) lines of code, plus any lines that are solely whitespace characters (spaces and tabs)
  if (text === undefined || /^\s*$/.test(text)) {
    decorationsArray.push(decoration);
    commands.executeCommand(Commands.SetContext, Context.isNewLine, true);  
  } else {
    commands.executeCommand(Commands.SetContext, Context.isNewLine, false);  
  }

    editor.setDecorations(decorationType, decorationsArray);
}

function isPagesDirectory(){
  const openEditor = window.activeTextEditor;
  let pageContext = false;
  // Set context for pages directory (only use Evidence markdown features within those files):
  if(openEditor && /\/pages\/|\\pages\\/.test(openEditor.document.uri.fsPath)){
   commands.executeCommand(Commands.SetContext, Context.isPagesDirectory, true);  
   pageContext = true;
  } else {
   commands.executeCommand(Commands.SetContext, Context.isPagesDirectory, false); 
   pageContext = false; 
  }
  return pageContext;
}












// This map will store URI -> Content mappings for virtual files
let virtualFileContents = new Map();

class VirtualDocumentContentProvider {
    provideTextDocumentContent(uri: { toString: () => any; }) {
        // Retrieve the content for the given URI
        const content = virtualFileContents.get(uri.toString());
        return content || 'Content not found';
    }
}

/**
 * Activates Evidence vscode extension.
 *
 * @param context Extension context.
 */
export async function activate(context: ExtensionContext) {
  setExtensionContext(context);
  registerCommands(context);

  const conentProvider = new VirtualDocumentContentProvider();
  const scheme = 'svelte'; 
  context.subscriptions.push(workspace.registerTextDocumentContentProvider(scheme, conentProvider));


  const virtualDocumentProvider = new VirtualDocumentProvider();
const languageServerProxy = new LanguageServerProxy(context.extensionPath);
const markdownParser = new MarkdownParser();

languageServerProxy.startOrUpdateServer(workspace.workspaceFolders?.[0].uri);

// Handle already open text documents
workspace.textDocuments.forEach(document => {
    if (document.languageId === 'emd') {
        const svelteCode = markdownParser.extractSvelteCode(document);
        const virtualUri = virtualDocumentProvider.getVirtualUri(document.uri);

        // Open the virtual document
        languageServerProxy.openDocument(virtualUri, svelteCode);

    }
});

// Handle opening of markdown files
const openTextDocumentHandler = workspace.onDidOpenTextDocument(async document => {
    if (document.languageId === 'emd') {
        handleDocumentOpen(document);
    }
});
context.subscriptions.push(openTextDocumentHandler);

// Register the virtual document provider and add to context.subscriptions
const virtualDocProviderDisposable = workspace.registerTextDocumentContentProvider('svelte', virtualDocumentProvider);
context.subscriptions.push(virtualDocProviderDisposable);

// Subscribe to the onDidChange event for virtualDocumentProvider
const onDidChangeDisposable = virtualDocumentProvider.onDidChange(async (uri) => {
    const virtualDocumentContent = await virtualDocumentProvider.provideTextDocumentContent(uri);
    virtualDocumentProvider.updateVirtualDocument(uri, virtualDocumentContent);
    const virtualUri = virtualDocumentProvider.getVirtualUri(uri);
    const version = virtualDocumentProvider.getDocumentVersion(virtualUri); // Get the updated document version
    languageServerProxy.startOrUpdateServer(virtualUri, virtualDocumentContent, version);
});
context.subscriptions.push(onDidChangeDisposable);

// Debounce setup for onDidChangeTextDocument
let debounceTimer: NodeJS.Timeout | null = null;

// Handle changes to markdown files
const changeTextDocumentHandler = workspace.onDidChangeTextDocument(event => {
    if (event.document.languageId === 'emd') {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(() => handleDocumentChange(event.document), 1000); // 500ms debounce time
    }
});
context.subscriptions.push(changeTextDocumentHandler);

// Function to handle document open
async function handleDocumentOpen(document: TextDocument) {
    const svelteCode = markdownParser.extractSvelteCode(document);
    
    // Open the document first
    const virtualUri = virtualDocumentProvider.getVirtualUri(document.uri);
    console.log(`virtUri=${virtualUri}`)
    languageServerProxy.openDocument(virtualUri, svelteCode);
    
    // Then handle document change
    handleDocumentChange(document);
}

// Function to handle document change
async function handleDocumentChange(document: TextDocument) {
    // console.log(`Document change detected: ${document.uri.toString()}`);
    const svelteCode = markdownParser.extractSvelteCode(document);
    // console.log(`Extracted Svelte code: ${svelteCode.substring(0, 100)}...`);
    
    const virtualUri = virtualDocumentProvider.getVirtualUri(document.uri);
    const version = virtualDocumentProvider.getDocumentVersion(virtualUri);
    virtualDocumentProvider.updateVirtualDocument(virtualUri, svelteCode);
    
    console.log(virtualUri.toString()); // Log the virtual URI
    languageServerProxy.startOrUpdateServer(virtualUri, svelteCode, version);
}

  // Set up telemetry
  const iK = '99ec224c-3fe8-4635-96ef-24c9aa5a354f'; 

  // create telemetry reporter on extension activation
  telemetryService = new TelemetryService(iK);
  // ensure it gets properly disposed. Upon disposal the events will be flushed
  context.subscriptions.push(telemetryService);

  // set up file watcher for .profile.json
  const workspaceFolder = workspace.workspaceFolders?.[0];
  if (workspaceFolder) {
    const profilePath = path.join(workspaceFolder.uri.fsPath, '.evidence', 'template', '.profile.json');
    const profileWatcher = workspace.createFileSystemWatcher(profilePath);
    
    const updateProfileDetailsFromJson = () => {
        try {
            const content = fs.readFileSync(profilePath, 'utf8');
            const profile = JSON.parse(content);
            telemetryService.updateProfileDetails(profile.anonymousId, profile.traits.projectCreated);
        } catch (err) {
            telemetryService.clearProfileDetails();
        }
    };

  profileWatcher.onDidChange(updateProfileDetailsFromJson);
  profileWatcher.onDidCreate(updateProfileDetailsFromJson);
  profileWatcher.onDidDelete(() => telemetryService.clearProfileDetails());

  context.subscriptions.push(profileWatcher);

  // Initial check
  updateProfileDetailsFromJson();

  // Git watcher
  const gitPath = path.join(workspaceFolder.uri.fsPath, '.git');
  const gitWatcher = workspace.createFileSystemWatcher(gitPath);

  const updateGitCheck = () => {
    try {
        const gitCheck = isGitRepository(workspaceFolder.uri.fsPath).toString();
        telemetryService.updateGitCheck(gitCheck);
    } catch (err) {
        telemetryService.clearGitCheck();
    }
};

  gitWatcher.onDidChange(updateGitCheck);
  gitWatcher.onDidCreate(updateGitCheck);
  gitWatcher.onDidDelete(() => telemetryService.clearGitCheck());

  context.subscriptions.push(gitWatcher);

  // initial check
  updateGitCheck();
}


  // decorate slash command on activation if the active file is a markdown file
  const openEditor = window.activeTextEditor;
  if(openEditor && openEditor.document.fileName.endsWith('.md') && isPagesDirectory()){
    decorate(openEditor);
  }

  // window.onDidChangeTextEditorSelection(
  //   () => {
  //     const openEditor = window.activeTextEditor;
  //     if(openEditor && openEditor.document.fileName.endsWith('.md') && isPagesDirectory()){
  //       decorate(openEditor);
  //     }
  //   }
  // );

  // Needed for delete key events which are not captured by the onDidChangeTextEditorSelection event
  // workspace.onDidChangeTextDocument(
  //   () => {
  //     const openEditor = window.activeTextEditor;
  //     if(openEditor && openEditor.document.fileName.endsWith('.md')  && isPagesDirectory()){
  //       decorate(openEditor);
  //     }
  //   }
  // );

    // When markdown file is saved:
    workspace.onDidSaveTextDocument(
      () => {
        const openEditor = window.activeTextEditor;
        if(openEditor && openEditor.document.fileName.endsWith('.md')  && isPagesDirectory()){
          telemetryService.sendEvent('saveMarkdown');
        }
      }
    );
  

  // register markdown symbol provider
  const markdownLanguage = { language: 'emd', scheme: 'file' };
  const provider = new MarkdownSymbolProvider();
  // languages.registerDocumentSymbolProvider(markdownLanguage, provider);

  // load package.json
  const workspacePackageJson = await loadPackageJson();

  // get all evidence files in workspace
  const evidenceFiles = await workspace.findFiles('**/.evidence/**/*.*');

  // get evidence version
  const evidenceVersion = dependencyVersion(workspacePackageJson, '@evidence-dev/evidence');

  // check for evidence app files and dependencies in the loaded package.json
  if (workspace.workspaceFolders && evidenceFiles.length > 0 &&
    workspacePackageJson && hasDependency(workspacePackageJson, '@evidence-dev/evidence')) {
    
    telemetryService.sendEvent('activate', {evidenceVersion: evidenceVersion});

    // set Evidence project context
    updateProjectContext();

    // get autoStart setting:
    const autoStart: boolean = <boolean>getConfig(Settings.AutoStart);

    // show start dev server status
    statusBar.showStart();

    // open index.md if no other files are open
    openIndex();

    if (autoStart) {
      startServer();
    }

  }

}

/**
 * Deactivates Evidence extension
 * and disposes extension resources.
 */
export function deactivate() {
  statusBar?.dispose();
  closeTerminal();
}
