import {
  languages,
  window,
  workspace,
  ExtensionContext,
  ProgressLocation,
  TextEditor,
  DecorationOptions,
  Range,
  Position,
  commands
} from 'vscode';

import { Commands } from './commands/commands';

import { MarkdownSymbolProvider } from './providers/markdownSymbolProvider';
import { setExtensionContext } from './extensionContext';
import { registerCommands } from './commands/commands';
import { loadPackageJson, hasDependency } from './utils/jsonUtils';
import { Settings, getConfig, updateProjectContext } from './config';
import { startServer } from './commands/server';
import { openIndex, openWalkthrough } from './commands/project';
import { statusBar } from './statusBar';
import { closeTerminal } from './terminal';

export const enum Context {
  isNewLine = 'evidence.isNewLine'
}

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

/**
 * Activates Evidence vscode extension.
 *
 * @param context Extension context.
 */
export async function activate(context: ExtensionContext) {
  setExtensionContext(context);
  registerCommands(context);

  window.onDidChangeTextEditorSelection(
    () => {
      const openEditor = window.activeTextEditor;
      if(openEditor){
        decorate(openEditor);
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

  // check for evidence app files and dependencies in the loaded package.json
  if (workspace.workspaceFolders && evidenceFiles.length > 0 &&
    workspacePackageJson && hasDependency(workspacePackageJson, '@evidence-dev/evidence')) {

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
