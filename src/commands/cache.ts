
import {
  window,
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
    window.showInformationMessage('Cache cleared.');
  }
  else {
    window.showInformationMessage('Cache is already empty.');
  }
}
