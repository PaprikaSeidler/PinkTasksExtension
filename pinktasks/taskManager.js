const vscode = require('vscode');

class TaskManager {

    constructor() {
        this.todos = [];
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }

    refresh(updatedTodos) {
        const existing = this.todos.filter(t => t.file !== updatedTodos.file);
        this.todos = updatedTodos; // Replace with the new todos
        this._onDidChangeTreeData.fire();
    }

    getTasks() {
        return this.todos;
    }

    getTreeItem(element) {
        if (element.tasks) {
            const item = new vscode.TreeItem(element.file, vscode.TreeItemCollapsibleState.Expanded);
            return item;
        }
        else {
            const item = new vscode.TreeItem(element.task, vscode.TreeItemCollapsibleState.None);
            item.tooltip = `${element.task}`;
            item.description = true;
            item.contextValue = 'task';
            item.iconPath = new vscode.ThemeIcon('circle-outline');
            item.command = {
                command: 'pinktasks.openFile',
                title: 'Open Task',
                arguments: [element.file, element.line]
            };
            return item;
        }
    }

    getChildren(element) {
        if (!element) {
            return this.todos;        
        }
        else if (element.tasks) {
            return element.tasks.map(task => ({
                file: element.file,
                task: task.task,
                line: task.line
            }));
        }
        else {
            return [];
        }
    }

    async markAsDone(task, taskTag) {
        // Remove from UI
        const fileIndex = this.todos.findIndex(f => f.file === task.file);
        if (fileIndex !== -1) {
            const taskIndex = this.todos[fileIndex].tasks.findIndex(t => 
                t.task === task.task && t.line === task.line
            );
            if (taskIndex !== -1) {
                this.todos[fileIndex].tasks.splice(taskIndex, 1);
                if (this.todos[fileIndex].tasks.length === 0) {
                    this.todos.splice(fileIndex, 1);
                }
            }
        }
        
        // Delete from file
        await this.deleteCommentFromFile(task, taskTag);
        this._onDidChangeTreeData.fire();
    }

    async deleteCommentFromFile(task, taskTag) {
        try {
            const fullPath = vscode.Uri.file(`${vscode.workspace.workspaceFolders[0].uri.fsPath}/${task.file}`);
            const document = await vscode.workspace.openTextDocument(fullPath);
            const lineIndex = task.line - 1;
            const lineText = document.lineAt(lineIndex).text;
            
            const tagPattern = taskTag.join('|');
            const regex = new RegExp(`(?:\\/\\/|#|<!--|\\/\\*+)?\\s*(${tagPattern})\\s*[:\\-]?\\s+([^-*>]*)`, 'i');
            const match = lineText.match(regex);
            
            if (match) {
                const edit = new vscode.WorkspaceEdit();
                const commentStart = lineText.indexOf(match[0]);
                const beforeComment = lineText.substring(0, commentStart).trim();
                
                const range = beforeComment.length > 0 
                    ? new vscode.Range(lineIndex, commentStart, lineIndex, lineText.length)  // Keep code
                    : new vscode.Range(lineIndex, 0, lineIndex + 1, 0);                     // Delete line
                
                edit.delete(fullPath, range);
                await vscode.workspace.applyEdit(edit);
            }
        } catch (error) {
            console.error('Failed to delete comment:', error);
        }
    }

}

module.exports = TaskManager; 