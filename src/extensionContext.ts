import {
  ExtensionContext,
  Uri
} from 'vscode';

/**
 * Extension context reference.
 *
 * @internal
 */
let extensionContext: ExtensionContext;

/**
 * Saves extension context reference.
 *
 * @param context Extension context.
 */
export function setExtensionContext(context: ExtensionContext) {
  extensionContext = context;
}

/**
 * Gets extension context reference.
 *
 * @returns Extension context.
 */
export function getExtensionContext(): ExtensionContext {
  return extensionContext;
}

/**
 * Gets extension file Uri.
 *
 * @param relativeFilePath Relative extension file path.
 *
 * @returns Extension file Uri.
 */
export function getFileUri(relativeExtensionFilePath: string): Uri {
  return Uri.file(extensionContext.asAbsolutePath(relativeExtensionFilePath));
}
