import {
  window,
  StatusBarAlignment,
  StatusBarItem
} from 'vscode';

import { Commands } from './commands/commands';

/**
 * Status bar UI component for Evidence app status updates.
 */
class StatusBar {

  private statusBarItem: StatusBarItem;
  private readonly statusBarItemName: string = 'Evidence';

  /**
   * Creates new Evidence app status bar item instance.
   */
  constructor() {
    this.statusBarItem = window.createStatusBarItem(
      this.statusBarItemName,
      StatusBarAlignment.Left,
      3, // align priority
    );
  }

  /**
   * Sets app server status display to install dependencies.
   */
  showInstall(): void {
    this.statusBarItem.text = '$(debug-start) Evidence';
    this.statusBarItem.tooltip = 'Install dependencies';
    this.statusBarItem.command = Commands.InstallDependencies;
    this.statusBarItem.show();
  }

  /**
   * Sets installing dependencies app server status.
   */
  showInstalling(): void {
    this.statusBarItem.text = '$(sync~spin) Evidence';
    this.statusBarItem.tooltip = 'Installing dependencies ...';
    this.statusBarItem.command = Commands.InstallDependencies;
    this.statusBarItem.show();
  }

  /**
   * Sets app server status display to running.
   */
  showStart(): void {
    this.statusBarItem.text = '$(debug-start) Run Evidence';
    this.statusBarItem.tooltip = 'Start Evidence server';
    this.statusBarItem.command = Commands.StartServer;
    this.statusBarItem.show();
  }

  /**
   * Sets app server status display to running.
   */
  showRunning(): void {
    this.statusBarItem.text = '$(sync~spin) Starting Evidence';
    this.statusBarItem.tooltip = 'Starting Evidence server ...';
    this.statusBarItem.command = Commands.StopServer;
    this.statusBarItem.show();
  }

  /**
   * Sets app server status display to stop.
   */
  showStop(): void {
    this.statusBarItem.text = '$(debug-disconnect) Evidence Running (Click to Stop)';
    this.statusBarItem.tooltip = 'Stop Evidence server';
    this.statusBarItem.command = Commands.StopServer;
    this.statusBarItem.show();
  }

  /**
   * Disposes status bar item.
   */
  dispose() {
    this.statusBarItem.dispose();
  }
}

export const statusBar = new StatusBar();
