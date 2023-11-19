import * as vscode from 'vscode';

export class MarkdownParser {
    extractSvelteCode(document: vscode.TextDocument): string {
        let svelteCode = '';
        const lines = document.getText().split(/\r?\n/);
        let inSvelteBlock = false;

        for (const line of lines) {
            // Detect the start of a Svelte block
            if (line.trim().startsWith('<') && !inSvelteBlock) {
                inSvelteBlock = true;
                svelteCode += line + '\n';
                continue;
            }

            // Detect the end of a Svelte block
            if (line.trim().endsWith('>') && inSvelteBlock) {
                inSvelteBlock = false;
                svelteCode += line + '\n';
                continue;
            }

            if (inSvelteBlock) {
                svelteCode += line + '\n';
            }
        }

        return svelteCode;
    }
}
