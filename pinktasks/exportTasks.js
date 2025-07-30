const vscode = require('vscode');
const fs = require('fs');

class ExportTasks {

    async exportJson(todoArray) {
        const content = JSON.stringify(todoArray, null, 2);

        const uri = await vscode.window.showSaveDialog({
            defaultUri: vscode.Uri.file('tasks.json'),
            filters: {
                'JSON files': ['json'],
                'All files': ['*']
            }
        });

        if (!uri) {
            vscode.window.showErrorMessage('Export cancelled.');
            return;
        }

        /* fs.writeFile(uri.fsPath, content, (error) => {
            if (error) {
                vscode.window.showErrorMessage(`Failed to export tasks: ${error.message}`);
            } else {
                vscode.window.showInformationMessage(`Tasks exported to ${uri.fsPath}`);
            }
        }); */
        const encoder = new TextEncoder(); // This ensures it's in the right format
    const uint8Array = encoder.encode(content);

    try {
        await vscode.workspace.fs.writeFile(uri, uint8Array);
        vscode.window.showInformationMessage(`Tasks exported to ${uri.fsPath}`);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to export tasks: ${error.message}`);
    }
    }

    async exportMarkdown(todoArray) {
        const content = this.generateMarkdown(todoArray);
        const uri = await vscode.window.showSaveDialog({
            defaultUri: vscode.Uri.file('tasks.md'),
            filters: {
                'Markdown files': ['md'],
                'All files': ['*']
            }
        });

        if (!uri) {
            vscode.window.showErrorMessage('Export cancelled.');
            return;
        }

        /*fs.writeFile(uri.fsPath, content, (error) => {
            if (error) {
                vscode.window.showErrorMessage(`Failed to export tasks: ${error.message}`);
            } else {
                vscode.window.showInformationMessage(`Tasks exported to ${uri.fsPath}`);
            }
        }); */
        const encoder = new TextEncoder();
        const uint8Array = encoder.encode(content);

        try {
            await vscode.workspace.fs.writeFile(uri, uint8Array);
            vscode.window.showInformationMessage(`Tasks exported to ${uri.fsPath}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to export tasks: ${error.message}`);
        }
    }

    generateMarkdown(todoArray) {
        let markdown = '# Task List\n\n';
        todoArray.forEach(({ file, tasks }) => {
            markdown += `## ${file}\n\n`;
            tasks.forEach(task => {
                markdown += `- [ ] ${task.task} (Line: ${task.line})\n`;
            });
            markdown += '\n';
        });
        return markdown;
    }
}

module.exports = ExportTasks;