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
    this.statusBarItem.text = '$(debug-start) Evidence';
    this.statusBarItem.command = Commands.StartServer;
  }

  /**
   * Sets app server status display to running.
   */
  showStart(): void {
    this.statusBarItem.text = '$(debug-start) Evidence';
    this.statusBarItem.command = Commands.StartServer;
    this.statusBarItem.show();
  }

  /**
   * Sets app server status display to running.
   */
  showRunning(): void {
    this.statusBarItem.text = '$(sync~spin) Evidence';
    this.statusBarItem.command = Commands.StopServer;
    this.statusBarItem.show();
  }

  /**
   * Sets app server status display to stop.
   */
  showStop(): void {
    this.statusBarItem.text = '$(debug-disconnect) Evidence';
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
