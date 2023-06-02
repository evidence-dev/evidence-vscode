import {
  window
} from 'vscode';

import { installDependencies } from '../commands/build';

export async function showInstallDependencies() {
  // prompt a user to install Evidence node.js dependencies
  window.showInformationMessage(
    'Would you like to install Evidence dev server dependencies?', 'Yes', 'No')
    .then((selection) => {
      if (selection === 'Yes') {
        installDependencies();
      }
    });

}