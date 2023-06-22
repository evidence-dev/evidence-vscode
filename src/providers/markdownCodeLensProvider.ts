import * as vscode from 'vscode';

export class MarkdownCodeLensProvider implements vscode.CodeLensProvider {
    constructor() {
        console.log('Markdown CodeLens provider instantiated'); // Add this line to check instantiation
    }

    provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        const codeLenses: vscode.CodeLens[] = [];

        // Parse the Markdown file to extract code blocks
        const codeBlocks = parseCodeBlocks(document);

        // Create a CodeLens for each code block
        for (const codeBlock of codeBlocks) {
            const range = new vscode.Range(
                codeBlock.startLine, 0,  // Start position of the code block
                codeBlock.endLine, 0     // End position of the code block
            );

            const codeLens = new vscode.CodeLens(range);
            codeLens.command = {
                title: '$(play) Run Query',
                command: 'evidence.runQuery',
                arguments: [codeBlock.queryName, codeBlock.content]
            };

            codeLenses.push(codeLens);
        }

        return codeLenses;
    }

    resolveCodeLens(codeLens: vscode.CodeLens): vscode.CodeLens | Thenable<vscode.CodeLens> {
        return codeLens;
    }
}

function parseCodeBlocks(document: vscode.TextDocument): CodeBlock[] {
    const codeBlocks: CodeBlock[] = [];
    const regex = /```sql\s+(\w+)\n([\s\S]*?)\n```/g;
    let match;

    while ((match = regex.exec(document.getText()))) {
        const queryName = match[1];
        const content = match[2];
        const startLine = document.positionAt(match.index).line;
        const endLine = document.positionAt(match.index + match[0].length).line;

        codeBlocks.push({ queryName, content, startLine, endLine });
    }

    return codeBlocks;
}

interface CodeBlock {
    queryName: string;
    content: string;
    startLine: number;
    endLine: number;
}