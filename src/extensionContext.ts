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
 * Gets extension file Uri for extension file.
 *
 * @param relativePath Relative extension file path.
 * @returns Extension file Uri.
 */
export function asAbsolutePath(relativePath: string): Uri {
  return Uri.file(extensionContext.asAbsolutePath(relativePath));
}
