/* eslint-disable @typescript-eslint/naming-convention */
import {
  commands,
  window,
  Disposable,
  ExtensionContext,
} from 'vscode';

import {
  installDependencies,
  updateDependencies,
  buildProject,
  buildProjectStrict
} from './build';

import { createNewProject, openIndex } from './project';
import { createProjectFromTemplate } from './template';
import { startServer, stopServer} from './server';
import { preview } from './preview';
import { openSettingsFile, viewExtensionSettings, viewAppSettings } from './settings';
import { clearCache} from './cache';
import { showOutput } from '../output';

/**
 * VSCode and Evidence extension commands.
 */
export const enum Commands {
  // VS Code and built-in extenions commands
  Open = 'vscode.open',
  OpenFolder = 'vscode.openFolder',
  OpenSettings = 'workbench.action.openSettings',
  FocusActiveEditorGroup = 'workbench.action.focusActiveEditorGroup',
  NewWindow = 'workbench.action.newWindow',
  ReloadWindow = 'workbench.action.reloadWindow',
  MarkdownShowPreview = 'markdown.showPreview',
  ShowSimpleBrowser = 'simpleBrowser.show',
  SetContext = 'setContext',

  // Evidence extension commands
  NewProject = 'evidence.newProject',
  CreateProjectFromTemplate = 'evidence.createProjectFromTemplate',
  OpenProjectSettings = 'evidence.openSettings',
  InstallDependencies = 'evidence.installDependencies',
  UpdateDependencies = 'evidence.updateDependencies',
  StartServer = 'evidence.startServer',
  StopServer = 'evidence.stopServer',
  PreviewApp = 'evidence.preview',
  ViewExtensionSettings = 'evidence.viewSettings',
  ViewAppSettings = 'evidence.viewAppSettings',
  ClearCache = 'evidence.clearCache',
  BuildProject = 'evidence.build',
  BuildProjectStrict = 'evidence.buildStrict',
  ShowOutput = 'evidence.showOutput',
  OpenIndex = 'evidence.openIndex',
  OpenSimpleBrowser = 'simpleBrowser.api.open'
}

let _context: ExtensionContext;

/**
 * Registers Evidence extension commands.
 *
 * @param context Extension context.
 */
export function registerCommands(context: ExtensionContext) {
  _context = context;

  // regiester Evidence extension commands
  registerCommand(Commands.NewProject, createNewProject);
  registerCommand(Commands.CreateProjectFromTemplate, createProjectFromTemplate);
  registerCommand(Commands.OpenProjectSettings, openSettingsFile);
  registerCommand(Commands.InstallDependencies, installDependencies);
  registerCommand(Commands.UpdateDependencies, updateDependencies);
  registerCommand(Commands.StartServer, startServer);
  registerCommand(Commands.StopServer, stopServer);
  registerCommand(Commands.PreviewApp, preview);
  registerCommand(Commands.ViewExtensionSettings, viewExtensionSettings);
  registerCommand(Commands.ViewAppSettings, viewAppSettings);
  registerCommand(Commands.ClearCache, clearCache);
  registerCommand(Commands.BuildProject, buildProject);
  registerCommand(Commands.BuildProjectStrict, buildProjectStrict);
  registerCommand(Commands.ShowOutput, showOutput);
  registerCommand(Commands.OpenIndex, openIndex);
}

/**
 * Registers extension command.
 *
 * @param commandId Command id.
 * @param callback Command callback.
 * @param thisArg The `this` context used when invoking the handler function.
 */
function registerCommand(commandId: string, callback: (...args: any[]) => any, thisArg?: any): void {
  const command: Disposable = commands.registerCommand(commandId, async (...args) => {
    try {
      await callback(...args);
    }
    catch (e: unknown) {
      window.showErrorMessage(String(e));
      console.error(e);
    }
  }, thisArg);
  _context.subscriptions.push(command);
}
