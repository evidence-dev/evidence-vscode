import {
  window,
  StatusBarAlignment,
  StatusBarItem
} from 'vscode';

/**
 * Status bar UI component for Evidence app status updates.
 */
class StatusBar {

  private statusBarItem: StatusBarItem;
  private readonly statusBarItemName: string = 'Evidence';
  private loadingWasHidden = false;

  /**
   * Creates new Evidence app status bar item instance.
   */
  constructor() {
    this.statusBarItem = window.createStatusBarItem(
      this.statusBarItemName,
      StatusBarAlignment.Left,
      -1e10,// align to the right
    );
    this.statusBarItem.text = '$(sync~spin) Evidence';
  }

  /**
   * Starts Evidence app status display.
   */
  startLoading(): void {
    if (this.loadingWasHidden) {
      return;
    }
    this.statusBarItem.show();
  }

  /**
   * Stops Evidence app status display.
   */
  stopLoading(): void {
    this.loadingWasHidden = true;
    this.statusBarItem.hide();
    this.statusBarItem.dispose();
  }

  dispose() {
    this.statusBarItem.dispose();
  }
}

export const statusBar = new StatusBar();
