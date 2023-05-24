
import {
  window,
  workspace,
  Uri
} from 'vscode';

import { deleteFolder } from '../utils/fsUtils';

/**
 * Evidence application cache directory.
 */
const cachePath = '.evidence/template/.evidence-queries';

/**
 * Deletes Evidence application cache directory.
 */
export async function clearCache() {
  if (await deleteFolder(cachePath)) {
    window.showInformationMessage('Cleared Evidence application cache.');
  }
  else {
    window.showWarningMessage('There is no Evidence application cache directory to delete.');
  }
}
